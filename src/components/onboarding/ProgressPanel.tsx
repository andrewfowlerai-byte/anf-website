import { PHASES, type Phase } from '../../lib/onboarding/types'
import { neededLabel } from '../../lib/onboarding/logic'
import { plural, useOnboardCtx } from './ui'

/**
 * "Your progress". It leads with what matters first: how many answers the
 * earliest phase still needs, and the short "What we need first" list. The
 * overall count is a percent underneath (a four-figure total is not the useful
 * number at the start). Then one bar per phase.
 */

function Bar({ value, total }: { value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-midnight-800" role="presentation">
      <div className="h-full rounded-full bg-silver-300" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function ProgressPanel({ onFirst }: { onFirst?: () => void }) {
  const c = useOnboardCtx()
  const p = c.progress
  const labels = c.template?.phaseLabels
  if (!p || !labels) return null
  const collapsed = c.visibility?.collapsed ?? []
  const firstNeed: Phase | undefined = PHASES.find((ph) => !collapsed.includes(ph) && p.byPhase[ph].needed > 0)
  const essentials = (c.template?.phase1Essentials ?? []).filter((k) => c.visibility?.shown.has(k))
  const essentialsDone = essentials.filter((k) => c.answeredKeys.has(k)).length
  const pct = p.overall.total ? Math.round((p.overall.answered / p.overall.total) * 100) : 0
  return (
    <div>
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-silver-500">Your progress</p>
      {firstNeed ? (
        <>
          <p className="mt-2 font-display text-[28px] font-semibold leading-none tabular-nums text-silver-100">{p.byPhase[firstNeed].needed}</p>
          <p className="mt-1 text-[13px] text-silver-400">{p.byPhase[firstNeed].needed === 1 ? 'answer' : 'answers'} {neededLabel(firstNeed).replace(/^Needed/, 'needed')}</p>
        </>
      ) : (
        <p className="mt-2 text-[15px] text-silver-200">Nothing is needed right now.</p>
      )}
      {essentials.length > 0 && onFirst && (
        <button type="button" onClick={onFirst} className="mt-3 inline-flex items-baseline gap-1.5 text-left text-[13px] text-flame-300 underline-offset-4 hover:underline">
          What we need first: <span className="tabular-nums">{essentialsDone} of {essentials.length}</span>
        </button>
      )}

      <div className="mt-5 border-t border-midnight-800 pt-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[13px] text-silver-300">All questions</p>
          <p className="shrink-0 text-[12px] tabular-nums text-silver-500" title={`${p.overall.answered.toLocaleString('en-US')} of ${p.overall.total.toLocaleString('en-US')} answered`}>{pct}%</p>
        </div>
        <Bar value={p.overall.answered} total={p.overall.total} />
      </div>

      <ul className="mt-5 space-y-4">
        {PHASES.map((ph) => {
          const t = p.byPhase[ph]
          if (!t.total) return null
          const isLater = collapsed.includes(ph)
          return (
            <li key={ph}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="min-w-0 text-[13px] leading-snug text-silver-300">{labels[ph]}</p>
                <p className="shrink-0 text-[12px] tabular-nums text-silver-500">{t.answered}/{t.total}</p>
              </div>
              <Bar value={t.answered} total={t.total} />
              {isLater ? (
                <p className="mt-1 text-[12px] text-silver-600">Answer later</p>
              ) : t.needed > 0 ? (
                <p className="mt-1 text-[12px] text-flame-300/90">{plural(t.needed, 'answer', 'answers')} {neededLabel(ph).replace(/^Needed/, 'needed')}</p>
              ) : null}
            </li>
          )
        })}
      </ul>
      {p.later.total > 0 && (
        <p className="mt-5 text-[12px] leading-snug text-silver-600">
          {plural(p.later.total, 'question waits', 'questions wait')} in Answer later and do not count here yet.
        </p>
      )}
    </div>
  )
}
