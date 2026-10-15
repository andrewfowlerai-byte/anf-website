/**
 * DEV ONLY. A local stand-in for the onboarding token RPCs and the CRM upload
 * endpoint, so the form can be built, clicked through and screenshotted before
 * migration 0205 runs. api.ts loads this file only when import.meta.env.DEV is
 * true and VITE_ONBOARD_MOCK=1, so a production build never includes it.
 *
 * How it behaves:
 *   - State lives in localStorage (anfsite.onboard.mock.v1), so two tabs share
 *     one "server": open the owner link in one tab and the team link in another
 *     and each sees the other's edits on the next poll.
 *   - It follows the contract's rules: owner-only questions, sections and
 *     columns are stripped from team responses and team writes to them answer
 *     owner_only; sensitive numbers answer sensitive; a submitted form answers
 *     not_open; a closed form answers closed.
 *   - Every call waits 80 to 250 ms. When navigator.onLine is false it throws
 *     like a dropped connection. Set localStorage "anfsite.onboard.mock.fail" to
 *     a number between 0 and 1 to make that share of writes fail with a server
 *     error (to watch the retry path).
 *   - Uploads keep metadata only, never the bytes.
 *
 * Tokens (64 hex characters, like real ones):
 *   1111...1111  owner link of "Sample Spa onboarding" (open, lightly seeded)
 *   2222...2222  team link of the same form
 *   3333...3333  owner link of a closed form
 *   anything else: not_found
 *
 * The template: this repo is public, so no client's template lives in it.
 * `npm run dev:onboard:sync` copies one from ../anf-crm into ./local/
 * (gitignored) and the mock uses it; without one it serves
 * ./sample.template.json, a made-up practice that uses every field type.
 * The seed answers belong to that made-up practice too.
 *
 * In the browser console: __onboardMock.reset() starts over with the seed.
 */

import sampleRaw from './sample.template.json?raw'
import type { Backend, UploadFail, UploadFinishOk, UploadStartOk } from '../api'
import { NetError, UPLOAD_TYPES, extensionOf, BAD_FILE_TYPE_MESSAGE } from '../api'
import type {
  Answer, AnswerMap, AnswerState, CellWrite, ChangesOk, ErrorCode, Fail, FileItem, FormMeta, GetFormOk,
  OnboardingQuestion, OnboardingSection, OnboardingSnapshot, OnboardingTemplate, Person, Phase, Role, SectionState, TableRowValue,
} from '../types'
import { ONBOARD_LIMITS, PHASE_LABELS_DEFAULT, ROW_ID_RE } from '../types'
import { buildModel, computeVisibility, parseGates } from '../logic'
import { looksSensitive, valueLooksSensitive } from '../sensitive'

export const MOCK_TOKENS = {
  owner: '1'.repeat(64),
  team: '2'.repeat(64),
  closed: '3'.repeat(64),
}

const STORE_KEY = 'anfsite.onboard.mock.v2'
/** Sizes announced at upload start, read back at finish (the mock never sees the bytes). */
const pendingSizes = new Map<string, number>()
const FAIL_KEY = 'anfsite.onboard.mock.fail'

const localTemplates = import.meta.glob<string>('./local/*.template.json', { query: '?raw', import: 'default', eager: true })
const raw = Object.values(localTemplates)[0] ?? sampleRaw

// ---------------------------------------------------------------------------
// Snapshot builder (a dev copy of the CRM's buildFormSnapshot, contract 6.2)
// ---------------------------------------------------------------------------

interface IndexQ { t: string; s: string; o?: true; c?: Record<string, string>; oc?: string[] }

function withoutTeamWording(sections: OnboardingSection[]): OnboardingSection[] {
  return sections.map((sec) => {
    const { titleTeam: _t, introTeam: _i, ...rest } = sec
    void _t
    void _i
    return {
      ...rest,
      questions: rest.questions.map((q) => {
        const { helpTeam: _h, ...qr } = q
        void _h
        return qr
      }),
    }
  })
}

