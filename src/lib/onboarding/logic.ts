// SHARED: keep identical in anf-crm/src/lib/onboardingLogic.ts and anf-website/src/lib/onboarding/logic.ts
//
// Pure form logic for the client onboarding form (contract v1, 6.3): gates
// (showIf, answeredIf), visibility, "answered", progress, Needed before labels,
// table rows (rowsFrom) and pick lists (pickFrom). Maps are built once per
// snapshot and memoized, so nothing here scans the whole template per row.
//
// It imports "./onboardingTypes" so the file is byte-identical in both repos:
// in anf-crm that is the real file, in anf-website a one-line re-export of
// ./types.

import type {
  Answer, AnswerMap, FileItem, Gate, OnboardingColumn, OnboardingQuestion, OnboardingSection,
  OnboardingSnapshot, Phase, SectionState, TableRowValue,
} from './onboardingTypes'
import { PHASES } from './onboardingTypes'

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------

export interface ParsedGate { key: string; op: '=' | '!='; value: string }

/** Splits on the first "!=" or "=", whichever comes first. Values may contain commas and "=". */
export function parseGate(s: string): ParsedGate | null {
  const ne = s.indexOf('!=')
  const eq = s.indexOf('=')
  if (eq < 0) return null
  if (ne >= 0 && ne < eq) return { key: s.slice(0, ne), op: '!=', value: s.slice(ne + 2) }
  return { key: s.slice(0, eq), op: '=', value: s.slice(eq + 1) }
}

const gateCache = new Map<string, ParsedGate[]>()

/** Parses a gate (string or any-of array) once and remembers it. */
export function parseGates(g: Gate | undefined | null): ParsedGate[] {
  if (g == null) return []
  const list = Array.isArray(g) ? g : [g]
  const cacheKey = list.join('\u0001')
  let hit = gateCache.get(cacheKey)
  if (!hit) {
    hit = list.map(parseGate).filter((x): x is ParsedGate => x !== null)
    gateCache.set(cacheKey, hit)
  }
  return hit
}

/**
 * The value a gate reads. An answer marked "Not sure yet" or "We will send it"
 * parks its typed value (so turning the state off brings it back), and a parked
 * value does not open any follow-up questions.
 */
function gateValue(a: Answer | undefined): unknown {
  if (!a || a.s) return null
  return a.v
}

function matchOne(g: ParsedGate, answers: AnswerMap, visible: ReadonlySet<string>): boolean {
  if (!visible.has(g.key)) return false
  const v = gateValue(answers[g.key])
  if (g.op === '=') {
    if (typeof v === 'string') return v === g.value
    if (Array.isArray(v)) return v.includes(g.value)
    return false
  }
  if (typeof v === 'string') return v !== '' && v !== g.value
  if (Array.isArray(v)) return v.length > 0 && !v.includes(g.value)
  return false
}

/**
 * A gate string matches only when its parent is visible and: for "=", a choice
 * or yesno value equals the value or a multi includes it; for "!=", the parent
 * has a non-empty value that does not equal (or include) it. Any-of for arrays.
 */
export function gateMatches(gate: Gate | ParsedGate[] | undefined | null, answers: AnswerMap, visible: ReadonlySet<string>): boolean {
  if (gate == null) return false
  const list: ParsedGate[] = Array.isArray(gate) && gate.length > 0 && typeof gate[0] === 'object'
    ? (gate as ParsedGate[])
    : parseGates(gate as Gate)
  for (const g of list) if (matchOne(g, answers, visible)) return true
  return false
}

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

export interface OnboardingModel {
  snapshot: OnboardingSnapshot
  sections: OnboardingSection[]
  /** Every question in template order. */
  questions: OnboardingQuestion[]
  byKey: Map<string, OnboardingQuestion>
  sectionOf: Map<string, OnboardingSection>
  sectionByKey: Map<string, OnboardingSection>
  order: Map<string, number>
  showIf: Map<string, ParsedGate[]>
  /** Parent key to the keys whose showIf names it. */
  children: Map<string, string[]>
  /** Source table key to the tables that prefill rows from it (rowsFrom). */
  rowsFromDependents: Map<string, string[]>
  /** "<table key>.<column key>" to the pickFrom source of that column. */
  pickSources: Map<string, { question: string; column: string }>
  /** Parts in template order, each with its sections. */
  parts: { part: string; sections: OnboardingSection[] }[]
  collapse: { gates: ParsedGate[]; phases: Phase[] } | null
}

