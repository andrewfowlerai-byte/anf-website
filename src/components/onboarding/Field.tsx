import { memo, useId, useMemo, useState, type ReactNode } from 'react'
import type { Answer, OnboardingQuestion } from '../../lib/onboarding/types'
import { neededLabel, showNotSure, showWillSend } from '../../lib/onboarding/logic'
import { SENSITIVE_MESSAGE } from '../../lib/onboarding/sensitive'
import { REFUSED_MESSAGES } from '../../lib/onboarding/useOnboard'
import { Chip, CheckIcon, formatWhen, inputBase, useOnboardCtx } from './ui'
import { TableEditor } from './TableEditor'
import { AutoTextarea, DateTimeInput, YesNoControl } from './controls'
import { FileField } from './FileField'

/**
 * One question: label, a one-line "why we ask", chips, the control, the "Not
 * sure yet" and "We will send it" toggles, and who answered it and when.
 */

function asText(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v)
}

/** Soft format hints. Never blocking: the answer saves as typed. */
function hintFor(type: string, v: string): string | null {
  const t = v.trim()
  if (!t) return null
  if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return 'That does not look like an email address yet.'
  if (type === 'phone' && t.replace(/\D/g, '').length < 10) return 'Phone numbers usually have 10 digits.'
  if (type === 'url' && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(t)) return 'That does not look like a web address yet.'
  if ((type === 'number' || type === 'money') && !/^[$]?\s*[\d,]*(\.\d+)?\s*%?$/.test(t)) return 'A plain number works best here, but this is fine too.'
  return null
}

const INPUT_MODE: Record<string, 'text' | 'email' | 'tel' | 'url' | 'decimal'> = {
  text: 'text', email: 'email', phone: 'tel', url: 'url', number: 'decimal', money: 'decimal',
}

function TextControl({ q, value, onChange, onBlurHint, id, describedBy }: {
  q: OnboardingQuestion; value: string; onChange: (v: string) => void; onBlurHint: (h: string | null) => void; id: string; describedBy?: string
}) {
  const c = useOnboardCtx()
  const input = (
    <input
      id={id}
      type="text"
      inputMode={INPUT_MODE[q.type] ?? 'text'}
      autoComplete="off"
      spellCheck={q.type === 'text'}
      value={value}
      aria-describedby={describedBy}
      onFocus={() => c.setFocused(q.key)}
      onBlur={(e) => {
        c.setFocused(null)
        onBlurHint(hintFor(q.type, e.target.value))
      }}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBase} ${q.type === 'money' ? 'pl-7' : ''}`}
    />
  )
  if (q.type !== 'money') return input
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-silver-500">$</span>
      {input}
    </div>
  )
}

function ChoiceControl({ q, value, onPick, labelId }: { q: OnboardingQuestion; value: string; onPick: (v: string | null) => void; labelId: string }) {
  const options = useMemo(() => q.options ?? [], [q.options])
  const [search, setSearch] = useState('')
  const many = options.length > 10
  const shown = useMemo(() => {
    const t = search.trim().toLowerCase()
    return t ? options.filter((o) => o.toLowerCase().includes(t)) : options
  }, [options, search])
  return (
    <div>
      {many && (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${options.length} options`}
          aria-label="Search the options"
          className={`${inputBase} mb-2`}
        />
      )}
      <div role="radiogroup" aria-labelledby={labelId} className={`grid grid-cols-1 gap-1.5 ${many ? 'max-h-80 overflow-y-auto pr-1' : ''}`}>
        {shown.map((o) => {
          const on = value === o
          return (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onPick(on ? null : o)}
              className={`flex w-full items-start gap-3 rounded-md border px-3 py-2.5 text-left text-[15px] leading-snug transition-colors ${
                on ? 'border-flame-500/70 bg-flame-500/10 text-silver-100' : 'border-midnight-700 bg-midnight-900/40 text-silver-200 hover:border-midnight-500'
              }`}
            >
              <span className={`mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${on ? 'border-flame-500' : 'border-silver-600'}`}>
                {on && <span className="h-2 w-2 rounded-full bg-flame-500" />}
              </span>
              <span className="min-w-0">{o}</span>
            </button>
          )
        })}
        {many && shown.length === 0 && <p className="px-1 py-2 text-sm text-silver-500">No option matches. Try another word.</p>}
      </div>
      {value && !options.includes(value) && (
        <p className="mt-2 text-sm text-silver-400">Saved answer: {value}</p>
      )}
    </div>
  )
}