function buildSnapshots(t: OnboardingTemplate) {
  const full: OnboardingSnapshot = {
    version: t.version, title: t.title, intro: t.intro, phase1Essentials: t.phase1Essentials,
    collapseWhen: t.collapseWhen ?? null, phaseLabels: { ...PHASE_LABELS_DEFAULT, ...(t.phaseLabels ?? {}) },
    sections: withoutTeamWording(t.sections),
  }
  const teamWording = new Map(t.sections.map((sec) => [sec.key, { title: sec.titleTeam, intro: sec.introTeam }]))
  const teamHelp = new Map<string, string>()
  for (const sec of t.sections) for (const q of sec.questions) if (q.helpTeam) teamHelp.set(q.key, q.helpTeam)
  const owner = new Set<string>()
  let changed = true
  while (changed) {
    changed = false
    for (const s of t.sections) for (const q of s.questions) {
      if (owner.has(q.key)) continue
      const parentOwner = parseGates(q.showIf).some((g) => owner.has(g.key))
      if (s.audience === 'owner' || q.audience === 'owner' || parentOwner) {
        owner.add(q.key)
        changed = true
      }
    }
  }
  const ownerSections = new Set(t.sections.filter((s) => s.audience === 'owner').map((s) => s.key))
  const index: Record<string, IndexQ> = {}
  const sIndex: Record<string, { title: string; o?: true }> = {}
  for (const s of t.sections) {
    sIndex[s.key] = ownerSections.has(s.key) ? { title: s.title, o: true } : { title: s.title }
    for (const q of s.questions) {
      const e: IndexQ = { t: q.type, s: s.key }
      if (owner.has(q.key)) e.o = true
      if (q.type === 'table') {
        e.c = Object.fromEntries((q.columns ?? []).map((c) => [c.key, c.type]))
        e.oc = (q.columns ?? []).filter((c) => c.audience === 'owner').map((c) => c.key)
      }
      index[q.key] = e
    }
  }
  const ownerCols = new Set<string>()
  for (const s of t.sections) for (const q of s.questions) for (const c of q.columns ?? []) if (c.audience === 'owner') ownerCols.add(`${q.key}.${c.key}`)
  const team: OnboardingSnapshot = {
    ...full,
    collapseWhen: null,
    phase1Essentials: t.phase1Essentials.filter((k) => !owner.has(k)),
    sections: full.sections
      .filter((s) => !ownerSections.has(s.key))
      .map((s) => ({
        ...s,
        title: teamWording.get(s.key)?.title ?? s.title,
        intro: teamWording.get(s.key)?.intro ?? s.intro,
        questions: s.questions
          .filter((q) => !owner.has(q.key))
          .map((q) => {
            const nq: OnboardingQuestion = { ...q }
            const help = teamHelp.get(q.key)
            if (help) nq.help = help
            if (q.defaultRows && q.columns) {
              const kept = new Set(q.columns.filter((c) => c.audience !== 'owner').map((c) => c.key))
              nq.defaultRows = q.defaultRows.map((d) => ({ id: d.id, cells: Object.fromEntries(Object.entries(d.cells).filter(([k]) => kept.has(k))) }))
            }
            if (q.columns) {
              nq.columns = q.columns
                .filter((c) => c.audience !== 'owner')
                .map((c) => {
                  if (c.pickFrom && (owner.has(c.pickFrom.question) || ownerCols.has(`${c.pickFrom.question}.${c.pickFrom.column}`))) {
                    const { pickFrom: _drop, ...rest } = c
                    void _drop
                    return rest
                  }
                  return c
                })
            }
            if (q.rowsFrom && (owner.has(q.rowsFrom.question) || ownerCols.has(`${q.rowsFrom.question}.${q.rowsFrom.sourceColumn}`))) delete nq.rowsFrom
            return nq
          }),
      }))
      .filter((s) => s.questions.length > 0),
  }
  return { full, team, index, sIndex }
}