const modelCache = new WeakMap<OnboardingSnapshot, OnboardingModel>()

export function buildModel(snapshot: OnboardingSnapshot): OnboardingModel {
  const hit = modelCache.get(snapshot)
  if (hit) return hit
  const questions: OnboardingQuestion[] = []
  const byKey = new Map<string, OnboardingQuestion>()
  const sectionOf = new Map<string, OnboardingSection>()
  const sectionByKey = new Map<string, OnboardingSection>()
  const order = new Map<string, number>()
  const showIf = new Map<string, ParsedGate[]>()
  const children = new Map<string, string[]>()
  const rowsFromDependents = new Map<string, string[]>()
  const pickSources = new Map<string, { question: string; column: string }>()
  const parts: { part: string; sections: OnboardingSection[] }[] = []
  for (const s of snapshot.sections) {
    sectionByKey.set(s.key, s)
    const last = parts[parts.length - 1]
    if (last && last.part === s.part) last.sections.push(s)
    else parts.push({ part: s.part, sections: [s] })
    for (const q of s.questions) {
      order.set(q.key, questions.length)
      questions.push(q)
      byKey.set(q.key, q)
      sectionOf.set(q.key, s)
      const gates = parseGates(q.showIf)
      if (gates.length) {
        showIf.set(q.key, gates)
        for (const g of gates) {
          const list = children.get(g.key) ?? []
          if (!list.includes(q.key)) list.push(q.key)
          children.set(g.key, list)
        }
      }
      if (q.rowsFrom) {
        const list = rowsFromDependents.get(q.rowsFrom.question) ?? []
        list.push(q.key)
        rowsFromDependents.set(q.rowsFrom.question, list)
      }
      for (const c of q.columns ?? []) if (c.pickFrom) pickSources.set(`${q.key}.${c.key}`, c.pickFrom)
    }
  }
  const cw = snapshot.collapseWhen
  const model: OnboardingModel = {
    snapshot, sections: snapshot.sections, questions, byKey, sectionOf, sectionByKey, order, showIf,
    children, rowsFromDependents, pickSources, parts,
    collapse: cw && cw.phases?.length ? { gates: parseGates(cw.showIf), phases: cw.phases } : null,
  }
  modelCache.set(snapshot, model)
  return model
}

// ---------------------------------------------------------------------------
// Visibility
// ---------------------------------------------------------------------------

export interface Visibility {
  /** Keys of every visible question. */
  shown: Set<string>
  /** Visible keys whose phase is collapsed into "Answer later". */
  later: Set<string>
  /** The collapsed phases this visibility was computed with. */
  collapsed: Phase[]
}

/**
 * One pass in template order (parents always come first, the validator checks
 * it). A hidden parent hides its child. Pass collapsedPhases for the team link
 * (the server sends them); leave it out to compute them live from collapseWhen.
 */
export function computeVisibility(model: OnboardingModel, answers: AnswerMap, collapsedPhases?: readonly Phase[]): Visibility {
  const shown = new Set<string>()
  for (const q of model.questions) {
    const gates = model.showIf.get(q.key)
    if (!gates || gateMatches(gates, answers, shown)) shown.add(q.key)
  }
  let collapsed: Phase[]
  if (collapsedPhases) collapsed = [...collapsedPhases]
  else if (model.collapse && gateMatches(model.collapse.gates, answers, shown)) collapsed = [...model.collapse.phases]
  else collapsed = []
  const later = new Set<string>()
  if (collapsed.length) {
    for (const k of shown) {
      const q = model.byKey.get(k)
      if (q && collapsed.includes(q.phase)) later.add(k)
    }
  }
  return { shown, later, collapsed }
}

// ---------------------------------------------------------------------------
// Answered
// ---------------------------------------------------------------------------

