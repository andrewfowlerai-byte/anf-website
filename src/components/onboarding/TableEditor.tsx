import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { OnboardingColumn, OnboardingQuestion } from '../../lib/onboarding/types'
import { pickOptions, type TableRow } from '../../lib/onboarding/logic'
import { SENSITIVE_MESSAGE } from '../../lib/onboarding/sensitive'
import { REFUSED_MESSAGES } from '../../lib/onboarding/useOnboard'
import { buildCsvTemplate, downloadText, parseCsv, planImport, safeFileName, type ImportPlan } from '../../lib/onboarding/csv'
import { AutoTextarea, DateTimeInput, YesNoControl } from './controls'
import { Chip, btnPrimary, btnQuiet, btnSecondary, inputBase, plural, useMinWidth, useOnboardCtx } from './ui'

/**
 * A table question. Desktop: a spreadsheet-like grid that scrolls sideways
 * inside its own box. Phone: one card per row. Every cell saves on its own
 * (the server merges per cell), so two people can fill the same table at once.
 * Tables with 8 or more columns also offer a spreadsheet template round trip.
 */

const MIN_W: Record<string, string> = {
  text: 'min-w-[170px]', longtext: 'min-w-[260px]', number: 'min-w-[110px]', money: 'min-w-[120px]', email: 'min-w-[210px]',
  phone: 'min-w-[150px]', url: 'min-w-[210px]', date: 'min-w-[160px]', time: 'min-w-[130px]', yesno: 'min-w-[110px]',
}

/** Short fields sit two to a line in the phone cards. */
const HALF = new Set(['number', 'money', 'date', 'time', 'yesno'])

const MODE: Record<string, 'text' | 'email' | 'tel' | 'url' | 'decimal'> = {
  text: 'text', email: 'email', phone: 'tel', url: 'url', number: 'decimal', money: 'decimal',
}

function CellInput({ q, col, row, value, compact, listId }: {
  q: OnboardingQuestion; col: OnboardingColumn; row: TableRow; value: string; compact: boolean; listId?: string
}) {
  const c = useOnboardCtx()
  const label = `${col.label}, row ${row.cells[q.columns?.[0]?.key ?? ''] || ''}`.trim()
  const onChange = (v: string, typed = true) => c.setCell(q.key, row.id, col.key, v === '' ? null : v, { typed })
  const onFocus = () => c.setFocused(q.key)
  const onBlur = () => c.setFocused(null)
  const cellCls = compact
    ? 'w-full bg-transparent px-2.5 py-2 text-[15px] text-silver-100 placeholder:text-silver-600 focus:bg-midnight-900 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-flame-500/50'
    : inputBase
  if (col.type === 'yesno') {
    if (compact) {
      return (
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value, false)}
          className="w-full bg-transparent px-2 py-2 text-[15px] text-silver-100 focus:bg-midnight-900 focus:outline-none [color-scheme:dark]"
        >
          <option value="">Not set</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      )
    }
    return <YesNoControl full ariaLabel={label} value={value} onChange={(v) => onChange(v ?? '', false)} />
  }
  if (col.type === 'longtext') {
    return compact ? (
      <AutoTextarea ariaLabel={label} rows={1} value={value} onChange={(v) => onChange(v)} onFocus={onFocus} onBlur={onBlur}
        className="!rounded-none !border-0 !bg-transparent !px-2.5 !py-2 !text-[15px] focus:!bg-midnight-900 focus:!ring-inset" />
    ) : (
      <AutoTextarea ariaLabel={label} rows={2} value={value} onChange={(v) => onChange(v)} onFocus={onFocus} onBlur={onBlur} />
    )
  }
  if (col.type === 'date' || col.type === 'time') {
    return (
      <DateTimeInput ariaLabel={label} type={col.type} value={value} onChange={(v) => onChange(v, false)} onFocus={onFocus} onBlur={onBlur}
        className={compact ? '!rounded-none !border-0 !bg-transparent !py-2 !text-[15px] focus:!ring-inset' : ''} />
    )
  }
  const input = (
    <input
      type="text"
      aria-label={label}
      inputMode={MODE[col.type] ?? 'text'}
      autoComplete="off"
      list={listId}
      value={value}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={(e) => onChange(e.target.value)}
      className={`${cellCls} ${col.type === 'money' ? 'pl-6' : ''}`}
    />
  )
  if (col.type !== 'money') return input
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-silver-500">$</span>
      {input}
    </div>
  )
}