const TEMPLATE = JSON.parse(raw) as OnboardingTemplate
const SNAP = buildSnapshots(TEMPLATE)

function hashOf(s: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    h1 = Math.imul(h1 ^ c, 16777619)
    h2 = Math.imul(h2 + c, 2246822519)
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0') + s.length.toString(16)
}
const FULL_HASH = hashOf(JSON.stringify(SNAP.full))
const TEAM_HASH = hashOf(JSON.stringify(SNAP.team))

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface MockAnswer { value: unknown; state: AnswerState; by: string | null; via: Role; updated_at: string }
interface MockFile { id: string; key: string; name: string; size: number; type: string; by: string | null; via: Role; updated_at: string; removed_at: string | null; path: string }
interface MockForm {
  id: string
  ownerToken: string
  teamToken: string
  title: string
  status: 'open' | 'submitted' | 'closed'
  section_state: Record<string, SectionState>
  people: Person[]
  submitted_at: string | null
  submitted_by_name: string | null
  submit_count: number
  answers: Record<string, MockAnswer>
  files: Record<string, MockFile>
}
interface MockStore { v: 1; forms: MockForm[] }

function iso(msAgo = 0): string {
  return new Date(Date.now() - msAgo).toISOString()
}

function seedStore(): MockStore {
  const min = 60_000
  const a = (value: unknown, by: string, via: Role, ago: number): MockAnswer => ({ value, state: null, by, via, updated_at: iso(ago) })
  const row = (pos: number, by: string, cells: Record<string, string>): TableRowValue => ({ _pos: pos, _by: by, _at: iso(40 * min), ...cells })
  const base = Date.now() - 3 * 86400_000
  // A made-up practice with example.com addresses. Never a real client's details.
  const answers: Record<string, MockAnswer> = {
    start_helpers: a({ rows: {
      r_seedhelper1: row(base, 'Dana', { name: 'Dana', role: 'Owner', email: 'owner@example.com', parts: 'Business, money, agreement' }),
      r_seedhelper2: row(base + 1, 'Dana', { name: 'Sam', role: 'Office manager', email: 'office@example.com', parts: 'Booking, hours, services' }),
    } }, 'Dana', 'owner', 3 * 86400_000),
    business_public_name: a('Sample Spa', 'Dana', 'owner', 2 * 86400_000),
    business_entity_type: a('LLC', 'Dana', 'owner', 2 * 86400_000),
    business_clinic_address: a('100 Example Street, Springfield', 'Sam', 'team', 55 * min),
    business_year_opened: a('2019', 'Dana', 'owner', 2 * 86400_000),
    services_menu_source: a('Fill in the tables on this form', 'Sam', 'team', 70 * min),
    services_table: a({ rows: {
      r_seedsvc0001: row(base, 'Sam', { name: 'Signature facial', category: 'Facials', description: 'Cleanse, exfoliate, mask and massage.', duration: '60', price: '120', price_type: 'per visit', deposit: '0', online: 'Yes', on_site: 'No' }),
      r_seedsvc0002: row(base + 1, 'Sam', { name: 'Chemical peel', category: 'Peels', duration: '45', price: '150', price_type: 'per visit', online: 'Yes', on_site: 'No' }),
      r_seedsvc0003: row(base + 2, 'Sam', { name: 'Consultation', category: 'Consults', duration: '30', price: '0', price_type: 'free', online: 'Yes', on_site: 'Yes' }),
    } }, 'Sam', 'team', 40 * min),
  }
  for (const k of Object.keys(answers)) if (!SNAP.index[k]) delete answers[k]
  const sample: MockForm = {
    id: 'a0000000-0000-4000-8000-000000000001',
    ownerToken: MOCK_TOKENS.owner,
    teamToken: MOCK_TOKENS.team,
    title: 'Sample Spa onboarding',
    status: 'open',
    section_state: {},
    people: [
      { name: 'Dana', link: 'owner', first_at: iso(3 * 86400_000), last_at: iso(30 * min) },
      { name: 'Sam', link: 'team', first_at: iso(2 * 86400_000), last_at: iso(55 * min) },
    ],
    submitted_at: null,
    submitted_by_name: null,
    submit_count: 0,
    answers,
    files: {},
  }
  const closed: MockForm = {
    ...sample,
    id: 'a0000000-0000-4000-8000-000000000002',
    ownerToken: MOCK_TOKENS.closed,
    teamToken: 'f'.repeat(64),
    title: 'Sample closed form',
    status: 'closed',
    people: [],
    answers: {},
  }
  return { v: 1, forms: [sample, closed] }
}

