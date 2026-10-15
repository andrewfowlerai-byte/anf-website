import { useEffect, useRef, useState } from 'react'
import { btnPrimary, btnSecondary, inputBase, useOnboardCtx } from './ui'

/** "Who is filling this in?" on first visit, and from the menu. */

export function NamePrompt({ onDone }: { onDone: () => void }) {
  const c = useOnboardCtx()
  const [value, setValue] = useState(c.name ?? '')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => { ref.current?.focus() }, [])
  const save = () => { if (c.setName(value)) onDone() }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="name-title">
      <div className="w-full max-w-md rounded-lg border border-midnight-700 bg-midnight-900 p-6 shadow-2xl shadow-black/50">
        <h2 id="name-title" className="font-display text-xl font-semibold text-silver-100">Who is filling this in?</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-silver-400">
          Your first name is enough. It shows next to your answers so everyone knows who wrote what.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); save() }} className="mt-5">
          <label htmlFor="onboard-name" className="sr-only">Your first name</label>
          <input
            id="onboard-name"
            ref={ref}
            type="text"
            autoComplete="given-name"
            maxLength={80}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="First name"
            className={inputBase}
          />
          {c.nameError && <p className="mt-2 text-sm text-rose-300">{c.nameError}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="submit" className={btnPrimary} disabled={!value.trim()}>Continue</button>
            <button type="button" className={btnSecondary} onClick={() => { c.setName(null); onDone() }}>Skip</button>
          </div>
          <p className="mt-4 text-[12px] text-silver-600">Skip and your answers show as &ldquo;{c.role === 'owner' ? 'Owner link' : 'Team link'}&rdquo;. You can change it from the menu.</p>
        </form>
      </div>
    </div>
  )
}
