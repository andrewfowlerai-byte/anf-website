import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  Answer, AnswerMap, AnswerState, ChangesOk, ErrorCode, FileItem, GetFormOk, OnboardingQuestion,
  OnboardingSnapshot, Role, SectionState,
} from './types'
import { ONBOARD_LIMITS } from './types'
import {
  buildModel, computeVisibility, filesByKey, isAnswered, isStillNeeded, linksOf, newRowId, pickFill, progress, tableRows,
  type OnboardingModel, type Progress, type TableRow, type Visibility,
} from './logic'
import { endsInLongNumber, looksSensitive, valueLooksSensitive } from './sensitive'
import { BAD_FILE_TYPE_MESSAGE, NetError, UPLOAD_TYPES, extensionOf, getBackend, type Backend } from './api'
import {
  Outbox, TYPE_DELAY_MS, readDevice, tokenHash16, writeDevice, type DeviceRecord, type Op, type SaveStatus, type Transport,
} from './outbox'
import { readCache, writeCache } from './cache'
import {
  applyAck, effectiveAnswers, effectiveSectionState, filesRecord, mergeChanges, sameValue, type ServerState,
} from './store'

/**
 * The controller behind /onboard/:token: loading, the outbox, polling for
 * teammates' edits, uploads, marks and submit. The page renders what this
 * returns and calls its actions; it holds no form logic of its own.
 */

export type Screen =
  | { kind: 'loading'; slow: boolean }
  | { kind: 'not_found' }
  | { kind: 'closed'; title: string | null }
  | { kind: 'offline' }
  | { kind: 'error' }
  | { kind: 'ready' }

export interface UploadItem {
  id: string
  key: string
  name: string
  size: number
  status: 'uploading' | 'failed' | 'lost'
  message?: string
}

export interface Conflict { remote: Answer }
export interface Flash { by: string; until: number }

const POLL_MS = 15_000
const POLL_IDLE_MS = 60_000
const IDLE_AFTER_MS = 10 * 60_000
const FLASH_MS = 4000
/**
 * Text that ends in a long run of digits may be a card or Social Security
 * number still being typed. It waits for the person to leave the field (or 30
 * seconds) instead of the usual 800 ms, so a typing pause never saves the first
 * digits of a number the full check would refuse.
 */
const NUMBER_HOLD_MS = 30_000

function typedDelay(v: unknown): number {
  return typeof v === 'string' && endsInLongNumber(v) ? NUMBER_HOLD_MS : TYPE_DELAY_MS
}

export const REFUSED_MESSAGES: Partial<Record<ErrorCode, string>> = {
  too_long: 'That is longer than this box takes. Try shortening it or upload it as a file.',
  owner_only: 'Only the owner\'s link can change this one.',
  unknown_key: 'This question changed since the page loaded. Reload the page to see the current version.',
  unknown_section: 'This section changed since the page loaded. Reload the page to see the current version.',
  wrong_type: 'That answer did not fit this box. Try typing it again.',
  bad_value: 'That answer did not fit this box. Try typing it again.',
  too_many: 'That is more than this question takes. Try removing a few.',
  bad_row: 'This table changed since the page loaded. Reload the page to see the current version.',
  bad_column: 'This table changed since the page loaded. Reload the page to see the current version.',
  bad_name: 'That name could not be used. Try your first name only.',
}

function cleanName(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, ONBOARD_LIMITS.nameMax)
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (!(e instanceof NetError)) throw e
      await sleep(800 * (i + 1))
    }
  }
  throw last
}