function load(): MockStore {
  try {
    const rawStore = window.localStorage.getItem(STORE_KEY)
    if (rawStore) {
      const parsed = JSON.parse(rawStore) as MockStore
      if (parsed && parsed.v === 1 && Array.isArray(parsed.forms)) return parsed
    }
  } catch {
    /* fall through to a fresh seed */
  }
  const s = seedStore()
  save(s)
  return s
}

function save(s: MockStore) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(s))
  } catch {
    /* a full store just means the mock forgets */
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function delay(): Promise<void> {
  return new Promise((r) => setTimeout(r, 80 + Math.random() * 170))
}

async function gate(write: boolean) {
  await delay()
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new NetError('offline (mock)')
  if (write) {
    let p: number
    try {
      p = Number(window.localStorage.getItem(FAIL_KEY) || 0)
    } catch {
      p = 0
    }
    if (p > 0 && Math.random() < p) throw new NetError('server error (mock)', 503)
  }
}

function fail(code: ErrorCode, title?: string): Fail {
  return title ? { ok: false, code, title } : { ok: false, code }
}

function resolve(store: MockStore, token: string): { form: MockForm; role: Role } | null {
  if (!/^[0-9a-f]{64}$/.test(token)) return null
  for (const f of store.forms) {
    if (f.ownerToken === token) return { form: f, role: 'owner' }
    if (f.teamToken === token) return { form: f, role: 'team' }
  }
  return null
}

function cleanName(name: string, role: Role): string | null {
  // eslint-disable-next-line no-control-regex
  const n = (name || '').replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, ONBOARD_LIMITS.nameMax)
  if (looksSensitive(n)) return null
  return n || (role === 'owner' ? 'Owner link' : 'Team link')
}

function isOwnerQ(key: string) { return !!SNAP.index[key]?.o }

function stripCols(v: unknown, cols: string[] | undefined): unknown {
  if (!cols || !cols.length || !v || typeof v !== 'object') return v
  const rows = (v as { rows?: Record<string, TableRowValue> }).rows
  if (!rows || typeof rows !== 'object') return v
  const out: Record<string, TableRowValue> = {}
  for (const [id, r] of Object.entries(rows)) {
    const copy = { ...r }
    for (const c of cols) delete copy[c]
    out[id] = copy
  }
  return { rows: out }
}

function answersJson(form: MockForm, role: Role, since: string | null): AnswerMap {
  const out: AnswerMap = {}
  for (const [key, a] of Object.entries(form.answers)) {
    const idx = SNAP.index[key]
    if (!idx) continue
    if (since && !(a.updated_at > since)) continue
    if (role === 'team' && idx.o) continue
    const v = role === 'team' && idx.t === 'table' ? stripCols(a.value, idx.oc) : a.value
    out[key] = { v: v ?? null, s: a.state, by: a.by, at: a.updated_at }
  }
  return out
}

function filesJson(form: MockForm, role: Role, since: string | null): FileItem[] {
  const out: FileItem[] = []
  for (const f of Object.values(form.files)) {
    if (role === 'team' && isOwnerQ(f.key)) continue
    if (since) {
      if (!(f.updated_at > since)) continue
    } else if (f.removed_at) continue
    const item: FileItem = { id: f.id, key: f.key, name: f.name, size: f.size, type: f.type, by: f.by, at: f.updated_at }
    if (f.removed_at) item.removed = true
    out.push(item)
  }
  return out
}