/** Saved table rows of a table answer value ({ rows: {...} }), or an empty object. */
export function rowsOf(v: unknown): Record<string, TableRowValue> {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const rows = (v as { rows?: unknown }).rows
    if (rows && typeof rows === 'object' && !Array.isArray(rows)) return rows as Record<string, TableRowValue>
  }
  return {}
}

/** Share links of a file answer value ({ links: [...] }). */
export function linksOf(v: unknown): string[] {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const links = (v as { links?: unknown }).links
    if (Array.isArray(links)) return links.filter((x): x is string => typeof x === 'string')
  }
  return []
}

function nonEmpty(v: unknown): boolean {
  if (typeof v === 'string') return v.trim() !== ''
  if (Array.isArray(v)) return v.length > 0
  return false
}

function rowHasData(row: TableRowValue): boolean {
  if (row._removed) return false
  for (const [k, v] of Object.entries(row)) {
    if (k.startsWith('_')) continue
    if (typeof v === 'string' && v.trim() !== '') return true
  }
  return false
}

/**
 * True when the answer holds a real value: a ticked check, a table with a
 * non-removed row that has a filled cell, a file question with a file or a
 * link, or any other value that is a non-empty string or array. States ("Not
 * sure yet", "We will send it") and answeredIf are not values.
 */
export function hasValue(q: OnboardingQuestion, answer: Answer | undefined, files: readonly FileItem[]): boolean {
  const v = answer?.v
  switch (q.type) {
    case 'check':
      return v === true
    case 'table':
      return Object.values(rowsOf(v)).some(rowHasData)
    case 'file':
      return files.some((f) => !f.removed) || linksOf(v).some((l) => l.trim() !== '')
    default:
      return nonEmpty(v)
  }
}

/**
 * True when answeredIf matches, a state is set, or the answer holds a value
 * (hasValue). This is what progress counts as answered.
 */
export function isAnswered(
  q: OnboardingQuestion, answer: Answer | undefined, files: readonly FileItem[], answers: AnswerMap, visible: ReadonlySet<string>,
): boolean {
  if (q.answeredIf && gateMatches(q.answeredIf, answers, visible)) return true
  if (answer?.s) return true
  return hasValue(q, answer, files)
}

/**
 * A required question still needs an answer until it holds a real value.
 * "Not sure yet" and "We will send it" count as answered for progress, but the
 * question stays needed (and keeps its Needed before label) until the value
 * arrives. An answeredIf match settles it.
 */
export function isStillNeeded(
  q: OnboardingQuestion, answer: Answer | undefined, files: readonly FileItem[], answers: AnswerMap, visible: ReadonlySet<string>,
): boolean {
  if (!q.required) return false
  if (q.answeredIf && gateMatches(q.answeredIf, answers, visible)) return false
  if (answer?.s) return true
  return !hasValue(q, answer, files)
}

// ---------------------------------------------------------------------------
// Progress
// ---------------------------------------------------------------------------

export interface Tally { answered: number; total: number; needed: number }
export interface SectionTally extends Tally {
  ready: boolean
  /** Visible questions that sit in collapsed phases. */
  later: number
}
export interface Progress {
  /** Visible questions outside the collapsed phases. */
  overall: Tally
  /** The "Answer later" bucket: visible questions in collapsed phases. */
  later: Tally
  byPhase: Record<Phase, Tally>
  bySection: Record<string, SectionTally>
}

function tally(): Tally { return { answered: 0, total: 0, needed: 0 } }

export function filesByKey(files: readonly FileItem[]): Map<string, FileItem[]> {
  const m = new Map<string, FileItem[]>()
  for (const f of files) {
    if (f.removed) continue
    const list = m.get(f.key)
    if (list) list.push(f)
    else m.set(f.key, [f])
  }
  return m
}

const NO_FILES: FileItem[] = []

