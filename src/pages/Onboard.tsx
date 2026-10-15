import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useSeo } from '../lib/useSeo'
import { useOnboard } from '../lib/onboarding/useOnboard'
import { USING_MOCK } from '../lib/onboarding/api'
import { OnboardContext, btnSecondary, formatWhen, useOnboardCtx } from '../components/onboarding/ui'
import { TopBar } from '../components/onboarding/TopBar'
import { SectionNav, useNavGroups } from '../components/onboarding/SectionNav'
import { SectionView } from '../components/onboarding/Section'
import { QuestionBlock } from '../components/onboarding/Field'
import { ProgressPanel } from '../components/onboarding/ProgressPanel'
import { NamePrompt } from '../components/onboarding/NamePrompt'
import { SubmitDialog, ThankYou } from '../components/onboarding/SubmitDialog'
import {
  ClosedScreen, ErrorScreen, FooterLine, LoadingScreen, NotFoundScreen, OfflineScreen,
} from '../components/onboarding/StateScreens'

/**
 * /onboard/:token: the client onboarding form.
 *
 * A long questionnaire the client's owner (and team) fill in at their own pace
 * while Andrew watches the answers arrive in the CRM. Standalone (no marketing
 * header, footer or chat), noindex, no third-party scripts. The token is the
 * only key: it never goes into storage keys, logs or analytics (traffic.ts
 * records this route as plain /onboard).
 *
 * State machine: loading (slow after 15 s) -> not_found | closed | offline |
 * error | ready. All form logic lives in useOnboard; this file is layout.
 */

type Filter = 'all' | 'unanswered' | 'first'

