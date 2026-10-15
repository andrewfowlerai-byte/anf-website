import type {
  Answer, AnswerMap, ChangesOk, FileItem, FormMeta, MarkSectionOk, RowRemovedOk, SaveAnswerOk, SaveCellsOk,
  SectionState, TableRowValue,
} from './types'
import { rowsOf } from './logic'
import type { AckResult, Op } from './outbox'

/**
 * Pure merge functions behind the form's state.
 *
 * The page keeps three layers and shows their merge:
 *   1. server: answers, files and form meta as the server last confirmed them;
 *   2. the outbox: edits made here that are not confirmed yet (they win);
 *   3. memory-only overlays: text flagged as sensitive (shown in its field,
 *      never queued) and "holds" (a focused field keeps what it showed when a
 *      teammate's change arrived, until the person picks Keep yours or Use theirs).
 */

export interface ServerState {
  form: FormMeta
  answers: AnswerMap
  files: Record<string, FileItem>
}

export function newer(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a) return false
  if (!b) return true
  if (a === b) return false
  const ta = Date.parse(a)
  const tb = Date.parse(b)
  if (Number.isNaN(ta) || Number.isNaN(tb)) return a > b
  return ta > tb || (ta === tb && a > b)
}

export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null && b == null) return true
  try {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
  } catch {
    return false
  }
}

export function filesRecord(list: FileItem[]): Record<string, FileItem> {
  const out: Record<string, FileItem> = {}
  for (const f of list) out[f.id] = f
  return out
}

/** Applies one confirmed request (answer, cells, row, section or file) to the server layer. */
export function applyAck(prev: ServerState, ops: Op[], res: AckResult, isTable: (key: string) => boolean, myName: string): ServerState {
  const op = ops[0]
  if (!op) return prev
  switch (op.kind) {
    case 'answer': {
      const r = res as SaveAnswerOk
      const before = prev.answers[op.key]
      const v = isTable(op.key) ? before?.v ?? { rows: {} } : op.value ?? null
      return { ...prev, answers: { ...prev.answers, [op.key]: { v, s: op.state, by: r.by ?? myName, at: r.at } } }
    }
    case 'cell': {
      const r = res as SaveCellsOk
      const before = prev.answers[op.key]
      const rows = { ...rowsOf(before?.v), ...(r.rows ?? {}) }
      const at = before && newer(before.at, r.at) ? before.at : r.at
      return { ...prev, answers: { ...prev.answers, [op.key]: { v: { rows }, s: before?.s ?? null, by: myName, at } } }
    }
    case 'row': {
      const r = res as RowRemovedOk
      const before = prev.answers[op.key]
      const rows = { ...rowsOf(before?.v) }
      const row: TableRowValue = { ...(rows[op.row] ?? { _pos: Date.now() }) }
      if (op.removed) row._removed = true
      else delete row._removed
      row._by = myName
      row._at = r.at
      rows[op.row] = row
      const at = before && newer(before.at, r.at) ? before.at : r.at
      return { ...prev, answers: { ...prev.answers, [op.key]: { v: { rows }, s: before?.s ?? null, by: myName, at } } }
    }
    case 'section': {
      const r = res as MarkSectionOk
      return { ...prev, form: { ...prev.form, section_state: r.section_state ?? prev.form.section_state } }
    }
    case 'file': {
      const f = prev.files[op.fileId]
      if (!f) return prev
      return { ...prev, files: { ...prev.files, [f.id]: { ...f, removed: true } } }
    }
  }
}

export interface RemoteChange { key: string; before: Answer | undefined; after: Answer }

/** Merges a polling result. Returns the answers that really changed (newer and different). */
export function mergeChanges(prev: ServerState, ch: ChangesOk): { next: ServerState; changed: RemoteChange[] } {
  const changed: RemoteChange[] = []
  let answers = prev.answers
  for (const [key, remote] of Object.entries(ch.answers ?? {})) {
    const before = prev.answers[key]
    if (before && !newer(remote.at, before.at)) continue
    if (answers === prev.answers) answers = { ...prev.answers }
    answers[key] = remote
    if (!before || !sameValue(before.v, remote.v) || before.s !== remote.s) changed.push({ key, before, after: remote })
  }
  let files = prev.files
  for (const f of ch.files ?? []) {
    const before = prev.files[f.id]
    if (before && !newer(f.at, before.at) && !!before.removed === !!f.removed) continue
    if (files === prev.files) files = { ...prev.files }
    files[f.id] = f
  }
  return { next: { form: ch.form ?? prev.form, answers, files }, changed }
}

