import { useState } from 'react'
import type { Phase } from '../../lib/onboarding/types'
import { btnPrimary, btnSecondary, plural, Spinner, useOnboardCtx } from './ui'

/** "We are done for now" (owner link only): a short summary, then Send to ANF. */

function neededLine(byPhase: Record<Phase, { needed: number }> | undefined, collapsed: Phase[]): string {
  if (!byPhase) return ''
  const order: [Phase, string][] = [['ALL', 'before we start'], ['P1', 'before Phase 1'], ['P2', 'before Phase 2'], ['P3', 'before Phase 3'], ['P4', 'before Phase 4'], ['P5', 'before Phase 5'], ['APP', 'before the app']]
  for (const [ph, words] of order) {
    if (collapsed.includes(ph)) continue
    const n = byPhase[ph]?.needed ?? 0
    if (n > 0) return `${n} ${n === 1 ? 'is' : 'are'} needed ${words}.`
  }
  return 'Nothing is marked as needed right now.'
}

export function SubmitDialog({ onClose, onSent }: { onClose: () => void; onSent: () => void }) {
  const c = useOnboardCtx()
  const [error, setError] = useState<string | null>(null)
  const p = c.progress
  const answered = (p?.overall.answered ?? 0) + (p?.later.answered ?? 0)
  const send = async () => {
    setError(null)
    const res = await c.submit()
    if (res.ok) onSent()
    else setError(res.message ?? 'That did not go through. Try again.')
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="submit-title">
      <div className="w-full max-w-md rounded-lg border border-midnight-700 bg-midnight-900 p-6 shadow-2xl shadow-black/50">
        <h2 id="submit-title" className="font-display text-xl font-semibold text-silver-100">Send it to ANF?</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-silver-300">
          You have answered {plural(answered, 'question', 'questions')}. {neededLine(p?.byPhase, c.visibility?.collapsed ?? [])} You can come back and keep editing any time.
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-silver-500">
          The form turns read-only for everyone until you tap Keep editing. Nothing is lost.
        </p>
        {error && <p className="mt-3 text-sm text-rose-300" role="alert">{error}</p>}
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={btnPrimary} onClick={() => void send()} disabled={c.submitting}>
            {c.submitting && <Spinner />} Send to ANF
          </button>
          <button type="button" className={btnSecondary} onClick={onClose} disabled={c.submitting}>Not yet</button>
        </div>
      </div>
    </div>
  )
}

export function ThankYou({ onKeepEditing, onClose }: { onKeepEditing: () => void; onClose: () => void }) {
  const c = useOnboardCtx()
  const [busy, setBusy] = useState(false)
  return (
    <div className="mx-auto max-w-[640px] py-16 md:py-24">
      <p className="font-display text-[12px] uppercase tracking-[0.16em] text-emerald-300">Sent to ANF</p>
      <h1 className="mt-3 font-display text-[32px] font-semibold leading-tight text-silver-100 [text-wrap:balance] md:text-[40px]">Thank you. That is a big help.</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-silver-300">
        Andrew at ANF Consulting will read through your answers and reach out about anything he needs. The form is read-only for now, so nothing changes by accident.
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-silver-400">
        Thought of something else? Tap Keep editing. It opens the form again for you and your team.
      </p>
      {/* Looking is the safe default; Keep editing reopens the form for everyone. */}
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} onClick={onClose}>Look over my answers</button>
        <button
          type="button"
          className={btnSecondary}
          disabled={busy || c.preview}
          onClick={async () => {
            setBusy(true)
            const ok = await c.keepEditing()
            setBusy(false)
            if (ok) onKeepEditing()
          }}
        >
          {busy && <Spinner />} Keep editing
        </button>
      </div>
    </div>
  )
}