export function useOnboard(token: string, preview: boolean) {
  const [screen, setScreen] = useState<Screen>({ kind: 'loading', slow: false })
  const [attempt, setAttempt] = useState(0)
  const [template, setTemplate] = useState<OnboardingSnapshot | null>(null)
  const [role, setRole] = useState<Role>('owner')
  const [server, setServerSnap] = useState<ServerState | null>(null)
  const [fromCache, setFromCache] = useState(false)
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' || navigator.onLine !== false)
  const [name, setNameState] = useState<string | null>(null)
  const [nameAsked, setNameAsked] = useState(true)
  const [nameError, setNameError] = useState<string | null>(null)
  const [obVersion, setObVersion] = useState(0)
  const [sensitive, setSensitive] = useState<Record<string, unknown>>({})
  const [holds, setHolds] = useState<Record<string, Answer>>({})
  const [conflicts, setConflicts] = useState<Record<string, Conflict>>({})
  const [flashes, setFlashes] = useState<Record<string, Flash>>({})
  const [drafts, setDrafts] = useState<Record<string, { id: string; pos: number }[]>>({})
  const [uploads, setUploads] = useState<UploadItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [closedUnsent, setClosedUnsent] = useState<string>('')
  const [initialSection, setInitialSection] = useState<string | null>(null)
  const [outbox, setOutbox] = useState<Outbox | null>(null)
  const [justSaved, setJustSaved] = useState<Set<string>>(() => new Set())
  /** Owner link only: the team link's token, for "Copy the team link". */
  const [teamToken, setTeamToken] = useState<string | null>(null)

  const backendRef = useRef<Backend | null>(null)
  const outboxRef = useRef<Outbox | null>(null)
  const hashRef = useRef('')
  const deviceRef = useRef<DeviceRecord | null>(null)
  const nameRef = useRef('')
  const cursorRef = useRef('')
  const lastEditRef = useRef(0)
  const focusedRef = useRef<string | null>(null)
  const filesBlobRef = useRef(new Map<string, File>())
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollNowRef = useRef<() => void>(() => {})
  const modelRef = useRef<OnboardingModel | null>(null)
  const effRef = useRef<AnswerMap>({})
  const templateRef = useRef<OnboardingSnapshot | null>(null)
  const templateHashRef = useRef('')
  // The server layer lives in a ref so acks, polls and uploads apply in order
  // and synchronously; the state copy only drives rendering.
  const serverRef = useRef<ServerState | null>(null)
  const setServer = useCallback((fn: (prev: ServerState) => ServerState) => {
    const prev = serverRef.current
    if (!prev) return
    const next = fn(prev)
    if (next === prev) return
    serverRef.current = next
    setServerSnap(next)
  }, [])

  const model = useMemo(() => (template ? buildModel(template) : null), [template])
  useEffect(() => {
    modelRef.current = model
    templateRef.current = template
  }, [model, template])

  const isTable = useCallback((key: string) => modelRef.current?.byKey.get(key)?.type === 'table', [])
  const displayName = name || (role === 'owner' ? 'Owner link' : 'Team link')

  // ---------------------------------------------------------------- device record
  const persistNow = useCallback(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = null
    const rec = deviceRef.current
    if (!rec || !hashRef.current || preview) return
    rec.ops = outboxRef.current?.list() ?? rec.ops
    writeDevice(hashRef.current, rec)
  }, [preview])

  const persistSoon = useCallback(() => {
    if (preview) return
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(persistNow, 300)
  }, [persistNow, preview])

  // ---------------------------------------------------------------- load
  useEffect(() => {
    let cancelled = false
    const slow = setTimeout(() => {
      if (!cancelled) setScreen((s) => (s.kind === 'loading' ? { kind: 'loading', slow: true } : s))
    }, 15_000)

    const boot = (res: GetFormOk | { role: Role; form: GetFormOk['form']; answers: AnswerMap; files: FileItem[]; server_time: string }, tpl: OnboardingSnapshot, cached: boolean) => {
      const backend = backendRef.current!
      const dev = deviceRef.current!
      const transport: Transport = {
        answer: (op) => backend.saveAnswer(token, op.key, op.value, op.state, nameRef.current),
        cells: (key, ops) => backend.saveCells(token, key, ops.map((o) => ({ row: o.row, col: o.col, v: o.v })), nameRef.current),
        row: (op) => backend.setRowRemoved(token, op.key, op.row, op.removed, nameRef.current),
        section: (op) => backend.markSection(token, op.section, op.ready, nameRef.current),
        file: (op) => backend.removeFile(token, op.fileId, nameRef.current),
      }
      outboxRef.current?.stop()
      const ob = new Outbox({
        transport,
        dryRun: preview,
        initial: preview ? [] : dev.ops,
        persist: () => persistSoon(),
        onAck: (ops, ackRes) => {
          setServer((prev) => applyAck(prev, ops, ackRes, (k) => modelRef.current?.byKey.get(k)?.type === 'table', nameRef.current || (res.role === 'owner' ? 'Owner link' : 'Team link')))
          // Each field shows "Saved" for 2 s after its op lands.
          const targets = ops.map((o) => (o.kind === 'cell' ? `answer:${o.key}` : o.target))
          setJustSaved((cur) => new Set([...cur, ...targets]))
          setTimeout(() => setJustSaved((cur) => {
            const n = new Set(cur)
            for (const t of targets) n.delete(t)
            return n
          }), 2000)
        },
        onHold: () => pollNowRef.current(),
        onRefused: (op, code) => {
          if (code === 'sensitive') {
            // The server caught what the browser missed: keep it on screen only.
            if (op.kind === 'answer') setSensitive((s) => ({ ...s, [op.target]: op.value }))
            if (op.kind === 'cell') setSensitive((s) => ({ ...s, [op.target]: op.v }))
          }
        },
      })
      ob.subscribe(() => setObVersion(ob.version))
      outboxRef.current = ob
      setOutbox(ob)
      lastEditRef.current = Date.now()
      templateRef.current = tpl
      modelRef.current = buildModel(tpl)
      setTemplate(tpl)
      setRole(res.role)
      const initial: ServerState = { form: res.form, answers: res.answers ?? {}, files: filesRecord(res.files ?? []) }
      serverRef.current = initial
      setServerSnap(initial)
      if (res.form.status !== 'open') ob.setHeld('not_open')
      cursorRef.current = new Date(Date.parse(res.server_time) - 10_000).toISOString()
      setFromCache(cached)
      setUploads(dev.uploads.map((u, i) => ({ id: `lost_${i}`, key: u.key, name: u.name, size: 0, status: 'lost' as const })))
      dev.uploads = []
      setInitialSection(dev.lastSection)
      setScreen({ kind: 'ready' })
      ob.pump()
    }

    ;(async () => {
      try {
        // A malformed link never reaches the server.
        if (!/^[0-9a-f]{64}$/.test(token)) {
          setScreen({ kind: 'not_found' })
          return
        }
        const hash16 = await tokenHash16(token)
        if (cancelled) return
        hashRef.current = hash16
        const dev = readDevice(hash16)
        deviceRef.current = dev
        nameRef.current = dev.name ?? ''
        setNameState(dev.name)
        setNameAsked(preview ? true : dev.nameAsked)
        const [cached, backend] = await Promise.all([readCache(hash16), getBackend()])
        if (cancelled) return
        backendRef.current = backend
        let res: Awaited<ReturnType<Backend['getForm']>>
        try {
          res = await backend.getForm(token, preview, cached?.templateHash ?? null)
          if (res.ok && !res.template && !(cached && cached.templateHash === res.template_hash)) {
            res = await backend.getForm(token, preview, null)
          }
        } catch {
          if (cancelled) return
          if (cached) {
            templateHashRef.current = cached.templateHash
            boot({ role: cached.role, form: cached.form, answers: cached.answers, files: cached.files, server_time: cached.serverTime }, cached.template, true)
            return
          }
          setScreen(typeof navigator !== 'undefined' && navigator.onLine === false ? { kind: 'offline' } : { kind: 'error' })
          return
        }
        if (cancelled) return
        if (!res.ok) {
          if (res.code === 'closed') {
            setClosedUnsent(unsentText(dev.ops, cached?.template ?? null))
            setScreen({ kind: 'closed', title: res.title ?? null })
          } else setScreen({ kind: 'not_found' })
          return
        }
        const tpl = res.template ?? cached!.template
        templateHashRef.current = res.template_hash
        setTeamToken(res.role === 'owner' && typeof res.team_token === 'string' && /^[0-9a-f]{64}$/.test(res.team_token) ? res.team_token : null)
        boot(res, tpl, false)
        void writeCache({
          hash16, role: res.role, templateHash: res.template_hash, template: tpl, form: res.form, answers: res.answers,
          files: res.files, serverTime: res.server_time, savedAt: Date.now(),
        })
      } catch (e) {
        if (cancelled) return
        console.error('[onboard] load failed', e instanceof Error ? e.message : 'unknown error')
        setScreen({ kind: 'error' })
      } finally {
        clearTimeout(slow)
      }
    })()
    return () => {
      cancelled = true
      clearTimeout(slow)
    }
  }, [token, preview, attempt, persistSoon, setServer])

  useEffect(() => () => outboxRef.current?.stop(), [])

  const retryLoad = useCallback(() => {
    setScreen({ kind: 'loading', slow: false })
    setAttempt((n) => n + 1)
  }, [])

  // ---------------------------------------------------------------- hello
  const ready = screen.kind === 'ready'
  useEffect(() => {
    // Wait for the name prompt, so the people list does not gain a stray "Owner link".
    if (!ready || preview || !nameAsked || !backendRef.current) return
    backendRef.current.hello(token, nameRef.current).catch(() => {})
  }, [ready, preview, token, name, nameAsked])

  // ---------------------------------------------------------------- polling
  const applyChanges = useCallback((ch: ChangesOk) => {
    if (ch.cursor && (!cursorRef.current || ch.cursor > cursorRef.current)) cursorRef.current = ch.cursor
    // A replaced team link reaches the owner's page on the next poll.
    if (typeof ch.team_token === 'string' && /^[0-9a-f]{64}$/.test(ch.team_token)) setTeamToken(ch.team_token)
    const ob = outboxRef.current
    if (ob) ob.setHeld(ch.form?.status === 'open' ? null : 'not_open')
    const prev = serverRef.current
    if (!prev) return
    const { next, changed } = mergeChanges(prev, ch)
    serverRef.current = next
    setServerSnap(next)
    if (!changed.length) return
    const me = (nameRef.current || '').toLowerCase()
    const newConflicts: Record<string, Conflict> = {}
    const newHolds: Record<string, Answer> = {}
    const newFlashes: Record<string, Flash> = {}
    for (const c of changed) {
      if (modelRef.current?.byKey.get(c.key)?.type === 'table') continue
      const by = c.after.by ?? 'Someone'
      if (me && by.toLowerCase() === me) continue
      const pending = ob?.get(`answer:${c.key}`)
      const focused = focusedRef.current === c.key
      if (pending || focused) {
        const mine = effRef.current[c.key]
        if (mine && (!sameValue(mine.v, c.after.v) || mine.s !== c.after.s)) {
          newConflicts[c.key] = { remote: c.after }
          if (!pending && focused) newHolds[c.key] = mine
        }
      } else {
        newFlashes[c.key] = { by, until: Date.now() + FLASH_MS }
      }
    }
    if (Object.keys(newConflicts).length) setConflicts((st) => ({ ...st, ...newConflicts }))
    if (Object.keys(newHolds).length) setHolds((st) => ({ ...st, ...newHolds }))
    if (Object.keys(newFlashes).length) {
      setFlashes((st) => ({ ...st, ...newFlashes }))
      setTimeout(() => setFlashes((st) => {
        const now = Date.now()
        const out: Record<string, Flash> = {}
        for (const [k, f] of Object.entries(st)) if (f.until > now) out[k] = f
        return out
      }), FLASH_MS + 50)
    }
  }, [])

  useEffect(() => {
    if (!ready || fromCache && !online) return
    let timer: ReturnType<typeof setTimeout> | null = null
    let busy = false
    let stopped = false
    const schedule = () => {
      if (stopped) return
      if (timer) clearTimeout(timer)
      const idle = Date.now() - lastEditRef.current > IDLE_AFTER_MS
      timer = setTimeout(tick, idle ? POLL_IDLE_MS : POLL_MS)
    }
    const tick = async () => {
      if (stopped || busy) return
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
      const backend = backendRef.current
      if (!backend || !cursorRef.current) return schedule()
      busy = true
      try {
        const ch = await backend.getChanges(token, cursorRef.current)
        if (stopped) return
        if (!ch.ok) {
          if (ch.code === 'closed') {
            setClosedUnsent(unsentText(outboxRef.current?.list() ?? [], templateRef.current))
            setScreen({ kind: 'closed', title: ch.title ?? null })
          } else if (ch.code === 'not_found') setScreen({ kind: 'not_found' })
        } else {
          applyChanges(ch)
          if (fromCache) setFromCache(false)
        }
      } catch {
        /* offline or a blip: try again on the next tick */
      } finally {
        busy = false
        schedule()
      }
    }
    pollNowRef.current = () => { void tick() }
    const onWake = () => {
      if (document.visibilityState === 'visible') void tick()
    }
    window.addEventListener('focus', onWake)
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('online', onWake)
    schedule()
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      window.removeEventListener('focus', onWake)
      document.removeEventListener('visibilitychange', onWake)
      window.removeEventListener('online', onWake)
      pollNowRef.current = () => {}
    }
  }, [ready, token, applyChanges, fromCache, online])

  // ---------------------------------------------------------------- online, focus, pagehide
  useEffect(() => {
    const onOnline = () => {
      setOnline(true)
      outboxRef.current?.setOffline(false)
    }
    const onOffline = () => {
      setOnline(false)
      outboxRef.current?.setOffline(true)
    }
    const onFocus = () => outboxRef.current?.retryNow()
    const onHidden = () => {
      if (document.visibilityState === 'hidden') {
        outboxRef.current?.flush()
        persistNow()
      }
    }
    const onPageHide = () => {
      outboxRef.current?.flush()
      persistNow()
      const ob = outboxRef.current
      if (ob && !preview && backendRef.current) backendRef.current.beaconAnswers(token, nameRef.current, ob.beaconable())
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onHidden)
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onHidden)
      window.removeEventListener('pagehide', onPageHide)
    }
  }, [persistNow, preview, token])

  // Keep the cached snapshot fresh (best effort, at most every 30 s). The timer
  // reads the latest server layer when it fires, so a burst of changes is one write.
  const lastCacheWrite = useRef(0)
  const cacheTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (!server || !template || preview || cacheTimer.current) return
    const wait = Math.max(1000, 30_000 - (Date.now() - lastCacheWrite.current))
    cacheTimer.current = setTimeout(() => {
      cacheTimer.current = null
      lastCacheWrite.current = Date.now()
      const cur = serverRef.current
      if (!cur || !hashRef.current) return
      void writeCache({
        hash16: hashRef.current, role, templateHash: templateHashRef.current, template, form: cur.form, answers: cur.answers,
        files: Object.values(cur.files), serverTime: cursorRef.current || new Date().toISOString(), savedAt: Date.now(),
      })
    }, wait)
  }, [server, template, role, preview])
  useEffect(() => () => { if (cacheTimer.current) clearTimeout(cacheTimer.current) }, [])

  // ---------------------------------------------------------------- derived state
  const ops = useMemo<Op[]>(() => {
    void obVersion
    return outbox?.list() ?? []
  }, [outbox, obVersion])
  const effective = useMemo<AnswerMap>(() => {
    if (!server) return {}
    const tableKey = (k: string) => model?.byKey.get(k)?.type === 'table'
    return effectiveAnswers(server.answers, ops, holds, sensitive, tableKey)
  }, [server, ops, holds, sensitive, model])
  useEffect(() => { effRef.current = effective }, [effective])

  const filesList = useMemo(() => (server ? Object.values(server.files).filter((f) => !f.removed) : []), [server])
  const sectionState = useMemo<Record<string, SectionState>>(
    () => (server ? effectiveSectionState(server.form.section_state ?? {}, ops, displayName) : {}),
    [server, ops, displayName],
  )
  const visibility = useMemo<Visibility | null>(() => {
    if (!model || !server) return null
    return role === 'owner' ? computeVisibility(model, effective) : computeVisibility(model, effective, server.form.collapsed_phases ?? [])
  }, [model, server, effective, role])
  const prog = useMemo<Progress | null>(
    () => (model && visibility ? progress(model, effective, filesList, visibility, sectionState) : null),
    [model, visibility, effective, filesList, sectionState],
  )

  // answeredKeys drives progress and "Only unanswered"; neededKeys drives the
  // Needed before chips. "Not sure yet" is in the first and stays in the second.
  const { answeredKeys, neededKeys } = useMemo(() => {
    const answered = new Set<string>()
    const needed = new Set<string>()
    if (!model || !visibility) return { answeredKeys: answered, neededKeys: needed }
    const fk = filesByKey(filesList)
    for (const q of model.questions) {
      if (!visibility.shown.has(q.key)) continue
      const qFiles = fk.get(q.key) ?? []
      if (isAnswered(q, effective[q.key], qFiles, effective, visibility.shown)) answered.add(q.key)
      if (isStillNeeded(q, effective[q.key], qFiles, effective, visibility.shown)) needed.add(q.key)
    }
    return { answeredKeys: answered, neededKeys: needed }
  }, [model, visibility, effective, filesList])

  const refused = useMemo(() => {
    const out: Record<string, ErrorCode> = {}
    for (const op of ops) {
      if (!op.failed) continue
      if (op.kind === 'answer' || op.kind === 'cell' || op.kind === 'row' || op.kind === 'file') out[op.key] = op.failed
      else if (op.kind === 'section') out[`section:${op.section}`] = op.failed
    }
    return out
  }, [ops])

  const sensitiveKeys = useMemo(() => {
    const out = new Set<string>()
    for (const t of Object.keys(sensitive)) out.add(t.split(':')[1])
    return out
  }, [sensitive])

  // Text refused as a card, Social Security or bank number is never queued, so
  // the outbox does not know about it. Count it here, so the pill never says
  // "All changes saved" while a field holds text that was not saved.
  const saveStatus: SaveStatus = useMemo(() => {
    void obVersion
    const base: SaveStatus = outbox?.status() ?? { kind: 'saved' }
    const held = sensitiveKeys.size
    if (!held) return base
    if (base.kind === 'saved') return { kind: 'refused', count: held }
    if (base.kind === 'refused') return { kind: 'refused', count: base.count + held }
    return base
  }, [outbox, obVersion, sensitiveKeys])

  const status = server?.form.status ?? 'open'
  const readOnly = status !== 'open'

  // ---------------------------------------------------------------- actions
  const touchEdit = () => { lastEditRef.current = Date.now() }

  const clearOverlay = (target: string) => {
    setSensitive((s) => {
      if (!(target in s)) return s
      const n = { ...s }
      delete n[target]
      return n
    })
  }

  const setAnswer = useCallback((key: string, value: unknown, opts: { typed?: boolean } = {}) => {
    const ob = outboxRef.current
    if (!ob || readOnly) return
    touchEdit()
    const target = `answer:${key}`
    if (valueLooksSensitive(value)) {
      setSensitive((s) => ({ ...s, [target]: value }))
      ob.cancel(target)
      return
    }
    clearOverlay(target)
    ob.enqueue({ kind: 'answer', key, value: value === undefined ? null : value, state: null }, { delay: opts.typed ? typedDelay(value) : 0 })
  }, [readOnly])

  /** The stored value of an answer, ignoring memory-only sensitive text. */
  const storedValue = useCallback((key: string): unknown => {
    const op = outboxRef.current?.get(`answer:${key}`)
    if (op && op.kind === 'answer') return op.value
    return serverRef.current?.answers[key]?.v ?? null
  }, [])

  const setState = useCallback((key: string, state: AnswerState) => {
    const ob = outboxRef.current
    if (!ob || readOnly) return
    touchEdit()
    const value = isTable(key) ? null : storedValue(key)
    ob.enqueue({ kind: 'answer', key, value, state }, { delay: 0 })
  }, [readOnly, isTable, storedValue])

  const rowPos = (key: string, row: string): number | undefined => drafts[key]?.find((d) => d.id === row)?.pos

  const setCell = useCallback((key: string, row: string, col: string, v: string | null, opts: { typed?: boolean } = {}) => {
    const ob = outboxRef.current
    const m = modelRef.current
    if (!ob || !m || readOnly) return
    touchEdit()
    const target = `cell:${key}:${row}:${col}`
    if (looksSensitive(v)) {
      setSensitive((s) => ({ ...s, [target]: v }))
      ob.cancel(target)
      return
    }
    clearOverlay(target)
    const pos = rowPos(key, row)
    ob.enqueue({ kind: 'cell', key, row, col, v, pos }, { delay: opts.typed ? typedDelay(v) : 0 })
    // A pick from another table fills the empty cells that share a column key.
    const q = m.byKey.get(key)
    const column = q?.columns?.find((c) => c.key === col)
    if (q && column?.pickFrom && v) {
      const cur = tableRows(q, effRef.current, m).find((r) => r.id === row)
      const fills = pickFill(q, column, v, cur, effRef.current, m)
      for (const [fc, fv] of Object.entries(fills)) ob.enqueue({ kind: 'cell', key, row, col: fc, v: fv, pos }, { delay: opts.typed ? typedDelay(fv) : 0 })
    }
  }, [readOnly, drafts]) // eslint-disable-line react-hooks/exhaustive-deps

  const addRow = useCallback((key: string): string => {
    const id = newRowId()
    setDrafts((d) => ({ ...d, [key]: [...(d[key] ?? []), { id, pos: Date.now() }] }))
    return id
  }, [])

  const setRowRemoved = useCallback((key: string, row: string, removed: boolean) => {
    const ob = outboxRef.current
    if (!ob || readOnly) return
    touchEdit()
    const isDraft = drafts[key]?.some((d) => d.id === row)
    const cur = serverRef.current?.answers[key]
    const hasData = !!(cur && (cur.v as { rows?: Record<string, unknown> } | null)?.rows?.[row])
      || ob.list().some((op) => op.kind === 'cell' && op.key === key && op.row === row)
    if (isDraft && !hasData) {
      if (removed) setDrafts((d) => ({ ...d, [key]: (d[key] ?? []).filter((x) => x.id !== row) }))
      return
    }
    ob.enqueue({ kind: 'row', key, row, removed }, { delay: 0 })
  }, [readOnly, drafts])

  const importCells = useCallback((key: string, cells: { row: string; col: string; v: string }[]) => {
    const ob = outboxRef.current
    if (!ob || readOnly) return
    touchEdit()
    const base = Date.now()
    const posOf = new Map<string, number>()
    for (const c of cells) {
      if (!posOf.has(c.row)) posOf.set(c.row, base + posOf.size)
      ob.enqueue({ kind: 'cell', key, row: c.row, col: c.col, v: c.v, pos: posOf.get(c.row) }, { delay: 0 })
    }
  }, [readOnly])

  const removeFile = useCallback((file: FileItem) => {
    const ob = outboxRef.current
    if (!ob || readOnly) return
    touchEdit()
    ob.enqueue({ kind: 'file', key: file.key, fileId: file.id }, { delay: 8000 })
  }, [readOnly])

  const undoRemoveFile = useCallback((fileId: string) => outboxRef.current?.cancel(`file:${fileId}`), [])

  const setLinks = useCallback((key: string, links: string[]) => {
    const clean = links.map((l) => l.trim()).filter(Boolean).slice(0, ONBOARD_LIMITS.linksMax)
    setAnswer(key, clean.length ? { links: clean } : null)
  }, [setAnswer])

  const recordUploads = useCallback((list: UploadItem[]) => {
    const rec = deviceRef.current
    if (!rec) return
    rec.uploads = list.filter((u) => u.status === 'uploading').map((u) => ({ key: u.key, name: u.name }))
    persistSoon()
  }, [persistSoon])

  const updateUploads = useCallback((fn: (list: UploadItem[]) => UploadItem[]) => {
    setUploads((prev) => {
      const next = fn(prev)
      recordUploads(next)
      return next
    })
  }, [recordUploads])

  const runUpload = useCallback(async (item: UploadItem) => {
    const backend = backendRef.current
    const blob = filesBlobRef.current.get(item.id)
    if (!backend || !blob) {
      updateUploads((l) => l.map((u) => (u.id === item.id ? { ...u, status: 'lost' } : u)))
      return
    }
    updateUploads((l) => l.map((u) => (u.id === item.id ? { ...u, status: 'uploading', message: undefined } : u)))
    try {
      const start = await withRetry(() => backend.uploadStart(token, item.key, item.name, item.size))
      if (!start.ok) throw new Error(start.message)
      let putError: unknown = null
      try {
        await withRetry(() => backend.uploadPut(start, blob))
      } catch (e) {
        // The bytes may have landed even though the reply was lost (a retry then
        // fails on "already exists"). finish checks Storage, so ask it once.
        putError = e
      }
      const fin = putError
        ? await backend.uploadFinish(token, item.key, start.path, item.name, nameRef.current).catch(() => { throw putError })
        : await withRetry(() => backend.uploadFinish(token, item.key, start.path, item.name, nameRef.current))
      if (putError && !fin.ok) throw putError
      if (!fin.ok) throw new Error(fin.message)
      setServer((prev) => ({ ...prev, files: { ...prev.files, [fin.file.id]: fin.file } }))
      filesBlobRef.current.delete(item.id)
      updateUploads((l) => l.filter((u) => u.id !== item.id))
    } catch (e) {
      const message = e instanceof NetError || !(e instanceof Error)
        ? 'Not uploaded. Check your connection and try again.'
        : e.message
      updateUploads((l) => l.map((u) => (u.id === item.id ? { ...u, status: 'failed', message } : u)))
    }
  }, [token, updateUploads, setServer])

  const uploadFiles = useCallback((key: string, list: FileList | File[]) => {
    if (readOnly || preview) return
    touchEdit()
    const items: UploadItem[] = []
    for (const f of Array.from(list)) {
      const id = `up_${Math.random().toString(36).slice(2, 10)}`
      let message: string | undefined
      if (f.size > ONBOARD_LIMITS.fileBytesMax) message = 'That file is larger than 50 MB. Paste a share link in the box below instead.'
      else if (!UPLOAD_TYPES[extensionOf(f.name)]) message = BAD_FILE_TYPE_MESSAGE
      else if (f.size < 1) message = 'That file is empty.'
      const item: UploadItem = { id, key, name: f.name, size: f.size, status: message ? 'failed' : 'uploading', message }
      if (!message) filesBlobRef.current.set(id, f)
      items.push(item)
    }
    updateUploads((l) => [...l, ...items])
    void (async () => {
      for (const it of items) if (it.status === 'uploading') await runUpload(it)
    })()
  }, [readOnly, preview, updateUploads, runUpload])

  const retryUpload = useCallback((id: string) => {
    const item = uploads.find((u) => u.id === id)
    if (item) void runUpload(item)
  }, [uploads, runUpload])

  const dismissUpload = useCallback((id: string) => {
    filesBlobRef.current.delete(id)
    updateUploads((l) => l.filter((u) => u.id !== id))
  }, [updateUploads])

  const markSection = useCallback((section: string, ready: boolean) => {
    const ob = outboxRef.current
    if (!ob || readOnly) return
    touchEdit()
    ob.flush()
    ob.enqueue({ kind: 'section', section, ready }, { delay: 0 })
  }, [readOnly])

  const waitForDrain = async (ms: number) => {
    const end = Date.now() + ms
    const ob = outboxRef.current
    if (!ob) return true
    ob.flush()
    while (Date.now() < end) {
      if (ob.pendingCount() === 0) return true
      await sleep(200)
    }
    return ob.pendingCount() === 0
  }

  const submit = useCallback(async (): Promise<{ ok: boolean; message?: string }> => {
    const backend = backendRef.current
    if (!backend || preview) return { ok: false, message: 'Preview. Nothing you do here is saved.' }
    setSubmitting(true)
    try {
      const drained = await waitForDrain(8000)
      if (!drained) return { ok: false, message: 'Some answers are still saving. Check your connection, then try again.' }
      const res = await backend.submit(token, nameRef.current)
      if (!res.ok) {
        if (res.code === 'closed') setScreen({ kind: 'closed', title: res.title ?? null })
        return { ok: false, message: 'That did not go through. Try again in a moment.' }
      }
      const at = res.submitted_at ?? new Date().toISOString()
      setServer((prev) => ({ ...prev, form: { ...prev.form, status: 'submitted', submitted_at: prev.form.submitted_at && res.already ? prev.form.submitted_at : at, submitted_by_name: res.already ? prev.form.submitted_by_name : (nameRef.current || 'Owner link') } }))
      outboxRef.current?.setHeld('not_open')
      return { ok: true }
    } catch {
      return { ok: false, message: 'That did not go through. Check your connection and try again.' }
    } finally {
      setSubmitting(false)
    }
  }, [preview, token]) // eslint-disable-line react-hooks/exhaustive-deps

  const keepEditing = useCallback(async (): Promise<boolean> => {
    const backend = backendRef.current
    if (!backend || preview) return false
    try {
      const res = await backend.keepEditing(token, nameRef.current)
      if (!res.ok) return false
      setServer((prev) => ({ ...prev, form: { ...prev.form, status: 'open' } }))
      outboxRef.current?.setHeld(null)
      return true
    } catch {
      return false
    }
  }, [preview, token, setServer])

  const setName = useCallback((raw: string | null): boolean => {
    const n = raw == null ? '' : cleanName(raw)
    if (n && looksSensitive(n)) {
      setNameError('That looks like a number we never collect here. Your first name is enough.')
      return false
    }
    setNameError(null)
    nameRef.current = n
    setNameState(n || null)
    setNameAsked(true)
    const rec = deviceRef.current
    if (rec) {
      rec.name = n || null
      rec.nameAsked = true
      persistSoon()
    }
    return true
  }, [persistSoon])

  const rememberSection = useCallback((key: string) => {
    const rec = deviceRef.current
    if (!rec || rec.lastSection === key) return
    rec.lastSection = key
    persistSoon()
  }, [persistSoon])

  const setFocused = useCallback((key: string | null) => {
    const prev = focusedRef.current
    focusedRef.current = key
    if (prev && prev !== key) outboxRef.current?.flush((op) => (op.kind === 'answer' || op.kind === 'cell') && op.key === prev)
  }, [])

  const keepMine = useCallback((key: string) => {
    const hold = holds[key]
    setConflicts((s) => { const n = { ...s }; delete n[key]; return n })
    if (hold) {
      setHolds((s) => { const n = { ...s }; delete n[key]; return n })
      if (!isTable(key)) outboxRef.current?.enqueue({ kind: 'answer', key, value: hold.v ?? null, state: hold.s }, { delay: 0 })
    } else if (!outboxRef.current?.get(`answer:${key}`)) {
      const mine = effRef.current[key]
      if (mine) outboxRef.current?.enqueue({ kind: 'answer', key, value: mine.v ?? null, state: mine.s }, { delay: 0 })
    }
  }, [holds, isTable])

  const useTheirs = useCallback((key: string) => {
    setConflicts((s) => { const n = { ...s }; delete n[key]; return n })
    setHolds((s) => { const n = { ...s }; delete n[key]; return n })
    outboxRef.current?.cancel(`answer:${key}`)
    clearOverlay(`answer:${key}`)
  }, [])

  const tableRowsFor = useCallback((q: OnboardingQuestion, includeRemoved = false): TableRow[] => {
    if (!model) return []
    const rows = tableRows(q, effective, model, { includeRemoved })
    const known = new Set(rows.map((r) => r.id))
    const saved = (effective[q.key]?.v as { rows?: Record<string, unknown> } | null)?.rows ?? {}
    for (const d of drafts[q.key] ?? []) {
      if (known.has(d.id) || d.id in saved) continue
      rows.push({ id: d.id, pos: d.pos, removed: false, virtual: false, fromSource: false, by: null, at: null, cells: {} })
    }
    return rows
  }, [model, effective, drafts])

  const fileLinks = useCallback((key: string) => linksOf(effective[key]?.v), [effective])

  const unsentAnswersText = useCallback(() => unsentText(outboxRef.current?.list() ?? [], templateRef.current), [])

  return {
    screen, retryLoad, template, model, role, server, status, readOnly, preview, fromCache, online,
    name, displayName, nameAsked, nameError, setName,
    effective, filesList, sectionState, visibility, progress: prog, answeredKeys, neededKeys, ops, outbox, saveStatus, justSaved, teamToken,
    refused, sensitiveKeys, sensitive, conflicts, flashes, uploads, submitting, closedUnsent, initialSection,
    setAnswer, setState, setCell, addRow, setRowRemoved, importCells, removeFile, undoRemoveFile, setLinks,
    uploadFiles, retryUpload, dismissUpload, markSection, submit, keepEditing, rememberSection, setFocused,
    keepMine, useTheirs, tableRowsFor, fileLinks, unsentAnswersText,
  }
}

