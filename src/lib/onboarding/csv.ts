import type { OnboardingColumn, OnboardingQuestion } from './types'
import { ONBOARD_LIMITS, ROW_ID_RE } from './types'
import { newRowId, type TableRow } from './logic'
import { looksSensitive } from './sensitive'

/**
 * Spreadsheet round trip for big tables (8 or more columns): download a CSV
 * template with the current rows, fill it in Excel, Numbers or Google Sheets,
 * upload it back. Parsing happens here in the browser; nothing is sent until
 * the person confirms the preview, and cells that look like a card, Social
 * Security or bank number are skipped and listed.
 */

export const ROW_ID_HEADER = 'Row ID (leave as is)'

function quote(s: string): string {
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * A cell that starts with =, +, -, @, a tab or a carriage return would run as
 * a formula in Excel (a teammate could plant a link that sends the owner's
 * columns away). A leading apostrophe makes it plain text; planImport takes
 * that apostrophe off again on the way back in.
 */
const FORMULA_START = /^[=+\-@\t\r]/

export function neutralizeFormula(s: string): string {
  return FORMULA_START.test(s) ? `'${s}` : s
}

/** A UTF-8 CSV (with BOM, so Excel reads accents) of the table's columns and current rows. */
export function buildCsvTemplate(q: OnboardingQuestion, rows: TableRow[]): string {
  const cols = q.columns ?? []
  const lines = [[ROW_ID_HEADER, ...cols.map((c) => c.label)].map(quote).join(',')]
  for (const r of rows) lines.push([r.id, ...cols.map((c) => neutralizeFormula(r.cells[c.key] ?? ''))].map(quote).join(','))
  return '\uFEFF' + lines.join('\r\n') + '\r\n'
}

/** RFC 4180 parse: quoted fields, doubled quotes, commas and line breaks inside quotes, CRLF or LF. */
export function parseCsv(text: string): string[][] {
  const s = text.replace(/^\uFEFF/, '')
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += ch
      continue
    }
    if (ch === '"' && field === '') inQuotes = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  if (field !== '' || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

export interface ImportPlan {
  adds: number
  updates: number
  cells: { row: string; col: string; v: string }[]
  /** Cells left out, with a plain reason, for the preview list. */
  skipped: { line: number; column: string; reason: string }[]
  unknownHeaders: string[]
  /** True when no header matched any column (probably the wrong file). */
  noColumns: boolean
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

function yesNo(v: string): string | null {
  const t = norm(v)
  if (t === '') return ''
  if (['yes', 'y', 'true', '1', 'x'].includes(t)) return 'Yes'
  if (['no', 'n', 'false', '0'].includes(t)) return 'No'
  return null
}

/** Maps headers by label or key, matches rows by Row ID, and lists what would change. */
export function planImport(q: OnboardingQuestion, existing: TableRow[], parsed: string[][]): ImportPlan {
  const cols = q.columns ?? []
  const plan: ImportPlan = { adds: 0, updates: 0, cells: [], skipped: [], unknownHeaders: [], noColumns: false }
  if (!parsed.length) {
    plan.noColumns = true
    return plan
  }
  const header = parsed[0]
  const byLabel = new Map<string, OnboardingColumn>()
  for (const c of cols) {
    byLabel.set(norm(c.label), c)
    byLabel.set(norm(c.key), c)
  }
  let idCol = -1
  const map: (OnboardingColumn | null)[] = header.map((h, i) => {
    const n = norm(h)
    if (n.startsWith('row id') || n === 'row_id') {
      idCol = i
      return null
    }
    const c = byLabel.get(n) ?? null
    if (!c && h.trim()) plan.unknownHeaders.push(h.trim())
    return c
  })
  if (!map.some(Boolean)) {
    plan.noColumns = true
    return plan
  }
  const byId = new Map(existing.map((r) => [r.id, r]))
  for (let li = 1; li < parsed.length; li++) {
    const line = parsed[li]
    const rawId = idCol >= 0 ? (line[idCol] ?? '').trim() : ''
    const known = rawId && ROW_ID_RE.test(rawId) ? byId.get(rawId) : undefined
    const rowId = known ? known.id : newRowId()
    let changed = 0
    map.forEach((c, i) => {
      if (!c) return
      let v = (line[i] ?? '').replace(/\r\n?/g, '\n')
      // The apostrophe neutralizeFormula added on the way out.
      if (v.startsWith("'") && FORMULA_START.test(v.slice(1))) v = v.slice(1)
      if (c.type !== 'longtext') v = v.trim()
      if (c.type === 'yesno') {
        const yn = yesNo(v)
        if (yn === null) {
          plan.skipped.push({ line: li + 1, column: c.label, reason: 'not Yes or No' })
          return
        }
        v = yn
      }
      const max = c.type === 'longtext' ? ONBOARD_LIMITS.cellLongMax : ONBOARD_LIMITS.cellMax
      if (v.length > max) {
        plan.skipped.push({ line: li + 1, column: c.label, reason: 'too long' })
        return
      }
      if (looksSensitive(v)) {
        plan.skipped.push({ line: li + 1, column: c.label, reason: 'looks like a card, Social Security or bank number' })
        return
      }
      const cur = known ? known.cells[c.key] ?? '' : ''
      if (known ? v === cur : v === '') return
      plan.cells.push({ row: rowId, col: c.key, v })
      changed++
    })
    if (changed) {
      if (known) plan.updates++
      else plan.adds++
    }
  }
  return plan
}

/** Starts a download of a text file in the browser. */
export function downloadText(fileName: string, text: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export function safeFileName(s: string): string {
  return s.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80) || 'table'
}
