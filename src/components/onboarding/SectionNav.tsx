/* eslint-disable react-refresh/only-export-components -- useNavGroups is shared with the page */
import type { OnboardingSection } from '../../lib/onboarding/types'
import { CheckIcon, btnPrimary, useOnboardCtx } from './ui'

/**
 * The table of contents: parts, then sections, each with "answered of total"
 * set like a printed index (leader dots, tabular figures) and a Ready check.
 * Sections whose questions all sit in collapsed phases move to "Answer later".
 */

export interface NavGroup { part: string; index: number; sections: OnboardingSection[] }

export function useNavGroups(): { groups: NavGroup[]; later: OnboardingSection[]; order: OnboardingSection[] } {
  const c = useOnboardCtx()
  const groups: NavGroup[] = []
  const later: OnboardingSection[] = []
  const model = c.model
  const vis = c.visibility
  if (!model || !vis) return { groups, later, order: [] }
  model.parts.forEach((p, index) => {
    const secs: OnboardingSection[] = []
    for (const s of p.sections) {
      const shown = s.questions.filter((q) => vis.shown.has(q.key))
      if (!shown.length) continue
      if (vis.later.size && shown.every((q) => vis.later.has(q.key))) later.push(s)
      else secs.push(s)
    }
    if (secs.length) groups.push({ part: p.part, index, sections: secs })
  })
  const order = [...groups.flatMap((g) => g.sections), ...later]
  return { groups, later, order }
}

function NavItem({ s, current, onPick }: { s: OnboardingSection; current: boolean; onPick: (key: string) => void }) {
  const c = useOnboardCtx()
  const t = c.progress?.bySection[s.key]
  const ready = !!c.sectionState[s.key]?.ready
  const done = t && t.total > 0 && t.answered === t.total
  return (
    <li>
      <button
        type="button"
        onClick={() => onPick(s.key)}
        aria-current={current ? 'page' : undefined}
        className={`group relative flex w-full items-baseline gap-2 rounded-sm py-1.5 pl-3 pr-2 text-left text-[14px] leading-snug transition-colors ${
          current ? 'bg-midnight-900 text-silver-100' : 'text-silver-400 hover:bg-midnight-900/60 hover:text-silver-200'
        }`}
      >
        {current && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded bg-flame-500" aria-hidden="true" />}
        <span className="min-w-0">
          {s.title}
          {c.role === 'owner' && s.audience === 'owner' && (
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.08em] text-silver-500">Owner only</span>
          )}
        </span>
        <span className="mb-[3px] min-w-[12px] flex-1 border-b border-dotted border-midnight-500" aria-hidden="true" />
        <span className={`shrink-0 text-[12px] tabular-nums ${done ? 'text-silver-300' : 'text-silver-600'}`}>
          {t ? `${t.answered}/${t.total}` : ''}
        </span>
        <span className="flex w-3.5 shrink-0 justify-center self-center" aria-label={ready ? 'Ready for ANF' : undefined}>
          {ready && <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />}
        </span>
      </button>
    </li>
  )
}

export function SectionNav({ current, onPick, onSubmit }: { current: string; onPick: (key: string) => void; onSubmit: () => void }) {
  const c = useOnboardCtx()
  const { groups, later } = useNavGroups()
  return (
    <nav aria-label="Sections" className="pb-10">
      {groups.map((g) => (
        <div key={g.part} className="mt-5 first:mt-0">
          <p className="mb-1 pl-3 font-display text-[11px] uppercase tracking-[0.14em] text-silver-600">
            <span className="tabular-nums">{String(g.index + 1).padStart(2, '0')}</span> {g.part}
          </p>
          <ul>{g.sections.map((s) => <NavItem key={s.key} s={s} current={s.key === current} onPick={onPick} />)}</ul>
        </div>
      ))}
      {later.length > 0 && (
        <div className="mt-6 border-t border-midnight-800 pt-4">
          <p className="mb-1 pl-3 font-display text-[11px] uppercase tracking-[0.14em] text-silver-600">Answer later</p>
          <p className="mb-2 pl-3 pr-2 text-[12px] leading-snug text-silver-600">For the later phases. No need to answer these now.</p>
          <ul>{later.map((s) => <NavItem key={s.key} s={s} current={s.key === current} onPick={onPick} />)}</ul>
        </div>
      )}
      <div className="mt-8 border-t border-midnight-800 px-3 pt-5">
        {c.role === 'owner' ? (
          c.status === 'open' ? (
            <>
              <p className="text-[13px] leading-snug text-silver-400">Answered what you can for now? Send it to ANF. You can keep editing after.</p>
              <button type="button" onClick={onSubmit} className={`${btnPrimary} mt-3 w-full`} disabled={c.preview}>We are done for now</button>
            </>
          ) : (
            <p className="text-[13px] leading-snug text-silver-400">Sent to ANF. Tap Keep editing at the top to change anything.</p>
          )
        ) : (
          <p className="text-[13px] leading-snug text-silver-400">Thank you. Your answers save as you go. Tell the owner when you are finished.</p>
        )}
      </div>
    </nav>
  )
}
