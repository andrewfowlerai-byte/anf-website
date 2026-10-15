import type {
  AnswerState, ErrorCode, Fail, MarkSectionOk, PlainOk, RowRemovedOk, SaveAnswerOk, SaveCellsOk,
} from './types'
import { ONBOARD_LIMITS } from './types'
import { valueLooksSensitive } from './sensitive'
import { NetError } from './api'

/**
 * The outbox: every edit on the form becomes an op, and nothing typed is lost.
 *
 *   - Ops are keyed by target (answer:<key>, cell:<key>:<row>:<col>,
 *     row:<key>:<row>, section:<key>, file:<id>). A newer op for the same target
 *     replaces the older one.
 *   - Typed fields wait 800 ms after the last keystroke; choices, toggles, row
 *     removal and section marks go at once. flush() sends everything now (blur,
 *     pagehide, before Submit and before Mark this section done).
 *   - Up to 4 requests in flight, one per target. Cell ops of one table travel
 *     together, up to 500 cells a call.
 *   - Network errors, 5xx and timeouts retry with backoff 1, 2, 4, 8, 15, 30 and
 *     60 s, and at once on "online" and on focus. Refusals are permanent: the op
 *     stays (so the field keeps its value) with the code, and is not resent until
 *     the person edits it again.
 *   - not_open and closed hold the whole queue until the form opens again.
 *   - The queue is saved on this device (see DeviceRecord) so a reload, a dead
 *     battery or a closed tab sends it on the next visit.
 *
 * Text that looks like a card, Social Security or bank number is never queued
 * (enqueue refuses it), so it never reaches the server or this device's storage.
 */

export type OpBody =
  | { kind: 'answer'; key: string; value: unknown; state: AnswerState }
  | { kind: 'cell'; key: string; row: string; col: string; v: string | null; pos?: number }
  | { kind: 'row'; key: string; row: string; removed: boolean }
  | { kind: 'section'; section: string; ready: boolean }
  | { kind: 'file'; key: string; fileId: string }

export type Op = OpBody & {
  target: string
  seq: number
  /** Do not send before this time (typing debounce, the 8 s undo on file removal). */
  readyAt: number
  /** Retry backoff: do not send before this time. */
  nextAt: number
  tries: number
  failed: ErrorCode | null
  t: number
}

export type CellOp = Extract<Op, { kind: 'cell' }>

export function targetOf(b: OpBody): string {
  switch (b.kind) {
    case 'answer': return `answer:${b.key}`
    case 'cell': return `cell:${b.key}:${b.row}:${b.col}`
    case 'row': return `row:${b.key}:${b.row}`
    case 'section': return `section:${b.section}`
    case 'file': return `file:${b.fileId}`
  }
}

export interface Transport {
  answer(op: Extract<Op, { kind: 'answer' }>): Promise<SaveAnswerOk | Fail>
  cells(key: string, ops: CellOp[]): Promise<SaveCellsOk | Fail>
  row(op: Extract<Op, { kind: 'row' }>): Promise<RowRemovedOk | Fail>
  section(op: Extract<Op, { kind: 'section' }>): Promise<MarkSectionOk | Fail>
  file(op: Extract<Op, { kind: 'file' }>): Promise<PlainOk | Fail>
}

export type AckResult = SaveAnswerOk | SaveCellsOk | RowRemovedOk | MarkSectionOk | PlainOk

export interface OutboxOptions {
  transport: Transport
  /** Called once per request with the ops it carried and the server's answer, to update the known server state. */
  onAck: (ops: Op[], res: AckResult) => void
  /** Called when the server refuses an op for good (the field shows the message). */
  onRefused?: (op: Op, code: ErrorCode) => void
  /** Called when the server says the form is no longer open (not_open or closed). */
  onHold?: (code: 'not_open' | 'closed') => void
  /** Saves the queue on this device (debounced by the caller). */
  persist?: (ops: Op[]) => void
  /** Preview mode: keep ops on screen only; never send, never persist. */
  dryRun?: boolean
  initial?: Op[]
}