function RowLabel({ row, index }: { row: TableRow; index: number }) {
  return (
    <span className="tabular-nums">
      {index + 1}
      {row.fromSource && <span className="sr-only"> (filled in from an earlier table)</span>}
    </span>
  )
}

export function TableEditor({ q }: { q: OnboardingQuestion }) {
  const c = useOnboardCtx()
  const wide = useMinWidth(768)
  const baseId = useId()
  const [showRemoved, setShowRemoved] = useState(false)
  const [undo, setUndo] = useState<{ row: string } | null>(null)
  const [plan, setPlan] = useState<ImportPlan | null>(null)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [overflowing, setOverflowing] = useState(false)
  const cols = useMemo(() => q.columns ?? [], [q.columns])
  const rows = c.tableRowsFor(q)
  const removedRows = showRemoved ? c.tableRowsFor(q, true).filter((r) => r.removed) : []
  const big = cols.length >= 8
  const isOwnerLink = c.role === 'owner'
  const readOnly = c.readOnly

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setOverflowing(el.scrollWidth > el.clientWidth + 4))
    ro.observe(el)
    return () => ro.disconnect()
  }, [wide])

  useEffect(() => {
    if (!undo) return
    const t = setTimeout(() => setUndo(null), 8000)
    return () => clearTimeout(t)
  }, [undo])

  const pickLists = useMemo(() => {
    const out: Record<string, string[]> = {}
    if (!c.model) return out
    for (const col of cols) if (col.pickFrom) out[col.key] = pickOptions(col, c.effective, c.model)
    return out
  }, [cols, c.effective, c.model])

  const cellProblems = useMemo(() => {
    const out: string[] = []
    const prefix = `cell:${q.key}:`
    for (const t of Object.keys(c.sensitive)) {
      if (!t.startsWith(prefix)) continue
      const [, , rowId, col] = t.split(':')
      const idx = rows.findIndex((r) => r.id === rowId)
      const label = cols.find((x) => x.key === col)?.label ?? col
      out.push(`Row ${idx + 1}, ${label}`)
    }
    return out
  }, [c.sensitive, q.key, rows, cols])

  const refused = c.refused[q.key]

  const remove = (row: TableRow) => {
    c.setRowRemoved(q.key, row.id, true)
    setUndo({ row: row.id })
  }

  const add = () => {
    const id = c.addRow(q.key)
    // Focus the first cell of the new row once it renders.
    setTimeout(() => {
      const el = document.querySelector<HTMLElement>(`[data-row="${id}"] input, [data-row="${id}"] textarea, [data-row="${id}"] select`)
      el?.focus()
    }, 30)
  }

  const download = () => {
    downloadText(`${safeFileName(q.label)}.csv`, buildCsvTemplate(q, rows))
  }

  const onUpload = async (f: File | undefined) => {
    setImportMsg(null)
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      setImportMsg('That spreadsheet is too large to read here. Send it as a file upload instead.')
      return
    }
    try {
      const text = await f.text()
      const p = planImport(q, rows, parseCsv(text))
      if (p.noColumns) {
        setImportMsg('No column in that file matched this table. Start from "Download a spreadsheet template" and keep the first row as it is. Save it as CSV.')
        return
      }
      setPlan(p)
    } catch {
      setImportMsg('That file could not be read. Save it as CSV (comma separated) and try again.')
    }
  }

  const confirmImport = () => {
    if (!plan) return
    c.importCells(q.key, plan.cells)
    setImportMsg(`${plural(plan.adds, 'row', 'rows')} added and ${plan.updates.toLocaleString('en-US')} updated. They are saving now.`)
    setPlan(null)
  }

  // Small tables fit the column without sideways scrolling; wide ones keep roomy cells.
  const tight = cols.length <= 5
  const colWidth = (col: OnboardingColumn) => (tight ? (col.type === 'longtext' ? 'min-w-[200px]' : 'min-w-[110px]') : MIN_W[col.type] ?? 'min-w-[160px]')
  // The first column (usually the name) stays in view while the rest scrolls sideways.
  const stickyCol = (i: number) => (i === 0 ? 'sticky left-10 z-[1] shadow-[1px_0_0_0_rgba(58,74,107,0.7)]' : '')

  const headerCell = (col: OnboardingColumn, i: number) => (
    <th key={col.key} scope="col" className={`border-b border-l border-midnight-700/70 bg-midnight-900 px-2.5 py-2 text-left align-bottom text-[12px] font-medium leading-snug text-silver-400 ${colWidth(col)} ${stickyCol(i)}`}>
      <span className="block max-w-[220px]">{col.label}</span>
      {isOwnerLink && col.audience === 'owner' && <span className="mt-1 block"><Chip tone="owner">Owner only</Chip></span>}
      {col.pickFrom && <span className="mt-0.5 block text-[11px] font-normal text-silver-600">Pick from your team or type</span>}
    </th>
  )

  const listId = (col: OnboardingColumn) => (col.pickFrom ? `${baseId}-${col.key}-list` : undefined)

  return (
    <div className="min-w-0">
      {big && !readOnly && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <button type="button" onClick={download} className={btnQuiet}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14" /></svg>
            Download a spreadsheet template
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={btnQuiet}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 20V9m0 0l-4 4m4-4l4 4M5 4h14" /></svg>
            Upload it back
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => { void onUpload(e.target.files?.[0]); e.target.value = '' }} />
        </div>
      )}

      {plan && (
        <div className="mb-4 rounded-md border border-midnight-500 bg-midnight-900 p-4 text-sm">
          <p className="font-medium text-silver-100">
            {plural(plan.adds, 'row', 'rows')} to add, {plan.updates.toLocaleString('en-US')} to update.
          </p>
          {plan.skipped.length > 0 && (
            <div className="mt-2 text-silver-400">
              <p>These cells will be left out:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {plan.skipped.slice(0, 12).map((s, i) => <li key={i}>Line {s.line}, {s.column}: {s.reason}</li>)}
                {plan.skipped.length > 12 && <li>and {plan.skipped.length - 12} more</li>}
              </ul>
            </div>
          )}
          {plan.unknownHeaders.length > 0 && <p className="mt-2 text-silver-500">Columns not in this table (ignored): {plan.unknownHeaders.join(', ')}</p>}
          <div className="mt-3 flex gap-2">
            <button type="button" className={btnPrimary} disabled={!plan.cells.length} onClick={confirmImport}>Add them</button>
            <button type="button" className={btnSecondary} onClick={() => setPlan(null)}>Cancel</button>
          </div>
        </div>
      )}
      {importMsg && <p className="mb-3 text-sm text-silver-400" role="status">{importMsg}</p>}

      {cols.filter((col) => col.pickFrom).map((col) => (
        <datalist key={col.key} id={listId(col)}>
          {(pickLists[col.key] ?? []).map((o) => <option key={o} value={o} />)}
        </datalist>
      ))}

      {rows.length === 0 && !wide && <p className="rounded-md border border-dashed border-midnight-700 px-3 py-4 text-sm text-silver-500">No rows yet.</p>}

      {wide ? (
        <>
        {overflowing && <p className="mb-1.5 text-[12px] text-silver-600">{cols.length} columns. Scroll sideways inside the table to see them all.</p>}
        <div ref={scrollRef} className="relative max-w-full overflow-x-auto rounded-md border border-midnight-700/70 bg-[#07102B]">
          <table className="w-max min-w-full border-collapse text-sm">
            <thead className="bg-midnight-900">
              <tr>
                <th scope="col" className="sticky left-0 z-10 w-10 min-w-[40px] border-b border-midnight-700/70 bg-midnight-900 px-2 py-2 text-right text-[11px] font-medium text-silver-600">#</th>
                {cols.map(headerCell)}
                <th scope="col" className="w-12 border-b border-l border-midnight-700/70"><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr><td colSpan={cols.length + 2} className="px-3 py-4 text-sm text-silver-500">No rows yet. Add the first one below.</td></tr>
              )}
              {rows.map((row, i) => (
                <tr key={row.id} data-row={row.id} className={`align-top ${row.virtual ? 'bg-midnight-900/30' : ''}`}>
                  <td className="sticky left-0 z-[1] w-10 min-w-[40px] border-b border-midnight-800 bg-[#07102B] px-2 py-2 text-right text-[12px] text-silver-600" title={row.fromSource ? 'Filled in from an earlier table' : undefined}>
                    <RowLabel row={row} index={i} />
                  </td>
                  {cols.map((col, ci) => (
                    <td key={col.key} className={`border-b border-l border-midnight-800 p-0 ${ci === 0 ? `bg-[#07102B] ${stickyCol(0)}` : ''}`}>
                      <CellInput q={q} col={col} row={row} compact value={row.cells[col.key] ?? ''} listId={listId(col)} />
                    </td>
                  ))}
                  <td className="border-b border-l border-midnight-800 px-1 py-1 text-center">
                    {!readOnly && (
                      <button type="button" onClick={() => remove(row)} className="rounded p-1.5 text-silver-600 hover:bg-midnight-900 hover:text-silver-200" aria-label={`Remove row ${i + 1}`}>
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      ) : (
        <ol className="space-y-3">
          {rows.map((row, i) => {
            const title = (row.cells[cols[0]?.key ?? ''] ?? '').trim()
            return (
              <li key={row.id} data-row={row.id} className="rounded-md border border-midnight-700/70 bg-midnight-900/30">
                <div className="flex items-center justify-between gap-2 border-b border-midnight-800 px-3 py-2">
                  <p className="min-w-0 truncate text-[13px] text-silver-400">
                    <span className="tabular-nums text-silver-600">Row {i + 1}</span>
                    {title && <span className="text-silver-200"> &middot; {title}</span>}
                    {row.fromSource && <span className="text-silver-600"> &middot; from your list</span>}
                  </p>
                  {!readOnly && <button type="button" onClick={() => remove(row)} className="shrink-0 text-[13px] text-silver-500 underline-offset-4 hover:text-silver-200 hover:underline">Remove</button>}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-3">
                  {cols.map((col) => (
                    <label key={col.key} className={`flex min-w-0 flex-col justify-end ${HALF.has(col.type) ? 'col-span-1' : 'col-span-2'}`}>
                      <span className="mb-1 flex flex-wrap items-center gap-1.5 text-[13px] text-silver-400">
                        {col.label}
                        {isOwnerLink && col.audience === 'owner' && <Chip tone="owner">Owner only</Chip>}
                      </span>
                      <CellInput q={q} col={col} row={row} compact={false} value={row.cells[col.key] ?? ''} listId={listId(col)} />
                    </label>
                  ))}
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {cellProblems.length > 0 && (
        <p role="alert" className="mt-2 rounded-md border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {SENSITIVE_MESSAGE} ({cellProblems.join('; ')})
        </p>
      )}
      {refused && <p role="alert" className="mt-2 text-sm text-rose-300">{REFUSED_MESSAGES[refused] ?? 'Some cells were not saved.'}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {!readOnly && (
          <button type="button" onClick={add} className={btnSecondary}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
            Add a row
          </button>
        )}
        {undo && (
          <p className="text-sm text-silver-400" role="status">
            Row removed.{' '}
            <button type="button" className="font-medium text-flame-300 underline-offset-4 hover:underline" onClick={() => { c.setRowRemoved(q.key, undo.row, false); setUndo(null) }}>Undo</button>
          </p>
        )}
        <span className="text-[12px] tabular-nums text-silver-600">{plural(rows.filter((r) => !r.virtual).length, 'row', 'rows')}</span>
        <button type="button" className="text-[12px] text-silver-600 underline-offset-4 hover:text-silver-300 hover:underline" onClick={() => setShowRemoved((s) => !s)}>
          {showRemoved ? 'Hide removed rows' : 'Show removed rows'}
        </button>
      </div>
      {showRemoved && (
        <div className="mt-2 text-sm text-silver-500">
          {removedRows.length === 0 ? 'No removed rows.' : (
            <ul className="space-y-1">
              {removedRows.map((r) => (
                <li key={r.id} className="flex items-center gap-3">
                  <span className="line-through">{(r.cells[cols[0]?.key ?? ''] ?? '').trim() || 'Untitled row'}</span>
                  {!readOnly && <button type="button" className="text-flame-300 underline-offset-4 hover:underline" onClick={() => c.setRowRemoved(q.key, r.id, false)}>Bring back</button>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