function readHashSection(): string | null {
  const m = /(?:^#|&)section=([a-z0-9_]+)/.exec(window.location.hash)
  return m ? m[1] : null
}

export function Onboard() {
  const { token = '' } = useParams()
  const [params] = useSearchParams()
  const preview = params.get('preview') === '1'
  useSeo({ title: 'Onboarding', description: 'Private onboarding form for an ANF Consulting client.', noindex: true })

  // Belt and braces with the vercel.json header: no Referer leaves this page.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const ctl = useOnboard(token, preview)

  if (ctl.screen.kind === 'loading') return <LoadingScreen slow={ctl.screen.slow} onRetry={ctl.retryLoad} />
  if (ctl.screen.kind === 'not_found') return <NotFoundScreen />
  if (ctl.screen.kind === 'closed') return <ClosedScreen unsent={ctl.closedUnsent} />
  if (ctl.screen.kind === 'offline') return <OfflineScreen onRetry={ctl.retryLoad} />
  if (ctl.screen.kind === 'error' || !ctl.template || !ctl.model) return <ErrorScreen onRetry={ctl.retryLoad} />

  return (
    <OnboardContext.Provider value={ctl}>
      <ReadyForm />
    </OnboardContext.Provider>
  )
}

function Banner({ tone, children }: { tone: 'info' | 'warn' | 'ok'; children: ReactNode }) {
  const tones = {
    info: 'border-midnight-700 bg-midnight-900 text-silver-300',
    // Opaque: the bar sits over scrolling text. Amber and emerald at 7% premixed over #07102B.
    warn: 'border-amber-300/30 bg-[#181e2d] text-amber-100',
    ok: 'border-emerald-400/30 bg-[#0a1e33] text-emerald-100',
  }
  return <div className={`border-b px-4 py-2.5 text-center text-[13px] leading-snug md:px-6 ${tones[tone]}`}>{children}</div>
}

function ReadyForm() {
  const c = useOnboardCtx()
  const { order } = useNavGroups()
  const firstKey = c.template?.sections[0]?.key ?? 'start'
  const [current, setCurrent] = useState<string>(() => readHashSection() ?? c.initialSection ?? firstKey)
  const [filter, setFilter] = useState<Filter>('all')
  const [drawer, setDrawer] = useState(false)
  const [progressSheet, setProgressSheet] = useState(false)
  const [askName, setAskName] = useState(() => !c.nameAsked)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [thanks, setThanks] = useState(false)
  const [onlyKeys, setOnlyKeys] = useState<Set<string> | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  // The top bar and its status banners stick together; the side columns start below them.
  const headRef = useRef<HTMLDivElement>(null)
  const [headH, setHeadH] = useState(56)
  useLayoutEffect(() => {
    const el = headRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeadH(Math.round(el.getBoundingClientRect().height)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const sideStyle = { top: headH, height: `calc(100vh - ${headH}px)` }

  // A section that no longer exists (or is hidden) falls back to the first one.
  const currentKey = order.some((s) => s.key === current) ? current : order[0]?.key ?? firstKey
  const section = c.model?.sectionByKey.get(currentKey)
  const partIndex = useMemo(() => {
    if (!c.model || !section) return 0
    return c.model.parts.findIndex((p) => p.part === section.part)
  }, [c.model, section])
  const idx = order.findIndex((s) => s.key === currentKey)
  const prev = idx > 0 ? order[idx - 1] : null
  const next = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null

  // "Only unanswered" is a snapshot taken when the filter or section changes,
  // so a question does not vanish while someone is typing in it.
  const unansweredIn = useCallback((key: string) => {
    const set = new Set<string>()
    for (const q of c.model?.sectionByKey.get(key)?.questions ?? []) if (!c.answeredKeys.has(q.key)) set.add(q.key)
    return set
  }, [c.model, c.answeredKeys])

  const chooseFilter = (f: Filter) => {
    setFilter(f)
    setOnlyKeys(f === 'unanswered' ? unansweredIn(currentKey) : null)
  }

  const go = useCallback((key: string) => {
    setCurrent(key)
    setOnlyKeys((cur) => (cur ? unansweredIn(key) : null))
    setDrawer(false)
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}#section=${key}`)
    window.scrollTo({ top: 0 })
  }, [unansweredIn])

  useEffect(() => { c.rememberSection(currentKey) }, [currentKey]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onHash = () => {
      const k = readHashSection()
      if (k) setCurrent(k)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const essentials = useMemo(
    () => (c.template?.phase1Essentials ?? []).filter((k) => c.visibility?.shown.has(k)).map((k) => c.model!.byKey.get(k)!).filter(Boolean),
    [c.template, c.visibility, c.model],
  )

  // The progress sheet is for widths without the right-hand progress column.
  const openProgress = () => {
    if (!window.matchMedia('(min-width: 1280px)').matches) setProgressSheet(true)
  }
  const showFirst = () => {
    setProgressSheet(false)
    setThanks(false)
    chooseFilter('first')
    window.scrollTo({ top: 0 })
  }

  const status = c.status
  const submitted = status === 'submitted'
  const showThanks = thanks && submitted

  const filterBtn = (f: Filter, label: string, extra = '') => (
    <button
      type="button"
      onClick={() => chooseFilter(f)}
      aria-pressed={filter === f}
      className={`${extra} shrink-0 rounded-full border px-3 py-1.5 text-[13px] transition-colors ${
        filter === f ? 'border-silver-300 bg-silver-100/10 text-silver-100' : 'border-midnight-700 text-silver-400 hover:text-silver-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#07102B] text-silver-300">
      {USING_MOCK && <Banner tone="info">Local mock data (development). Nothing here reaches the database.</Banner>}
      <div ref={headRef} className="sticky top-0 z-30">
      <TopBar
        onChangeName={() => setAskName(true)}
        onProgress={openProgress}
        onSubmit={() => setSubmitOpen(true)}
      />
      {c.preview && <Banner tone="info">Preview. Nothing you do here is saved.</Banner>}
      {(!c.online || c.fromCache) && !c.preview && (
        <Banner tone="warn">Offline. Your answers are kept on this device and will send when you are back online.</Banner>
      )}
      {submitted && !showThanks && (
        c.role === 'owner' ? (
          <Banner tone="ok">
            You sent this to ANF{c.server?.form.submitted_at ? ` on ${formatWhen(c.server.form.submitted_at)}` : ''}. It is read-only for now.{' '}
            <button type="button" className="ml-1 font-medium text-emerald-200 underline underline-offset-4" onClick={() => void c.keepEditing()}>Keep editing</button>
          </Banner>
        ) : (
          <Banner tone="ok">
            The owner sent this to ANF. Ask them to tap Keep editing if you need to change something. Anything you typed is kept on this device and will save when the form opens again.
          </Banner>
        )
      )}
      </div>

      <div className="mx-auto flex max-w-[1440px]">
        <aside style={sideStyle} className="sticky hidden w-72 shrink-0 overflow-y-auto border-r border-midnight-800 px-3 py-6 lg:block">
          <SectionNav current={showThanks ? '' : currentKey} onPick={(k) => { setThanks(false); if (filter === 'first') chooseFilter('all'); go(k) }} onSubmit={() => setSubmitOpen(true)} />
        </aside>

        <main ref={mainRef} className="min-w-0 flex-1 px-4 pb-28 pt-6 md:px-8 lg:pb-12">
          <div className="mx-auto max-w-[720px]">
            {showThanks ? (
              <ThankYou onKeepEditing={() => setThanks(false)} onClose={() => setThanks(false)} />
            ) : (
              <>
                <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0" role="group" aria-label="Show">
                  {filterBtn('all', 'All questions')}
                  {filterBtn('unanswered', 'Only unanswered')}
                  {/* First on phones, where the short list matters most. */}
                  {filterBtn('first', 'What we need first', 'order-first md:order-none')}
                </div>

                <fieldset disabled={c.readOnly} className="min-w-0">
                  {filter === 'first' ? (
                    <section aria-labelledby="first-title">
                      <header className="border-b border-midnight-700/80 pb-5">
                        <p className="font-display text-[12px] uppercase tracking-[0.16em] text-silver-500">Across the whole form</p>
                        <h2 id="first-title" className="mt-2 font-display text-[26px] font-semibold leading-tight text-silver-100 md:text-[30px]">What we need first</h2>
                        <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-silver-400">
                          The answers that let the first phase start: accounts, your domain, email and the basics. Answer these and the rest can follow at your pace.
                        </p>
                        <p className="mt-4 text-[13px] tabular-nums text-silver-500">
                          <span className="text-silver-200">{essentials.filter((q) => c.answeredKeys.has(q.key)).length}</span> of {essentials.length} answered
                        </p>
                      </header>
                      <div className="divide-y divide-midnight-800">
                        {essentials.map((q) => {
                          const sec = c.model!.sectionOf.get(q.key)!
                          return (
                            <QuestionBlock
                              key={q.key}
                              q={q}
                              answer={c.effective[q.key]}
                              eyebrow={
                                <p className="mb-2 text-[12px] text-silver-500">
                                  {sec.title}{' '}
                                  {/* A link, not a button, so it still works while the form is read-only. */}
                                  <a
                                    href={`#section=${sec.key}`}
                                    className="ml-1 text-silver-400 underline underline-offset-4 hover:text-silver-200"
                                    onClick={(e) => { e.preventDefault(); chooseFilter('all'); go(sec.key) }}
                                  >
                                    Go to section
                                  </a>
                                </p>
                              }
                            />
                          )
                        })}
                      </div>
                    </section>
                  ) : section ? (
                    <SectionView
                      key={section.key}
                      section={section}
                      partIndex={partIndex}
                      onlyKeys={onlyKeys}
                      intro={section.key === firstKey ? c.template?.intro : undefined}
                    />
                  ) : null}
                </fieldset>

                {filter !== 'first' && (
                  <nav aria-label="Next and previous section" className="mt-10 hidden grid-cols-1 gap-3 border-t border-midnight-800 pt-6 sm:grid sm:grid-cols-2">
                    <div>
                      {prev && (
                        <button type="button" onClick={() => go(prev.key)} className="group text-left">
                          <span className="block text-[12px] text-silver-600">Previous</span>
                          <span className="font-display text-[16px] text-silver-300 group-hover:text-silver-100">{prev.title}</span>
                        </button>
                      )}
                    </div>
                    <div className="sm:text-right">
                      {next && (
                        <button type="button" onClick={() => go(next.key)} className="group sm:text-right">
                          <span className="block text-[12px] text-silver-600">Next</span>
                          <span className="font-display text-[16px] text-silver-300 group-hover:text-flame-300">{next.title}</span>
                        </button>
                      )}
                      {!next && c.role === 'owner' && status === 'open' && (
                        <button type="button" className={btnSecondary} disabled={c.preview} onClick={() => setSubmitOpen(true)}>We are done for now</button>
                      )}
                      {!next && c.role === 'team' && (
                        <p className="text-[14px] text-silver-400">Thank you. Your answers save as you go. Tell the owner when you are finished.</p>
                      )}
                    </div>
                  </nav>
                )}
              </>
            )}
            <FooterLine />
          </div>
        </main>

        <aside style={sideStyle} className="sticky hidden w-64 shrink-0 overflow-y-auto border-l border-midnight-800 px-5 py-6 xl:block">
          <ProgressPanel onFirst={showFirst} />
          <PeopleList />
        </aside>
      </div>

      {/* Phone: sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-midnight-800 bg-[#07102B] lg:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto grid h-14 max-w-[720px] grid-cols-3 items-center px-2 text-[14px]">
          <button type="button" disabled={!prev || filter === 'first'} onClick={() => prev && go(prev.key)} className="justify-self-start rounded px-3 py-2 text-silver-300 disabled:opacity-30">Previous</button>
          <button type="button" onClick={() => setDrawer(true)} className="justify-self-center rounded-md border border-midnight-700 px-3 py-1.5 font-medium text-silver-100">Sections</button>
          <button type="button" disabled={!next || filter === 'first'} onClick={() => next && go(next.key)} className="justify-self-end rounded px-3 py-2 font-medium text-flame-300 disabled:opacity-30">Next</button>
        </div>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Sections">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close sections" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[min(88vw,340px)] flex-col border-r border-midnight-700 bg-[#07102B]">
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-midnight-800 px-4">
              <p className="font-display text-[15px] font-medium text-silver-100">Sections</p>
              <button type="button" onClick={() => setDrawer(false)} className="rounded px-2 py-1 text-sm text-silver-400">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto px-2 py-4">
              <SectionNav current={currentKey} onPick={(k) => { setThanks(false); if (filter === 'first') chooseFilter('all'); go(k) }} onSubmit={() => { setDrawer(false); setSubmitOpen(true) }} />
            </div>
          </div>
        </div>
      )}

      {progressSheet && (
        <div className="fixed inset-0 z-40 xl:hidden" role="dialog" aria-modal="true" aria-label="Your progress">
          <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close" onClick={() => setProgressSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-lg border-t border-midnight-700 bg-[#07102B] px-5 pb-10 pt-5 sm:inset-x-auto sm:right-4 sm:top-16 sm:bottom-auto sm:w-80 sm:rounded-lg sm:border">
            <div className="mb-3 flex justify-end">
              <button type="button" onClick={() => setProgressSheet(false)} className="text-sm text-silver-400">Close</button>
            </div>
            <ProgressPanel onFirst={showFirst} />
            <PeopleList />
          </div>
        </div>
      )}

      {askName && !c.preview && <NamePrompt onDone={() => setAskName(false)} />}
      {submitOpen && <SubmitDialog onClose={() => setSubmitOpen(false)} onSent={() => { setSubmitOpen(false); setThanks(true); window.scrollTo({ top: 0 }) }} />}
    </div>
  )
}

function PeopleList() {
  const c = useOnboardCtx()
  const people = c.server?.form.people ?? []
  if (!people.length) return null
  return (
    <div className="mt-8 border-t border-midnight-800 pt-5">
      <p className="font-display text-[11px] uppercase tracking-[0.14em] text-silver-500">Filling this in</p>
      <ul className="mt-2 space-y-1.5">
        {people.slice(0, 8).map((p) => (
          <li key={`${p.name}-${p.link}`} className="flex items-baseline justify-between gap-2 text-[13px]">
            <span className="min-w-0 truncate text-silver-300">{p.name}</span>
            <span className="shrink-0 text-[11px] text-silver-600">{formatWhen(p.last_at)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