const BACKOFF_S = [1, 2, 4, 8, 15, 30, 60]
const MAX_REQUESTS = 4
export const TYPE_DELAY_MS = 800

const HOLD_CODES = new Set<ErrorCode>(['not_open', 'closed'])

export type SaveStatus =
  | { kind: 'saved' }
  | { kind: 'saving'; count: number }
  | { kind: 'retrying'; count: number }
  | { kind: 'offline'; count: number }
  | { kind: 'refused'; count: number }
  | { kind: 'held'; count: number }
  | { kind: 'preview' }

export class Outbox {
  private ops = new Map<string, Op>()
  private inflight = new Map<string, number>()
  private requests = 0
  private seq = 0
  private timer: ReturnType<typeof setTimeout> | null = null
  private listeners = new Set<() => void>()
  private opts: OutboxOptions
  private held: 'not_open' | 'closed' | null = null
  private offline = false
  private stopped = false
  /** target -> time the last op for it landed (for the per-field "Saved" note). */
  readonly landed = new Map<string, number>()
  version = 0

  constructor(opts: OutboxOptions) {
    this.opts = opts
    for (const op of opts.initial ?? []) {
      // Ops restored from the device go out right away; in-flight state is gone.
      this.ops.set(op.target, { ...op, readyAt: 0, nextAt: 0, tries: 0 })
      this.seq = Math.max(this.seq, op.seq)
    }
    this.offline = typeof navigator !== 'undefined' && navigator.onLine === false
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  private changed(persist = true) {
    this.version++
    for (const fn of this.listeners) fn()
    if (persist && !this.opts.dryRun) this.opts.persist?.(this.list())
  }

  list(): Op[] {
    return [...this.ops.values()].sort((a, b) => a.seq - b.seq)
  }

  get(target: string): Op | undefined {
    return this.ops.get(target)
  }

  has(target: string): boolean {
    return this.ops.has(target)
  }

  /** Ops not yet confirmed and not refused. */
  pendingCount(): number {
    let n = 0
    for (const op of this.ops.values()) if (!op.failed) n++
    return n
  }

  status(): SaveStatus {
    if (this.opts.dryRun) return { kind: 'preview' }
    let pending = 0
    let retrying = 0
    let refused = 0
    for (const op of this.ops.values()) {
      if (op.failed) refused++
      else {
        pending++
        if (op.tries > 0) retrying++
      }
    }
    if (pending && this.held) return { kind: 'held', count: pending }
    if (pending && this.offline) return { kind: 'offline', count: pending }
    if (retrying) return { kind: 'retrying', count: pending }
    if (pending) return { kind: 'saving', count: pending }
    if (refused) return { kind: 'refused', count: refused }
    return { kind: 'saved' }
  }

  /**
   * Queue an edit. Returns false (and queues nothing) when a string in it looks
   * like a card, Social Security or bank number. Any older op for the same
   * target is dropped in that case too, so a half-typed number never goes out.
   */
  enqueue(body: OpBody, opts: { delay?: number } = {}): boolean {
    const target = targetOf(body)
    if ((body.kind === 'answer' && valueLooksSensitive(body.value)) || (body.kind === 'cell' && valueLooksSensitive(body.v))) {
      if (this.ops.delete(target)) this.changed()
      return false
    }
    const now = Date.now()
    const op = { ...body, target, seq: ++this.seq, readyAt: now + (opts.delay ?? 0), nextAt: 0, tries: 0, failed: null, t: now } as Op
    this.ops.set(target, op)
    this.changed()
    this.pump()
    return true
  }

  /** Drop a queued op (Undo before an 8 s file removal, or "Use theirs"). In-flight sends still land. */
  cancel(target: string) {
    if (this.ops.delete(target)) this.changed()
  }

  /** Send now: everything, or the ops that match. */
  flush(match?: (op: Op) => boolean) {
    let any = false
    for (const op of this.ops.values()) {
      if (op.failed || (match && !match(op))) continue
      if (op.kind === 'file' && !match) continue // keep the undo window on file removal unless asked
      if (op.readyAt > Date.now()) {
        op.readyAt = 0
        any = true
      }
    }
    if (any) this.changed(false)
    this.pump()
  }

  /** Retry everything waiting on backoff (focus, "online"). */
  retryNow() {
    this.offline = typeof navigator !== 'undefined' && navigator.onLine === false
    for (const op of this.ops.values()) op.nextAt = 0
    this.changed(false)
    this.pump()
  }

  setOffline(off: boolean) {
    this.offline = off
    if (!off) this.retryNow()
    else this.changed(false)
  }

  /** Hold or release the queue (form submitted or closed, then open again). */
  setHeld(reason: 'not_open' | 'closed' | null) {
    if (this.held === reason) return
    this.held = reason
    if (!reason) for (const op of this.ops.values()) op.nextAt = 0
    this.changed(false)
    this.pump()
  }

  stop() {
    this.stopped = true
    if (this.timer) clearTimeout(this.timer)
    this.timer = null
  }

  private schedule(at: number) {
    if (this.stopped) return
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.timer = null
      this.pump()
    }, Math.max(0, at - Date.now()) + 5)
  }

  private eligible(op: Op, now: number): boolean {
    return !op.failed && op.readyAt <= now && op.nextAt <= now && !this.inflight.has(op.target)
  }

  pump() {
    if (this.stopped || this.opts.dryRun || this.held) return
    const now = Date.now()
    let nextWake = Infinity
    const ready: Op[] = []
    for (const op of this.list()) {
      if (op.failed) continue
      if (this.eligible(op, now)) ready.push(op)
      else if (!this.inflight.has(op.target)) nextWake = Math.min(nextWake, Math.max(op.readyAt, op.nextAt))
    }
    const usedTables = new Set<string>()
    for (const op of ready) {
      if (this.requests >= MAX_REQUESTS) break
      if (this.inflight.has(op.target)) continue
      if (op.kind === 'cell') {
        if (usedTables.has(op.key)) continue
        usedTables.add(op.key)
        const batch = ready.filter((o): o is CellOp => o.kind === 'cell' && o.key === op.key && !this.inflight.has(o.target)).slice(0, ONBOARD_LIMITS.cellsPerCall)
        void this.send(batch)
      } else {
        void this.send([op])
      }
    }
    if (nextWake < Infinity) this.schedule(nextWake)
  }

  private async send(batch: Op[]) {
    this.requests++
    for (const op of batch) this.inflight.set(op.target, op.seq)
    const first = batch[0]
    let res: AckResult | Fail
    try {
      const t = this.opts.transport
      if (first.kind === 'cell') res = await t.cells(first.key, batch as CellOp[])
      else if (first.kind === 'answer') res = await t.answer(first)
      else if (first.kind === 'row') res = await t.row(first)
      else if (first.kind === 'section') res = await t.section(first)
      else res = await t.file(first)
    } catch (e) {
      this.requests--
      for (const op of batch) this.inflight.delete(op.target)
      const now = Date.now()
      for (const op of batch) {
        const cur = this.ops.get(op.target)
        if (cur && cur.seq === op.seq) {
          cur.tries++
          cur.nextAt = now + BACKOFF_S[Math.min(cur.tries - 1, BACKOFF_S.length - 1)] * 1000
        }
      }
      this.offline = typeof navigator !== 'undefined' && navigator.onLine === false
      if (!(e instanceof NetError)) console.error('[onboard] save failed', e instanceof Error ? e.message : 'unknown error')
      this.changed(false)
      this.pump()
      return
    }
    this.requests--
    for (const op of batch) this.inflight.delete(op.target)
    this.offline = false
    if (res.ok) {
      const now = Date.now()
      this.opts.onAck(batch, res)
      for (const op of batch) {
        const cur = this.ops.get(op.target)
        if (cur && cur.seq === op.seq) this.ops.delete(op.target)
        this.landed.set(op.target, now)
      }
      this.changed()
    } else if (HOLD_CODES.has(res.code)) {
      this.held = res.code as 'not_open' | 'closed'
      this.opts.onHold?.(this.held)
      this.changed(false)
      return
    } else {
      for (const op of batch) {
        const cur = this.ops.get(op.target)
        if (cur && cur.seq === op.seq) {
          if (res.code === 'sensitive') this.ops.delete(op.target) // never keep it on the device
          else cur.failed = res.code
        }
        this.opts.onRefused?.(op, res.code)
      }
      this.changed()
    }
    this.pump()
  }

  /** Best effort on pagehide: the answer ops still waiting, for a keepalive beacon. */
  beaconable(): { key: string; value: unknown; state: AnswerState }[] {
    const out: { key: string; value: unknown; state: AnswerState }[] = []
    for (const op of this.list()) if (op.kind === 'answer' && !op.failed) out.push({ key: op.key, value: op.value, state: op.state })
    return out
  }
}