/** Counts visible questions only. Collapsed phases count in "later", not in overall. */
export function progress(
  model: OnboardingModel, answers: AnswerMap, files: readonly FileItem[], vis: Visibility,
  sectionState: Record<string, SectionState> = {},
): Progress {
  const byPhase = {} as Record<Phase, Tally>
  for (const p of PHASES) byPhase[p] = tally()
  const bySection: Record<string, SectionTally> = {}
  for (const s of model.sections) bySection[s.key] = { ...tally(), ready: !!sectionState[s.key]?.ready, later: 0 }
  const overall = tally()
  const later = tally()
  const fk = filesByKey(files)
  for (const q of model.questions) {
    if (!vis.shown.has(q.key)) continue
    const qFiles = fk.get(q.key) ?? NO_FILES
    const done = isAnswered(q, answers[q.key], qFiles, answers, vis.shown)
    const need = isStillNeeded(q, answers[q.key], qFiles, answers, vis.shown)
    const isLater = vis.later.has(q.key)
    const buckets: Tally[] = [byPhase[q.phase], isLater ? later : overall]
    const sec = model.sectionOf.get(q.key)
    if (sec) {
      buckets.push(bySection[sec.key])
      if (isLater) bySection[sec.key].later++
    }
    for (const b of buckets) {
      b.total++
      if (done) b.answered++
      if (need) b.needed++
    }
  }
  return { overall, later, byPhase, bySection }
}

/** Shown only when the question is required and visible. Never the word "Required". */
export function neededLabel(phase: Phase): string {
  if (phase === 'ALL') return 'Needed before we start'
  if (phase === 'APP') return 'Needed before the app'
  return `Needed before Phase ${phase.slice(1)}`
}

/**
 * Every type except check, unless an option already says the same thing
 * ("Not sure ..." or "Not decided ..."), so there are never two ways to say it.
 */
export function showNotSure(q: OnboardingQuestion): boolean {
  if (q.type === 'check') return false
  return !(q.options ?? []).some((o) => o.startsWith('Not sure') || o.startsWith('Not decided'))
}

export function showWillSend(q: OnboardingQuestion): boolean {
  return q.type === 'file' || q.type === 'table'
}

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

export interface TableRow {
  id: string
  /** Sort position: _pos for own rows, source order for rowsFrom rows. */
  pos: number
  removed: boolean
  /** A rowsFrom or defaultRows row that nobody has saved yet. */
  virtual: boolean
  /** A rowsFrom row (saved or virtual). */
  fromSource: boolean
  by: string | null
  at: string | null
  cells: Record<string, string | null>
}

function cellString(v: unknown): string | null {
  if (typeof v === 'string') return v
  if (v == null) return null
  return String(v)
}

/** "r_" plus 10 random base36 characters. */
export function newRowId(): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyz'
  let out = 'r_'
  const c = (globalThis as { crypto?: Crypto }).crypto
  if (c?.getRandomValues) {
    const buf = new Uint8Array(10)
    c.getRandomValues(buf)
    for (const b of buf) out += chars[b % 36]
  } else {
    for (let i = 0; i < 10; i++) out += chars[Math.floor(Math.random() * 36)]
  }
  return out
}

function savedRow(id: string, s: TableRowValue, columns: OnboardingColumn[], pos: number, fromSource: boolean): TableRow {
  const cells: Record<string, string | null> = {}
  for (const c of columns) if (c.key in s) cells[c.key] = cellString(s[c.key])
  return {
    id, pos, removed: !!s._removed, virtual: false, fromSource,
    by: typeof s._by === 'string' ? s._by : null,
    at: typeof s._at === 'string' ? s._at : null,
    cells,
  }
}

/**
 * The rows to show for a table: saved rows, plus a virtual "rf_<id>" row for
 * every non-removed source row (rowsFrom) whose source column is not empty, and
 * a virtual row for every defaultRows entry nobody has saved yet. In a rowsFrom
 * row the target column shows the source value until someone edits it; in a
 * default row each prefilled cell shows until someone edits that cell.
 * rowsFrom rows come first in the source table's order, then default rows in
 * template order; other rows sort by _pos, then id. Removed rows are left out
 * unless includeRemoved is set.
 */