export type SensitiveOverlay = Record<string, unknown>

function cloneTable(eff: AnswerMap, key: string, cloned: Set<string>): Record<string, TableRowValue> {
  const base = eff[key]
  const rows = rowsOf(base?.v)
  if (cloned.has(key)) return rows
  cloned.add(key)
  const copy: Record<string, TableRowValue> = { ...rows }
  eff[key] = { v: { rows: copy }, s: base?.s ?? null, by: base?.by ?? null, at: base?.at ?? '' }
  return copy
}

function setCell(eff: AnswerMap, cloned: Set<string>, rowCopied: Set<string>, key: string, row: string, col: string, v: string | null, pos?: number) {
  const rows = cloneTable(eff, key, cloned)
  const rk = `${key}\u0001${row}`
  if (!rowCopied.has(rk)) {
    rows[row] = { ...(rows[row] ?? { _pos: pos ?? Date.now() }) }
    rowCopied.add(rk)
  }
  rows[row][col] = v
}

/**
 * What the form shows: server answers, then queued edits on top, then holds,
 * then memory-only sensitive text. Copy-on-write, so untouched answers keep
 * their identity.
 */
export function effectiveAnswers(
  server: AnswerMap, ops: Op[], holds: Record<string, Answer>, sensitive: SensitiveOverlay, isTable: (key: string) => boolean,
): AnswerMap {
  const hasHolds = Object.keys(holds).length > 0
  const hasSensitive = Object.keys(sensitive).length > 0
  if (!ops.length && !hasHolds && !hasSensitive) return server
  const eff: AnswerMap = { ...server }
  const cloned = new Set<string>()
  const rowCopied = new Set<string>()
  for (const op of ops) {
    if (op.kind === 'answer') {
      const base = eff[op.key]
      if (isTable(op.key)) eff[op.key] = { v: base?.v ?? { rows: {} }, s: op.state, by: base?.by ?? null, at: base?.at ?? '' }
      else eff[op.key] = { v: op.value ?? null, s: op.state, by: base?.by ?? null, at: base?.at ?? '' }
      cloned.delete(op.key)
    } else if (op.kind === 'cell') {
      setCell(eff, cloned, rowCopied, op.key, op.row, op.col, op.v, op.pos)
    } else if (op.kind === 'row') {
      const rows = cloneTable(eff, op.key, cloned)
      const rk = `${op.key}\u0001${op.row}`
      if (!rowCopied.has(rk)) {
        rows[op.row] = { ...(rows[op.row] ?? { _pos: Date.now() }) }
        rowCopied.add(rk)
      }
      if (op.removed) rows[op.row]._removed = true
      else delete rows[op.row]._removed
    }
  }
  for (const [key, a] of Object.entries(holds)) eff[key] = a
  for (const [target, v] of Object.entries(sensitive)) {
    if (target.startsWith('answer:')) {
      const key = target.slice(7)
      const base = eff[key]
      eff[key] = { v, s: null, by: base?.by ?? null, at: base?.at ?? '' }
    } else if (target.startsWith('cell:')) {
      const [, key, row, ...colParts] = target.split(':')
      setCell(eff, cloned, rowCopied, key, row, colParts.join(':'), (v as string) ?? null)
    }
  }
  return eff
}

/** Section marks with queued marks on top. */
export function effectiveSectionState(server: Record<string, SectionState>, ops: Op[], myName: string): Record<string, SectionState> {
  let out = server
  for (const op of ops) {
    if (op.kind !== 'section') continue
    if (out === server) out = { ...server }
    out[op.section] = { ready: op.ready, by: myName, at: new Date(op.t).toISOString() }
  }
  return out
}
