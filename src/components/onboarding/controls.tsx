import { useLayoutEffect, useRef, useState } from 'react'
import { inputBase } from './ui'

/** Form controls shared by questions and table cells. */

export function AutoTextarea({ value, onChange, onFocus, onBlur, id, rows = 3, className = '', describedBy, ariaLabel }: {
  value: string; onChange: (v: string) => void; onFocus?: () => void; onBlur?: () => void; id?: string; rows?: number; className?: string; describedBy?: string; ariaLabel?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight + 2, 640)}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      value={value}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputBase} resize-none leading-relaxed ${className}`}
    />
  )
}

/** Native date or time input with a visible placeholder (iOS shows an empty grey pill otherwise). */
export function DateTimeInput({ type, value, onChange, onFocus, onBlur, id, className = '', ariaLabel }: {
  type: 'date' | 'time'; value: string; onChange: (v: string) => void; onFocus?: () => void; onBlur?: () => void; id?: string; className?: string; ariaLabel?: string
}) {
  const [focused, setFocused] = useState(false)
  const empty = !value
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        aria-label={ariaLabel}
        onFocus={() => { setFocused(true); onFocus?.() }}
        onBlur={() => { setFocused(false); onBlur?.() }}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputBase} min-h-[46px] appearance-none [color-scheme:dark] ${empty && !focused ? 'text-transparent' : ''} ${className}`}
      />
      {empty && !focused && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-base text-silver-600">
          {type === 'date' ? 'Choose a date' : 'Choose a time'}
        </span>
      )}
    </div>
  )
}

export function YesNoControl({ value, onChange, labelId, ariaLabel, full = false }: { value: string; onChange: (v: string | null) => void; labelId?: string; ariaLabel?: string; full?: boolean }) {
  return (
    <div role="radiogroup" aria-labelledby={labelId} aria-label={ariaLabel} className={`${full ? 'flex w-full' : 'inline-flex'} overflow-hidden rounded-md border border-midnight-700`}>
      {['Yes', 'No'].map((o, i) => {
        const on = value === o
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(on ? null : o)}
            className={`${full ? 'min-w-0 flex-1 px-2' : 'min-w-[84px] px-4'} py-2 text-[15px] font-medium transition-colors ${i ? 'border-l border-midnight-700' : ''} ${
              on ? 'bg-flame-500/15 text-flame-300' : 'bg-midnight-900/40 text-silver-300 hover:bg-midnight-900'
            }`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