export function tableRows(
  q: OnboardingQuestion, answers: AnswerMap, model: OnboardingModel, opts: { includeRemoved?: boolean; depth?: number } = {},
): TableRow[] {
  const columns = q.columns ?? []
  const saved = rowsOf(answers[q.key]?.v)
  const out: TableRow[] = []
  const used = new Set<string>()
  const rf = q.rowsFrom
  const depth = opts.depth ?? 0
  const src = rf && depth < 3 ? model.byKey.get(rf.question) : undefined
  if (rf && src && src.type === 'table') {
    const srcRows = tableRows(src, answers, model, { depth: depth + 1 })
    srcRows.forEach((sr, i) => {
      const id = `rf_${sr.id}`
      const srcVal = sr.cells[rf.sourceColumn] ?? null
      const s = saved[id]
      if (s) {
        const row = savedRow(id, s, columns, i, true)
        if (!(rf.targetColumn in s)) row.cells[rf.targetColumn] = srcVal
        out.push(row)
        used.add(id)
      } else if (srcVal != null && srcVal.trim() !== '') {
        out.push({ id, pos: i, removed: false, virtual: true, fromSource: true, by: null, at: null, cells: { [rf.targetColumn]: srcVal } })
        used.add(id)
      }
    })
  }
  const defaults = q.defaultRows ?? []
  for (const d of defaults) {
    if (used.has(d.id)) continue
    const s = saved[d.id]
    const pos = out.length
    if (s) {
      const row = savedRow(d.id, s, columns, pos, false)
      for (const c of columns) if (!(c.key in s) && typeof d.cells[c.key] === 'string') row.cells[c.key] = d.cells[c.key]
      out.push(row)
    } else {
      const cells: Record<string, string | null> = {}
      for (const c of columns) if (typeof d.cells[c.key] === 'string') cells[c.key] = d.cells[c.key]
      out.push({ id: d.id, pos, removed: false, virtual: true, fromSource: false, by: null, at: null, cells })
    }
    used.add(d.id)
  }
  const rest: TableRow[] = []
  for (const [id, s] of Object.entries(saved)) {
    if (used.has(id)) continue
    rest.push(savedRow(id, s, columns, typeof s._pos === 'number' ? s._pos : Number.MAX_SAFE_INTEGER, id.startsWith('rf_')))
  }
  rest.sort((a, b) => (a.pos - b.pos) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
  const all = out.concat(rest)
  return opts.includeRemoved ? all : all.filter((r) => !r.removed)
}

/** Unique non-empty values from the pickFrom source table's non-removed rows. */
export function pickOptions(column: OnboardingColumn, answers: AnswerMap, model: OnboardingModel): string[] {
  if (!column.pickFrom) return []
  const src = model.byKey.get(column.pickFrom.question)
  if (!src || src.type !== 'table') return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const r of tableRows(src, answers, model)) {
    const v = (r.cells[column.pickFrom.column] ?? '').trim()
    if (v && !seen.has(v)) {
      seen.add(v)
      out.push(v)
    }
  }
  return out
}

/**
 * After a pick: the empty cells in the same row whose column key also exists in
 * the source table (for example role and email), filled from the picked source
 * row. Cells that already hold text are never touched. Free text picks nothing.
 */
export function pickFill(
  table: OnboardingQuestion, column: OnboardingColumn, picked: string, row: TableRow | undefined, answers: AnswerMap, model: OnboardingModel,
): Record<string, string> {
  const out: Record<string, string> = {}
  if (!column.pickFrom) return out
  const src = model.byKey.get(column.pickFrom.question)
  if (!src || src.type !== 'table') return out
  const want = picked.trim()
  if (!want) return out
  const srcRow = tableRows(src, answers, model).find((r) => (r.cells[column.pickFrom!.column] ?? '').trim() === want)
  if (!srcRow) return out
  const srcCols = new Set((src.columns ?? []).map((c) => c.key))
  for (const c of table.columns ?? []) {
    if (c.key === column.key || !srcCols.has(c.key)) continue
    const cur = row?.cells[c.key]
    if (cur != null && cur.trim() !== '') continue
    const v = srcRow.cells[c.key]
    if (v != null && v.trim() !== '') out[c.key] = v
  }
  return out
}