function collapsedPhases(form: MockForm): Phase[] {
  const answers: AnswerMap = {}
  for (const [k, a] of Object.entries(form.answers)) answers[k] = { v: a.value, s: a.state, by: a.by, at: a.updated_at } as Answer
  return computeVisibility(buildModel(SNAP.full), answers).collapsed
}

function meta(form: MockForm, role: Role): FormMeta {
  const ss: Record<string, SectionState> = {}
  for (const [k, v] of Object.entries(form.section_state)) {
    if (role === 'team' && SNAP.sIndex[k]?.o) continue
    ss[k] = v
  }
  return {
    title: form.title, status: form.status, submitted_at: form.submitted_at, submitted_by_name: form.submitted_by_name,
    section_state: ss, people: form.people, collapsed_phases: role === 'team' ? [] : collapsedPhases(form),
  }
}

function touch(form: MockForm, name: string, role: Role) {
  const now = iso()
  const p = form.people.find((x) => x.name.toLowerCase() === name.toLowerCase() && x.link === role)
  if (p) p.last_at = now
  else form.people.push({ name, link: role, first_at: now, last_at: now })
  form.people.sort((a, b) => (a.last_at < b.last_at ? 1 : -1))
  form.people = form.people.slice(0, 50)
}

function checkValue(type: string, v: unknown): ErrorCode | null {
  if (v === null || v === undefined) return null
  const str = (max: number) => (typeof v !== 'string' ? 'wrong_type' : v.length > max ? 'too_long' : null)
  switch (type) {
    case 'text': case 'email': case 'phone': case 'url': case 'choice': return str(ONBOARD_LIMITS.textMax) as ErrorCode | null
    case 'number': case 'money': case 'date': case 'time': return str(ONBOARD_LIMITS.shortMax) as ErrorCode | null
    case 'longtext': case 'address': return str(ONBOARD_LIMITS.longMax) as ErrorCode | null
    case 'multi':
      if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) return 'wrong_type'
      if (v.length > ONBOARD_LIMITS.multiMax) return 'too_many'
      return v.some((x: string) => x.length > ONBOARD_LIMITS.optionMax) ? 'too_long' : null
    case 'yesno': return v === 'Yes' || v === 'No' ? null : 'wrong_type'
    case 'check': return typeof v === 'boolean' ? null : 'wrong_type'
    case 'file': {
      const keys = v && typeof v === 'object' ? Object.keys(v) : []
      const links = (v as { links?: unknown }).links
      if (keys.length !== 1 || keys[0] !== 'links' || !Array.isArray(links)) return 'wrong_type'
      if (links.length > ONBOARD_LIMITS.linksMax) return 'too_many'
      return links.some((l) => typeof l !== 'string' || l.length > ONBOARD_LIMITS.linkMax) ? 'too_long' : null
    }
    default: return 'wrong_type'
  }
}

type Ctx = { store: MockStore; form: MockForm; role: Role; name: string }

async function withForm<T>(token: string, nameIn: string | null, write: boolean, fn: (c: Ctx) => T | Fail): Promise<T | Fail> {
  await gate(write)
  const store = load()
  const r = resolve(store, token)
  if (!r) return fail('not_found')
  if (r.form.status === 'closed') return fail('closed', r.form.title)
  const name = cleanName(nameIn ?? '', r.role)
  if (name === null) return fail('sensitive')
  if (write && r.form.status !== 'open') return fail('not_open')
  const out = fn({ store, form: r.form, role: r.role, name })
  if (write && !(out && typeof out === 'object' && 'ok' in out && out.ok === false)) {
    touch(r.form, name, r.role)
    save(store)
  }
  return out
}