function MultiControl({ q, value, onChange, labelId }: { q: OnboardingQuestion; value: string[]; onChange: (v: string[]) => void; labelId: string }) {
  const options = q.options ?? []
  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o)
        return (
          <button
            key={o}
            type="button"
            role="checkbox"
            aria-checked={on}
            onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
            className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-left text-[15px] leading-snug transition-colors ${
              on ? 'border-flame-500/70 bg-flame-500/10 text-silver-100' : 'border-midnight-700 text-silver-300 hover:border-midnight-500'
            }`}
          >
            <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${on ? 'border-flame-500 bg-flame-500 text-midnight-950' : 'border-silver-600'}`}>
              {on && <CheckIcon className="h-3 w-3" />}
            </span>
            <span className="min-w-0">{o}</span>
          </button>
        )
      })}
    </div>
  )
}

function StateToggle({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[13px] transition-colors ${
        on ? 'border-silver-400 bg-silver-100/10 text-silver-100' : 'border-midnight-700 text-silver-500 hover:border-midnight-500 hover:text-silver-300'
      }`}
    >
      <span className={`flex h-3 w-3 items-center justify-center rounded-full border ${on ? 'border-silver-200 bg-silver-200' : 'border-silver-600'}`}>
        {on && <span className="h-1.5 w-1.5 rounded-full bg-[#07102B]" />}
      </span>
      {label}
    </button>
  )
}

export const QuestionBlock = memo(function QuestionBlock({ q, answer, eyebrow }: { q: OnboardingQuestion; answer: Answer | undefined; eyebrow?: ReactNode }) {
  const c = useOnboardCtx()
  const id = useId()
  const labelId = `${id}-label`
  const helpId = `${id}-help`
  const [hint, setHint] = useState<string | null>(null)
  const target = `answer:${q.key}`
  const op = c.outbox?.get(target)
  const justSaved = c.justSaved.has(target)
  const flash = c.flashes[q.key]
  const flashing = !!flash
  const conflict = c.conflicts[q.key]
  const sensitive = c.sensitiveKeys.has(q.key)
  const refusedCode = c.refused[q.key]
  const state = answer?.s ?? null
  // The Owner only chip marks a single question inside a shared section. In an
  // Owner only section the header already says so, except in the "What we need
  // first" list (eyebrow), where the question sits outside its section.
  const sectionOwner = c.model?.sectionOf.get(q.key)?.audience === 'owner'
  const isOwnerOnly = c.role === 'owner' && ((q.audience === 'owner' && !sectionOwner) || (sectionOwner && !!eyebrow))
  // Needed until it holds a real answer: "Not sure yet" keeps the chip.
  const needed = c.neededKeys.has(q.key)
  const stored = answer?.v

  const set = (v: unknown, typed = false) => c.setAnswer(q.key, v, { typed })

  let control: ReactNode
  switch (q.type) {
    case 'text': case 'email': case 'phone': case 'url': case 'number': case 'money':
      control = <TextControl q={q} id={`${id}-input`} describedBy={q.help ? helpId : undefined} value={asText(stored)} onChange={(v) => set(v === '' ? null : v, true)} onBlurHint={setHint} />
      break
    case 'longtext': case 'address':
      control = (
        <AutoTextarea
          id={`${id}-input`}
          rows={q.type === 'address' ? 2 : 3}
          describedBy={q.help ? helpId : undefined}
          value={asText(stored)}
          onFocus={() => c.setFocused(q.key)}
          onBlur={() => c.setFocused(null)}
          onChange={(v) => set(v === '' ? null : v, true)}
        />
      )
      break
    case 'date': case 'time':
      control = (
        <div className="max-w-xs">
          <DateTimeInput id={`${id}-input`} type={q.type} value={asText(stored)} onFocus={() => c.setFocused(q.key)} onBlur={() => c.setFocused(null)} onChange={(v) => set(v === '' ? null : v)} />
        </div>
      )
      break
    case 'choice':
      control = <ChoiceControl q={q} labelId={labelId} value={asText(stored)} onPick={(v) => set(v)} />
      break
    case 'multi':
      control = <MultiControl q={q} labelId={labelId} value={Array.isArray(stored) ? (stored as string[]) : []} onChange={(v) => set(v.length ? v : null)} />
      break
    case 'yesno':
      control = <YesNoControl labelId={labelId} value={asText(stored)} onChange={(v) => set(v)} />
      break
    case 'check':
      control = (
        <label className="inline-flex cursor-pointer items-start gap-3 text-[15px] text-silver-200">
          <input type="checkbox" checked={stored === true} onChange={(e) => set(e.target.checked)} className="mt-0.5 h-5 w-5 rounded border-silver-600 bg-midnight-900 accent-flame-500" />
          <span>{q.checkLabel ?? 'Yes'}</span>
        </label>
      )
      break
    case 'file':
      control = <FileField q={q} />
      break
    case 'table':
      control = <TableEditor q={q} />
      break
  }

  const who = answer?.by && answer.at ? `${answer.by}, ${formatWhen(answer.at)}` : ''
  const label = q.type === 'check' ? q.label : q.label

  return (
    <div
      data-q={q.key}
      className={`relative py-6 transition-colors duration-700 ${flashing ? 'bg-flame-500/[0.06]' : ''}`}
    >
      {flashing && <span className="absolute -left-3 top-6 bottom-6 w-0.5 rounded bg-flame-400 md:-left-5" aria-hidden="true" />}
      {eyebrow}
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <h3 id={labelId} className="min-w-0 max-w-[62ch] font-sans text-base font-medium leading-snug text-silver-100 [text-wrap:pretty]">
          {q.type === 'table' || q.type === 'file' || q.type === 'choice' || q.type === 'multi' || q.type === 'yesno' || q.type === 'check'
            ? label
            : <label htmlFor={`${id}-input`}>{label}</label>}
        </h3>
        {(needed || isOwnerOnly) && (
          <div className="flex shrink-0 flex-wrap gap-1.5 pt-0.5">
            {needed && <Chip tone="needed">{neededLabel(q.phase)}</Chip>}
            {isOwnerOnly && <Chip tone="owner">Owner only</Chip>}
          </div>
        )}
      </div>
      {q.help && <p id={helpId} className="mt-1 max-w-[68ch] text-sm leading-relaxed text-silver-500">{q.help}</p>}

      <div className={`mt-3 transition-opacity ${state ? 'opacity-55' : ''}`}>{control}</div>

      {hint && !sensitive && <p className="mt-2 text-[13px] text-silver-500">{hint}</p>}
      {sensitive && (
        <p role="alert" className="mt-2 rounded-md border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{SENSITIVE_MESSAGE}</p>
      )}
      {refusedCode && !sensitive && (
        <p role="alert" className="mt-2 text-sm text-rose-300">{REFUSED_MESSAGES[refusedCode] ?? 'That answer was not saved. Try changing it a little.'}</p>
      )}
      {conflict && (
        <div role="status" className="mt-3 rounded-md border border-amber-300/40 bg-amber-300/[0.07] px-3 py-2.5 text-sm text-amber-100">
          <p>
            {conflict.remote.by ?? 'Someone'} also changed this.{' '}
            {typeof conflict.remote.v === 'string' && conflict.remote.v && (
              <span className="text-amber-200/80">Their answer: &ldquo;{conflict.remote.v.length > 140 ? `${conflict.remote.v.slice(0, 140)}...` : conflict.remote.v}&rdquo;</span>
            )}
          </p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => c.keepMine(q.key)} className="rounded border border-amber-200/50 px-2.5 py-1 text-[13px] font-medium hover:bg-amber-200/10">Keep yours</button>
            <button type="button" onClick={() => c.useTheirs(q.key)} className="rounded border border-amber-200/50 px-2.5 py-1 text-[13px] font-medium hover:bg-amber-200/10">Use theirs</button>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {showNotSure(q) && <StateToggle on={state === 'not_sure'} label="Not sure yet" onClick={() => c.setState(q.key, state === 'not_sure' ? null : 'not_sure')} />}
          {showWillSend(q) && <StateToggle on={state === 'will_send'} label="We will send it" onClick={() => c.setState(q.key, state === 'will_send' ? null : 'will_send')} />}
        </div>
        <p className="text-[12px] tabular-nums text-silver-600" aria-live="polite">
          {flashing ? (
            <span className="text-flame-300">Updated by {flash.by} just now</span>
          ) : op && !op.failed && op.tries > 0 ? (
            <span className="text-amber-200">{c.online ? 'Not saved yet. Trying again.' : 'Kept on this device'}</span>
          ) : justSaved ? (
            <span className="inline-flex items-center gap-1 text-emerald-300"><CheckIcon className="h-3 w-3" />Saved</span>
          ) : (
            who
          )}
        </p>
      </div>
    </div>
  )
})