// ---------------------------------------------------------------------------
// The device record: what this browser keeps for one form.
// ---------------------------------------------------------------------------

export interface DeviceRecord {
  v: 1
  t: number
  name: string | null
  /** True once the name prompt was answered or skipped. */
  nameAsked: boolean
  ops: Op[]
  lastSection: string | null
  /** Files that were uploading when the page went away (shown as "Not uploaded"). */
  uploads: { key: string; name: string }[]
}

const DEVICE_PREFIX = 'anfsite.onboard.v1.'
const DEVICE_TTL_MS = 60 * 86400_000

export function emptyDevice(): DeviceRecord {
  return { v: 1, t: Date.now(), name: null, nameAsked: false, ops: [], lastSection: null, uploads: [] }
}

export function readDevice(hash16: string): DeviceRecord {
  try {
    const raw = window.localStorage.getItem(DEVICE_PREFIX + hash16)
    if (!raw) return emptyDevice()
    const rec = JSON.parse(raw) as DeviceRecord
    if (!rec || rec.v !== 1 || typeof rec.t !== 'number') return emptyDevice()
    if (Date.now() - rec.t > DEVICE_TTL_MS) {
      window.localStorage.removeItem(DEVICE_PREFIX + hash16)
      return emptyDevice()
    }
    // Belt and braces: never bring back a sensitive value, even if one slipped in.
    rec.ops = (rec.ops ?? []).filter((op) => !(op.kind === 'answer' && valueLooksSensitive(op.value)) && !(op.kind === 'cell' && valueLooksSensitive(op.v)))
    rec.uploads = rec.uploads ?? []
    return rec
  } catch {
    return emptyDevice()
  }
}

export function writeDevice(hash16: string, rec: DeviceRecord): void {
  try {
    window.localStorage.setItem(DEVICE_PREFIX + hash16, JSON.stringify({ ...rec, t: Date.now() }))
  } catch {
    // Storage full or blocked: the queue still lives in memory for this visit.
  }
}

/** The first 16 hex characters of SHA-256(token). Storage keys never hold the token itself. */
export async function tokenHash16(token: string): Promise<string> {
  try {
    if (crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
      return [...new Uint8Array(buf)].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    /* fall through: not a secure context */
  }
  // Not a secure context (a LAN address in development): a plain 64-bit FNV-1a.
  let h = 0xcbf29ce484222325n
  for (const ch of token) h = ((h ^ BigInt(ch.charCodeAt(0))) * 0x100000001b3n) & 0xffffffffffffffffn
  return h.toString(16).padStart(16, '0')
}