function lockRows(form: MockForm, key: string, name: string, role: Role): Record<string, TableRowValue> {
  let a = form.answers[key]
  if (!a) {
    a = { value: { rows: {} }, state: null, by: name, via: role, updated_at: iso() }
    form.answers[key] = a
  }
  const rows = (a.value as { rows?: Record<string, TableRowValue> } | null)?.rows
  return rows && typeof rows === 'object' ? { ...rows } : {}
}

// ---------------------------------------------------------------------------
// Backend
// ---------------------------------------------------------------------------

export const mockBackend: Backend = {
  async getForm(token, preview, templateHash) {
    await gate(false)
    const store = load()
    const r = resolve(store, token)
    if (!r) return fail('not_found')
    if (r.form.status === 'closed') return fail('closed', r.form.title)
    const hash = r.role === 'owner' ? FULL_HASH : TEAM_HASH
    const res: GetFormOk = {
      ok: true, role: r.role, preview, server_time: iso(), form: meta(r.form, r.role), template_hash: hash,
      template: templateHash === hash ? null : r.role === 'owner' ? SNAP.full : SNAP.team,
      answers: answersJson(r.form, r.role, null), files: filesJson(r.form, r.role, null),
      ...(r.role === 'owner' ? { team_token: r.form.teamToken } : {}),
    }
    return res
  },

  async getChanges(token, since) {
    await gate(false)
    const store = load()
    const r = resolve(store, token)
    if (!r) return fail('not_found')
    if (r.form.status === 'closed') return fail('closed', r.form.title)
    const res: ChangesOk = {
      ok: true, server_time: iso(), cursor: iso(10_000), form: meta(r.form, r.role),
      answers: answersJson(r.form, r.role, since), files: filesJson(r.form, r.role, since),
      ...(r.role === 'owner' ? { team_token: r.form.teamToken } : {}),
    }
    return res
  },

  async hello(token, name) {
    await gate(false)
    const store = load()
    const r = resolve(store, token)
    if (!r) return fail('not_found')
    if (r.form.status === 'closed') return fail('closed', r.form.title)
    const n = cleanName(name, r.role)
    if (n === null) return fail('sensitive')
    touch(r.form, n, r.role)
    save(store)
    return { ok: true }
  },

  saveAnswer(token, key, value, state, name) {
    return withForm(token, name, true, ({ form, role, name: n }) => {
      const idx = SNAP.index[key]
      if (!idx) return fail('unknown_key')
      if (role === 'team' && idx.o) return fail('owner_only')
      if (state !== null && state !== 'not_sure' && state !== 'will_send') return fail('bad_value')
      const now = iso()
      if (idx.t === 'table') {
        const prev = form.answers[key]
        form.answers[key] = { value: prev?.value ?? { rows: {} }, state, by: n, via: role, updated_at: now }
        return { ok: true as const, at: now, by: n }
      }
      const bad = checkValue(idx.t, value)
      if (bad) return fail(bad)
      if (valueLooksSensitive(value)) return fail('sensitive')
      form.answers[key] = { value: value ?? null, state, by: n, via: role, updated_at: now }
      return { ok: true as const, at: now, by: n }
    })
  },

  saveCells(token, key, cells: CellWrite[], name) {
    return withForm(token, name, true, ({ form, role, name: n }) => {
      const idx = SNAP.index[key]
      if (!idx) return fail('unknown_key')
      if (idx.t !== 'table') return fail('wrong_type')
      if (role === 'team' && idx.o) return fail('owner_only')
      if (!Array.isArray(cells) || cells.length < 1 || cells.length > ONBOARD_LIMITS.cellsPerCall) return fail('too_many')
      for (const c of cells) {
        if (!ROW_ID_RE.test(c.row)) return fail('bad_row')
        if (!idx.c || !(c.col in idx.c)) return fail('bad_column')
        if (role === 'team' && idx.oc?.includes(c.col)) return fail('owner_only')
        if (c.v !== null && typeof c.v !== 'string') return fail('wrong_type')
        const colType = idx.c[c.col]
        if (colType === 'yesno' && c.v !== null && !['', 'Yes', 'No'].includes(c.v)) return fail('bad_value')
        if (typeof c.v === 'string' && c.v.length > (colType === 'longtext' ? ONBOARD_LIMITS.cellLongMax : ONBOARD_LIMITS.cellMax)) return fail('too_long')
        if (looksSensitive(c.v)) return fail('sensitive')
      }
      const rows = lockRows(form, key, n, role)
      const now = iso()
      const base = Date.now()
      const patch: Record<string, TableRowValue> = {}
      cells.forEach((c, i) => {
        const cur = patch[c.row] ?? { ...(rows[c.row] ?? { _pos: base + i }) }
        cur[c.col] = c.v
        cur._by = n
        cur._at = now
        patch[c.row] = cur
      })
      const merged = { ...rows, ...patch }
      if (Object.keys(merged).length > ONBOARD_LIMITS.rowsMax) return fail('too_many')
      if (JSON.stringify(merged).length > ONBOARD_LIMITS.tableCharsMax) return fail('too_long')
      const prev = form.answers[key]
      form.answers[key] = { value: { rows: merged }, state: prev?.state ?? null, by: n, via: role, updated_at: now }
      const out = role === 'team' ? (stripCols({ rows: patch }, idx.oc) as { rows: Record<string, TableRowValue> }).rows : patch
      return { ok: true as const, at: now, rows: out }
    })
  },

  setRowRemoved(token, key, row, removed, name) {
    return withForm(token, name, true, ({ form, role, name: n }) => {
      const idx = SNAP.index[key]
      if (!idx) return fail('unknown_key')
      if (idx.t !== 'table') return fail('wrong_type')
      if (role === 'team' && idx.o) return fail('owner_only')
      if (!ROW_ID_RE.test(row)) return fail('bad_row')
      const rows = lockRows(form, key, n, role)
      const now = iso()
      const cur: TableRowValue = { ...(rows[row] ?? { _pos: Date.now() }) }
      if (removed) cur._removed = true
      else delete cur._removed
      cur._by = n
      cur._at = now
      rows[row] = cur
      const prev = form.answers[key]
      form.answers[key] = { value: { rows }, state: prev?.state ?? null, by: n, via: role, updated_at: now }
      return { ok: true as const, at: now }
    })
  },

  removeFile(token, fileId, name) {
    return withForm(token, name, true, ({ form, role, name: n }) => {
      const f = form.files[fileId]
      if (!f) return fail('file_not_found')
      if (role === 'team' && isOwnerQ(f.key)) return fail('owner_only')
      if (!f.removed_at) {
        f.removed_at = iso()
        f.updated_at = f.removed_at
        void n
      }
      return { ok: true as const }
    })
  },

  markSection(token, section, ready, name) {
    return withForm(token, name, true, ({ form, role, name: n }) => {
      const s = SNAP.sIndex[section]
      if (!s) return fail('unknown_section')
      if (role === 'team' && s.o) return fail('owner_only')
      form.section_state[section] = { ready, by: n, at: iso() }
      return { ok: true as const, section_state: meta(form, role).section_state }
    })
  },

  async submit(token, name) {
    await gate(true)
    const store = load()
    const r = resolve(store, token)
    if (!r) return fail('not_found')
    if (r.form.status === 'closed') return fail('closed', r.form.title)
    if (r.role !== 'owner') return fail('owner_only')
    if (r.form.status === 'submitted') return { ok: true, already: true }
    const n = cleanName(name, r.role)
    if (n === null) return fail('sensitive')
    r.form.status = 'submitted'
    r.form.submitted_at = iso()
    r.form.submitted_by_name = n
    r.form.submit_count++
    touch(r.form, n, r.role)
    save(store)
    return { ok: true, submitted_at: r.form.submitted_at }
  },

  async keepEditing(token, name) {
    await gate(true)
    const store = load()
    const r = resolve(store, token)
    if (!r) return fail('not_found')
    if (r.form.status === 'closed') return fail('closed', r.form.title)
    if (r.role !== 'owner') return fail('owner_only')
    if (r.form.status === 'submitted') {
      r.form.status = 'open'
      touch(r.form, cleanName(name, r.role) ?? 'Owner link', r.role)
      save(store)
    }
    return { ok: true }
  },

  async uploadStart(token, key, fileName, size): Promise<UploadStartOk | UploadFail> {
    await gate(true)
    const store = load()
    const r = resolve(store, token)
    if (!r) return { ok: false, code: 'not_found', message: 'This link does not work.' }
    if (r.form.status !== 'open') return { ok: false, code: r.form.status === 'closed' ? 'closed' : 'not_open', message: 'This form is not open for changes.' }
    const idx = SNAP.index[key]
    if (!idx || idx.t !== 'file') return { ok: false, code: 'unknown_key', message: 'This question does not take files.' }
    if (r.role === 'team' && idx.o) return { ok: false, code: 'owner_only', message: 'Only the owner link can add files here.' }
    const ext = extensionOf(fileName)
    const type = UPLOAD_TYPES[ext]
    if (!type) return { ok: false, code: 'bad_file_type', message: BAD_FILE_TYPE_MESSAGE }
    if (size < 1 || size > ONBOARD_LIMITS.fileBytesMax) return { ok: false, code: 'too_big', message: 'That file is larger than 50 MB.' }
    const all = Object.values(r.form.files)
    if (all.filter((f) => f.key === key).length >= ONBOARD_LIMITS.filesPerQuestion || all.length >= ONBOARD_LIMITS.filesPerForm) {
      return { ok: false, code: 'limit_reached', message: 'This question has reached its file limit. Paste a share link instead.' }
    }
    const path = `forms/${r.form.id}/${key}/${crypto.randomUUID()}.${ext}`
    pendingSizes.set(path, size)
    return { ok: true, path, uploadToken: 'mock-upload-token', contentType: type }
  },

  async uploadPut(_start, file) {
    // Pretend to move bytes: about 25 MB a second, at least half a second.
    await new Promise((res) => setTimeout(res, Math.max(500, Math.min(6000, file.size / 25_000))))
    if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new NetError('offline (mock)')
  },

  async uploadFinish(token, key, path, fileName, by): Promise<UploadFinishOk | UploadFail> {
    await gate(true)
    const store = load()
    const r = resolve(store, token)
    if (!r) return { ok: false, code: 'not_found', message: 'This link does not work.' }
    if (!path.startsWith(`forms/${r.form.id}/${key}/`)) return { ok: false, code: 'file_not_found', message: 'That upload was not found.' }
    const existing = Object.values(r.form.files).find((f) => f.path === path)
    const now = iso()
    // eslint-disable-next-line no-control-regex
    const name = fileName.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 200) || 'file'
    const f: MockFile = existing ?? {
      id: crypto.randomUUID(), key, name, size: pendingSizes.get(path) ?? 1, type: UPLOAD_TYPES[extensionOf(name)] ?? 'application/octet-stream',
      by: cleanName(by, r.role) ?? 'Owner link', via: r.role, updated_at: now, removed_at: null, path,
    }
    r.form.files[f.id] = f
    touch(r.form, f.by ?? 'Owner link', r.role)
    save(store)
    return { ok: true, file: { id: f.id, key: f.key, name: f.name, size: f.size, type: f.type, by: f.by, at: f.updated_at } }
  },

  beaconAnswers() {
    // The mock has no network to beacon over; queued ops resend on the next visit.
  },
}

declare global {
  interface Window { __onboardMock?: { reset: () => void; tokens: typeof MOCK_TOKENS; store: () => MockStore } }
}

if (typeof window !== 'undefined') {
  window.__onboardMock = {
    reset: () => save(seedStore()),
    tokens: MOCK_TOKENS,
    store: load,
  }
}
