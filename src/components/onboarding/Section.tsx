import { useState } from 'react'
import type { OnboardingSection } from '../../lib/onboarding/types'
import { QuestionBlock } from './Field'
import { Chip, CheckIcon, IntroText, btnSecondary, formatDay, plural, teamLinkUrl, useCopy, useOnboardCtx } from './ui'

/**
 * One section on its own screen: a document-style header (part, title, intro
 * and a one-line ledger of where it stands), the questions on hairline rules,
 * an "Answer later" fold for collapsed phases, and "Mark this section done".
 */

export function SectionView({ section, partIndex, onlyKeys, intro }: {
  section: OnboardingSection
  partIndex: number
  /** When set (Only unanswered), show just these keys. */
  onlyKeys?: Set<string> | null
  /** The form's own intro, shown above the first section. */
  intro?: string
}) {
  const c = useOnboardCtx()
  const [laterOpen, setLaterOpen] = useState(false)
  const vis = c.visibility
  const tally = c.progress?.bySection[section.key]
  const mark = c.sectionState[section.key]
  const ready = !!mark?.ready
  const visible = section.questions.filter((q) => vis?.shown.has(q.key))
  const filtered = onlyKeys ? visible.filter((q) => onlyKeys.has(q.key)) : visible
  const now = filtered.filter((q) => !vis?.later.has(q.key))
  const later = filtered.filter((q) => vis?.later.has(q.key))
  const ownerOnly = section.audience === 'owner' && c.role === 'owner'
  const neededHere = tally?.needed ?? 0
  const canMark = !c.readOnly && !(section.audience === 'owner' && c.role === 'team')

  return (
    <section aria-labelledby={`sec-${section.key}`} className="min-w-0">
      {intro && (
        <div className="mb-10 border-b border-midnight-800 pb-8">
          <p className="font-display text-[12px] uppercase tracking-[0.16em] text-flame-400">Onboarding</p>
          <h1 className="mt-2 font-display text-[30px] font-semibold leading-[1.1] text-silver-100 [text-wrap:balance] md:text-[38px]">{c.server?.form.title}</h1>
          <IntroText text={intro} className="mt-4 max-w-[62ch] text-[17px] leading-relaxed text-silver-300" />
        </div>
      )}

      <header className="border-b border-midnight-700/80 pb-5">
        <p className="font-display text-[12px] uppercase tracking-[0.16em] text-silver-500">
          Part {partIndex + 1} <span className="text-silver-700">/</span> {section.part}
        </p>
        <div className="mt-2 flex flex-wrap items-start gap-x-3 gap-y-2">
          <h2 id={`sec-${section.key}`} className="min-w-0 font-display text-[26px] font-semibold leading-tight text-silver-100 [text-wrap:balance] md:text-[30px]">
            {section.title}
          </h2>
          {ownerOnly && <span className="pt-2"><Chip tone="owner">Owner only</Chip></span>}
        </div>
        <IntroText text={section.intro} className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-silver-400 [text-wrap:pretty]" />
        {intro && c.role === 'owner' && c.teamToken && <TeamLinkBox token={c.teamToken} />}
        {tally && (
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] tabular-nums text-silver-500">
            <span><span className="text-silver-200">{tally.answered}</span> of {tally.total} answered</span>
            {neededHere > 0 && <span className="text-flame-300">{plural(neededHere, 'needed soon', 'needed soon')}</span>}
            {ready && (
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <CheckIcon className="h-3 w-3" /> Ready for ANF{mark?.by ? ` (${mark.by}, ${formatDay(mark.at)})` : ''}
              </span>
            )}
          </p>
        )}
      </header>

      {visible.length === 0 && (
        <p className="py-8 text-[15px] text-silver-500">Nothing to answer here based on your earlier answers. You can move on.</p>
      )}
      {visible.length > 0 && filtered.length === 0 && (
        <p className="py-8 text-[15px] text-silver-500">Everything in this section has an answer. Switch to All questions to see them.</p>
      )}

      <div className="divide-y divide-midnight-800">
        {now.map((q) => <QuestionBlock key={q.key} q={q} answer={c.effective[q.key]} />)}
      </div>

      {later.length > 0 && (
        <div className="mt-2 border-t border-midnight-700/80 pt-4">
          <button type="button" onClick={() => setLaterOpen((o) => !o)} aria-expanded={laterOpen} className="flex w-full items-baseline justify-between gap-3 text-left">
            <span>
              <span className="font-display text-[15px] font-medium text-silver-200">Answer later</span>
              <span className="ml-2 text-[13px] text-silver-500">{plural(later.length, 'question', 'questions')} for later phases</span>
            </span>
            <span className="text-[13px] text-silver-500">{laterOpen ? 'Hide' : 'Show'}</span>
          </button>
          {laterOpen && (
            <div className="divide-y divide-midnight-800">
              {later.map((q) => <QuestionBlock key={q.key} q={q} answer={c.effective[q.key]} />)}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-midnight-700/80 pt-6">
        {ready ? (
          <>
            <Chip tone="ok"><CheckIcon className="h-3 w-3" /> Ready for ANF</Chip>
            {canMark && (
              <button type="button" onClick={() => c.markSection(section.key, false)} className="text-sm text-silver-400 underline-offset-4 hover:text-silver-100 hover:underline">
                Undo
              </button>
            )}
          </>
        ) : (
          canMark && (
            <button type="button" onClick={() => c.markSection(section.key, true)} className={btnSecondary}>
              Mark this section done
            </button>
          )
        )}
        <p className="text-[13px] text-silver-500">
          {ready ? 'ANF knows these answers are final. You can still change them.' : 'Tells ANF these answers are final. You can still change them after.'}
        </p>
      </div>
      {c.refused[`section:${section.key}`] && <p className="mt-2 text-sm text-rose-300">That mark was not saved. Reload the page and try again.</p>}
    </section>
  )
}

/**
 * Owner link, first section: the team's own link, right where the intro says
 * to send it. It hides the Owner only questions, so it is the easy one to share.
 */
function TeamLinkBox({ token }: { token: string }) {
  const { copy, copied } = useCopy()
  const url = teamLinkUrl(token)
  return (
    <div className="mt-5 max-w-[64ch] rounded-md border border-midnight-700 bg-midnight-900/60 px-4 py-3.5">
      <p className="font-display text-[12px] uppercase tracking-[0.14em] text-silver-500">Your team&rsquo;s link</p>
      <p className="mt-1 text-[14px] leading-relaxed text-silver-300">Send this one to your team. It hides every question marked Owner only.</p>
      <div className="mt-2.5 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={url}
          aria-label="Your team's link"
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-midnight-700 bg-[#07102B] px-3 py-2 font-mono text-[16px] text-silver-300 sm:text-[13px]"
        />
        <button type="button" onClick={() => void copy(url)} className={btnSecondary}>
          {copied ? <><CheckIcon className="h-3.5 w-3.5" /> Copied</> : 'Copy the team link'}
        </button>
      </div>
    </div>
  )
}