export type OnboardController = ReturnType<typeof useOnboard>

/** Plain text of queued answers, for "Copy my unsent answers" on a closed form. */
function unsentText(ops: Op[], tpl: OnboardingSnapshot | null): string {
  if (!ops.length) return ''
  const labels = new Map<string, { label: string; cols: Map<string, string> }>()
  for (const s of tpl?.sections ?? []) for (const q of s.questions) labels.set(q.key, { label: q.label, cols: new Map((q.columns ?? []).map((c) => [c.key, c.label])) })
  const lines: string[] = []
  for (const op of ops) {
    if (op.kind === 'answer') {
      const v = op.value
      const text = typeof v === 'string' ? v : Array.isArray(v) ? v.join(', ') : v === true ? 'Yes' : v && typeof v === 'object' ? linksOf(v).join(', ') : ''
      const state = op.state === 'not_sure' ? 'Not sure yet' : op.state === 'will_send' ? 'We will send it' : ''
      lines.push(`${labels.get(op.key)?.label ?? op.key}: ${text || state}`)
    } else if (op.kind === 'cell' && op.v) {
      const l = labels.get(op.key)
      lines.push(`${l?.label ?? op.key} (${l?.cols.get(op.col) ?? op.col}): ${op.v}`)
    }
  }
  return lines.join('\n')
}
