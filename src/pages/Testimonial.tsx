import { useEffect, useLayoutEffect, useRef, useState, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { useParams } from 'react-router-dom'
import { clearLocalDrafts, useLocalDraft } from '../hooks/useLocalDraft'
import { useSeo } from '../lib/useSeo'
import {
  loadTestimonialLink, markTestimonialOpened, sendTestimonial, writeTestimonialDraft,
  type DraftChange, type LoadResult, type TestimonialLink,
} from '../lib/testimonial'

/**
 * /testimonial/:token: the page behind a client's personal ask.
 *
 * Three short questions, a draft written only from those answers, and a choice
 * of how their name appears. They can change every word or skip the draft and
 * write it themselves. Standalone (no marketing header, footer or chat), noindex.
 * The token is the only key: it never goes into storage keys or analytics
 * (traffic.ts records this route as plain /testimonial).
 *
 * The Google step is the same for everyone, whatever rating they gave, and it
 * stays separate on purpose: Google bars a business from steering what a review
 * says, so the page offers the link and leaves the words and the stars to them.
 */

type Step = 'answers' | 'draft' | 'name'
type NameChoice = '' | 'full' | 'first' | 'private'

const label = 'block text-[17px] font-medium leading-snug text-silver-100'
const hint = 'mt-1 block text-[15px] leading-snug text-silver-400'
const field =
  'mt-2.5 w-full rounded-md border border-midnight-700 bg-midnight-900 px-3.5 py-3 leading-relaxed text-silver-100 ' +
  'placeholder:text-silver-600 focus:border-flame-500/70 focus:outline-none focus:ring-1 focus:ring-flame-500/40'
const input = `${field} text-[17px]`
const primary =
  'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-md bg-flame-500 px-5 text-base font-semibold text-midnight-950 ' +
  'transition-colors hover:bg-flame-400 disabled:pointer-events-none disabled:opacity-50'
const secondary =
  'inline-flex min-h-[48px] items-center justify-center rounded-md border border-midnight-500 px-5 text-base font-medium text-silver-100 ' +
  'transition-colors hover:border-silver-500 disabled:pointer-events-none disabled:opacity-50'
const quiet = 'min-h-[44px] text-base text-silver-300 underline underline-offset-4 hover:text-silver-100 disabled:opacity-50'

/** Keeps two links on one device apart without the token itself going into storage. */
function scopeOf(token: string): string {
  let h = 2166136261
  for (let i = 0; i < token.length; i++) {
    h ^= token.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

function firstNameOf(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}

/** Grows with the draft, so a full testimonial reads whole on a phone with no inner scrolling. */
function GrowingText({ value, onChange, ...rest }: { value: string; onChange: (v: string) => void } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'>) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight + 2}px`
  }, [value])
  return <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
}

function Page({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-[#07102B] px-4 pb-10">
      <div className="mx-auto w-full max-w-[640px] flex-1 pt-6 md:pt-10">
        <header className="flex items-center justify-between gap-4">
          <img src="/anf-wordmark.webp" alt="ANF Consulting" width={84} height={56} className="-ml-3 h-14 w-auto mix-blend-lighten" />
          <p className="text-[15px] text-silver-300">Andrew Fowler</p>
        </header>
        {children}
      </div>
    </div>
  )
}

function Heading({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null)
  // A new screen starts at the top, and a screen reader hears its heading.
  useEffect(() => {
    window.scrollTo({ top: 0 })
    ref.current?.focus({ preventScroll: true })
  }, [])
  return (
    <h1 ref={ref} tabIndex={-1} className="font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.02em] text-silver-100 outline-none [text-wrap:balance] md:text-[44px]">
      {children}
    </h1>
  )
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-silver-200">{children}</p>
}

function Screen({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Page>
      <main className="mt-12">
        <Heading>{title}</Heading>
        <div className="mt-4 max-w-[60ch] text-[17px] leading-relaxed text-silver-200">{children}</div>
      </main>
    </Page>
  )
}

export function Testimonial() {
  const { token = '' } = useParams()
  useSeo({ title: 'Share how it went', description: 'A private page for an ANF Consulting client.', noindex: true })

  // Belt and braces with the vercel.json header: no Referer leaves this page.
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const wellFormed = /^[0-9a-f]{32}$/.test(token)
  const [loaded, setLoaded] = useState<LoadResult | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (!wellFormed) return
    let on = true
    void loadTestimonialLink(token).then((r) => { if (on) setLoaded(r) })
    return () => { on = false }
  }, [token, wellFormed, attempt])
  const result: LoadResult | null = wellFormed ? loaded : { kind: 'not_found' }

  if (!result) {
    return (
      <Page>
        <div className="mt-12 space-y-4" role="status" aria-label="Loading your page">
          <div className="h-9 w-2/3 rounded bg-midnight-900" />
          <div className="h-4 w-full rounded bg-midnight-900" />
          <div className="h-4 w-5/6 rounded bg-midnight-900" />
        </div>
      </Page>
    )
  }
  if (result.kind === 'not_found') {
    return (
      <Screen title="This link does not work.">
        It may have been cut short when it was copied. Email me at{' '}
        <a className="underline underline-offset-4" href="mailto:admin@anfconsult.com">admin@anfconsult.com</a> and I will send a fresh one.
      </Screen>
    )
  }
  if (result.kind === 'closed') {
    return (
      <Screen title="This link is closed.">
        If you would still like to share something, email me at{' '}
        <a className="underline underline-offset-4" href="mailto:admin@anfconsult.com">admin@anfconsult.com</a>.
      </Screen>
    )
  }
  if (result.kind === 'error') {
    return (
      <Screen title="This page did not load.">
        <p>Your connection may be slow. Anything you typed before is kept on this device.</p>
        <button type="button" className={`${primary} mt-5`} onClick={() => { setLoaded(null); setAttempt((n) => n + 1) }}>Try again</button>
      </Screen>
    )
  }
  if (result.link.state === 'done') {
    return <Thanks link={result.link} text={result.link.testimonial ?? ''} isPrivate={result.link.isPrivate === true} />
  }
  return <Flow token={token} link={result.link} />
}

function Flow({ token, link }: { token: string; link: TestimonialLink }) {
  const scope = scopeOf(token)
  const k = (name: string) => `testimonial.${scope}.${name}`
  const [step, setStep] = useLocalDraft<Step>(k('step'), 'answers')
  const [before, setBefore] = useLocalDraft(k('before'), '')
  const [outcome, setOutcome] = useLocalDraft(k('outcome'), '')
  const [advice, setAdvice] = useLocalDraft(k('advice'), '')
  const [rating, setRating] = useLocalDraft(k('rating'), 0)
  const [text, setText] = useLocalDraft(k('text'), '')
  const [aiAssisted, setAiAssisted] = useLocalDraft(k('ai'), false)
  const [name, setName] = useLocalDraft(k('name'), link.name)
  const [business, setBusiness] = useLocalDraft(k('business'), link.business)
  const [choice, setChoice] = useLocalDraft<NameChoice>(k('choice'), '')

  const [busy, setBusy] = useState<'' | 'draft' | DraftChange | 'send'>('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [undo, setUndo] = useState<string | null>(null)
  const [limitHit, setLimitHit] = useState(false)
  const [sent, setSent] = useState<{ text: string; isPrivate: boolean } | null>(null)

  // Counts as opened on a real tap or keystroke, so a mail scanner never does.
  useEffect(() => {
    const once = () => {
      markTestimonialOpened(token)
      window.removeEventListener('pointerdown', once)
      window.removeEventListener('keydown', once)
    }
    window.addEventListener('pointerdown', once)
    window.addEventListener('keydown', once)
    return () => {
      window.removeEventListener('pointerdown', once)
      window.removeEventListener('keydown', once)
    }
  }, [token])

  const go = (next: Step) => {
    setError('')
    setNotice('')
    setUndo(null)
    setStep(next)
  }
  const answered = `${before}${outcome}${advice}`.trim().length >= 12
  const stitched = [before, outcome, advice].map((a) => a.trim()).filter(Boolean).join(' ')

  const writeDraft = async () => {
    setError('')
    if (rating < 1) { setError('Please pick a rating first.'); return }
    if (!answered) { setError('Answer at least one question, even in a few words. The draft only uses what you tell me.'); return }
    setBusy('draft')
    const r = await writeTestimonialDraft(token, { before, outcome, advice, rating })
    setBusy('')
    const earlier = text
    if (r.kind === 'ok') {
      setText(r.draft)
      setAiAssisted(true)
      go('draft')
      if (earlier.trim()) setUndo(earlier)
      return
    }
    // Never swap out a draft they already have just because the writer is down.
    setLimitHit(r.kind === 'limit')
    go('draft')
    if (earlier.trim()) {
      setNotice('The draft writer is not available right now, so your text is as you left it.')
    } else {
      setText(stitched)
      setAiAssisted(false)
      setNotice('The draft writer is not available right now, so these are your answers as you wrote them. Tidy them up however you like.')
    }
  }
  const writeMyself = () => {
    setError('')
    if (rating < 1) { setError('Please pick a rating first.'); return }
    go('draft')
  }
  const adjust = async (change: DraftChange) => {
    setError('')
    setNotice('')
    setBusy(change)
    const r = await writeTestimonialDraft(token, { before, outcome, advice, rating, current: text, change })
    setBusy('')
    if (r.kind === 'ok') {
      setUndo(text)
      setText(r.draft)
      setAiAssisted(true)
    } else if (r.kind === 'limit') {
      setLimitHit(true)
      setNotice('That is as many rewrites as this link allows. Your text is safe, and you can change anything by hand.')
    } else {
      setNotice('The draft writer is not available right now. Your text is safe, and you can change anything by hand.')
    }
  }
  const toName = () => {
    if (text.trim().length < 10) { setError('Write a sentence or two first.'); return }
    go('name')
  }
  const send = async () => {
    setError('')
    if (name.trim().length < 2) { setError('Please add your name.'); return }
    if (!choice) { setError('Please choose how your name should appear.'); return }
    setBusy('send')
    try {
      await sendTestimonial(token, {
        clientName: name.trim(),
        businessName: business.trim(),
        rating,
        before: before.trim(),
        outcome: outcome.trim(),
        advice: advice.trim(),
        testimonial: text.trim(),
        allowPublic: choice !== 'private',
        nameDisplay: choice === 'full' ? 'full' : 'first',
        aiAssisted,
      })
      setSent({ text: text.trim(), isPrivate: choice === 'private' })
      clearLocalDrafts(...['step', 'before', 'outcome', 'advice', 'rating', 'text', 'ai', 'name', 'business', 'choice'].map(k))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not go through. Please try again.')
    } finally {
      setBusy('')
    }
  }

  if (sent) return <Thanks link={{ ...link, first: firstNameOf(name) || link.first }} text={sent.text} isPrivate={sent.isPrivate} />

  const errorLine = error && <p role="alert" className="mt-6 text-[16px] text-flame-300">{error}</p>

  // Each step keys its own Page: a new screen remounts, which resets the scroll
  // and moves focus to its heading.
  if (step === 'answers') {
    return (
      <Page key={step}>
        <main className="mt-10">
          <Heading>{`Hi ${link.first || 'there'}. How did it go?`}</Heading>
          <Lead>
            Three short questions about {link.service || 'our work together'}, then a draft, then your name. Answer the way you would say it out loud. Rough is fine: you decide what stays.
          </Lead>
          <p className="mt-2 text-[15px] leading-snug text-silver-400 md:hidden">On a phone, tap the microphone on your keyboard and just talk.</p>

          <div className="mt-9 space-y-8">
            <label className="block">
              <span className={label}>What was going on before we worked together?</span>
              <span className={hint}>What was slow, messy or missing?</span>
              <textarea className={input} rows={3} maxLength={1500} value={before} onChange={(e) => setBefore(e.target.value)} />
            </label>
            <label className="block">
              <span className={label}>What is different now?</span>
              <span className={hint}>Anything specific helps: a number, a moment, something that changed day to day. If not much changed, say that.</span>
              <textarea className={input} rows={3} maxLength={1500} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
            </label>
            <label className="block">
              <span className={label}>What would you tell another business owner about working with me?</span>
              <span className={hint}>The good and the not so good. Both help.</span>
              <textarea className={input} rows={3} maxLength={1500} value={advice} onChange={(e) => setAdvice(e.target.value)} />
            </label>
            <Stars value={rating} onChange={setRating} />
          </div>

          {errorLine}
          <p role="status" className="mt-6 text-[16px] text-silver-300">{busy === 'draft' ? 'Writing your draft. This can take about 20 seconds.' : ''}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-3">
            {text.trim() ? (
              <>
                <button type="button" className={primary} disabled={!!busy} onClick={() => go('draft')}>Back to my draft</button>
                <button type="button" className={quiet} disabled={!!busy} onClick={() => void writeDraft()}>Write a new draft from these answers</button>
              </>
            ) : (
              <>
                <button type="button" className={primary} disabled={!!busy} onClick={() => void writeDraft()}>{busy === 'draft' ? 'Writing...' : 'Write my draft'}</button>
                <button type="button" className={quiet} disabled={!!busy} onClick={writeMyself}>I would rather write it myself</button>
              </>
            )}
          </div>
          <p className="mt-8 max-w-[60ch] text-[14px] leading-relaxed text-silver-500">
            When you press Write my draft, your answers go to an AI service to write it. Nothing goes on the website unless you choose a name on the last screen and I approve it.
          </p>
        </main>
      </Page>
    )
  }

  if (step === 'draft') {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    return (
      <Page key={step}>
        <main className="mt-10">
          <Heading>{aiAssisted ? 'Here is your draft. Change anything.' : 'In your own words.'}</Heading>
          <Lead>
            {aiAssisted
              ? 'AI wrote it from your answers. If a word is not how you would say it, change it. If it says something that is not true, take it out.'
              : 'A few sentences is plenty. Say what was going on, what changed, and what you would tell someone else.'}
          </Lead>

          <label className="mt-8 block">
            <span className="sr-only">Your testimonial</span>
            <GrowingText className={`${field} text-[19px]`} rows={6} maxLength={2000} value={text} onChange={(v) => { setText(v); setUndo(null) }} />
          </label>
          <p className="mt-1.5 text-[15px] text-silver-500 [font-variant-numeric:tabular-nums]">{words} {words === 1 ? 'word' : 'words'}</p>

          {notice && <p role="status" className="mt-4 text-[16px] leading-snug text-silver-200">{notice}</p>}
          {busy && <p role="status" className="mt-4 text-[16px] text-silver-300">Rewriting. This can take about 20 seconds.</p>}

          {!limitHit && text.trim().length >= 12 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <button type="button" className={secondary} disabled={!!busy} onClick={() => void adjust('shorter')}>Make it shorter</button>
              <button type="button" className={secondary} disabled={!!busy} onClick={() => void adjust('casual')}>More casual</button>
              <button type="button" className={secondary} disabled={!!busy} onClick={() => void adjust('again')}>Try again</button>
              {undo !== null && <button type="button" className={`${quiet} ml-2`} disabled={!!busy} onClick={() => { setText(undo); setUndo(null) }}>Undo</button>}
            </div>
          )}

          {errorLine}
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <button type="button" className={primary} disabled={!!busy} onClick={toName}>This sounds like me</button>
            <button type="button" className={quiet} disabled={!!busy} onClick={() => go('answers')}>Back to my answers</button>
          </div>
        </main>
      </Page>
    )
  }

  const biz = business.trim()
  const fullLine = [name.trim(), biz].filter(Boolean).join(', ')
  const firstLine = [firstNameOf(name), biz].filter(Boolean).join(', ')
  const options: { value: NameChoice; words: string }[] = [
    { value: 'full', words: fullLine || 'Your full name' },
    ...(firstLine !== fullLine ? [{ value: 'first' as const, words: firstLine }] : []),
    { value: 'private', words: 'Keep it private. Only I will see it.' },
  ]
  const shownAs = choice === 'private' ? 'Private, only I will see it' : choice === 'first' ? firstLine : choice === 'full' ? fullLine : ''

  return (
    <Page key={step}>
      <main className="mt-10">
        <Heading>How should your name appear?</Heading>

        <figure className="mt-8 rounded-md bg-midnight-900 px-5 py-5">
          <blockquote className="whitespace-pre-line text-[19px] leading-relaxed text-silver-100">{text.trim()}</blockquote>
          <figcaption className="mt-3 min-h-[1.5em] text-[16px] text-silver-300">{shownAs}</figcaption>
        </figure>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className={label}>Your name</span>
            <input className={input} value={name} autoComplete="name" onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block min-w-0">
            <span className={label}>Your business</span>
            <input className={input} value={business} autoComplete="organization" onChange={(e) => setBusiness(e.target.value)} />
          </label>
        </div>

        <fieldset className="mt-8">
          <legend className={label}>Choose one</legend>
          <div className="mt-2.5 space-y-2">
            {options.map((o) => (
              <label key={o.value} className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-md border border-midnight-700 px-4 py-3 text-[17px] leading-snug text-silver-100 has-[:checked]:border-flame-500 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-flame-500/60">
                <input type="radio" name="name-choice" value={o.value} checked={choice === o.value} onChange={() => setChoice(o.value)} className="h-4 w-4 shrink-0 accent-flame-500" />
                <span className="min-w-0 break-words">{o.words}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {choice && (
          <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-silver-400">
            {choice === 'private'
              ? 'I will read it, and it stays off the website and out of my marketing.'
              : 'You are OK with ANF Consulting using these words with that name on its website and in its marketing. Ask me any time and I will take them down.'}
          </p>
        )}

        {errorLine}
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" className={primary} disabled={!!busy || !choice || name.trim().length < 2} onClick={() => void send()}>{busy === 'send' ? 'Sending...' : 'Send it to me'}</button>
          <button type="button" className={quiet} disabled={!!busy} onClick={() => go('draft')}>Back to my words</button>
        </div>
      </main>
    </Page>
  )
}

function Stars({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <fieldset>
      <legend className={label}>Overall, how did it go?</legend>
      <div className="mt-2 flex items-center" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (hover || value) >= n
          return (
            <label key={n} className="cursor-pointer p-1.5 first:-ml-1.5" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" />
              <span className="sr-only">{n} out of 5</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-9 w-9 rounded-sm transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-flame-400 ${active ? 'text-flame-500' : 'text-silver-700'}`} fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
                <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
              </svg>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function Thanks({ link, text, isPrivate }: { link: TestimonialLink; text: string; isPrivate: boolean }) {
  const [copied, setCopied] = useState<'' | 'yes' | 'failed'>('')
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => setCopied('yes'), () => setCopied('failed'))
  }
  return (
    <Page>
      <main className="mt-12">
        <Heading>{link.first ? `Thank you, ${link.first}.` : 'Thank you.'}</Heading>
        <Lead>
          I have it now, and I read every one myself. {isPrivate ? 'It stays private.' : 'Ask me any time and I will take it down.'} Need to change something? Email me at{' '}
          <a className="underline underline-offset-4" href="mailto:admin@anfconsult.com">admin@anfconsult.com</a>.
        </Lead>

        {text && (
          <figure className="mt-8 rounded-md bg-midnight-900 px-5 py-5">
            <blockquote className="whitespace-pre-line text-[19px] leading-relaxed text-silver-100">{text}</blockquote>
          </figure>
        )}

        {link.googleReviewUrl && (
          <section className="mt-12">
            <h2 className="font-display text-[24px] font-semibold leading-tight text-silver-100">One more thing, if you are willing.</h2>
            <p className="mt-3 max-w-[60ch] text-[17px] leading-relaxed text-silver-200">
              A review on Google helps the next business owner find me. It takes about a minute. What you say there and the stars you pick are entirely up to you.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <a className={primary} href={link.googleReviewUrl} target="_blank" rel="noopener noreferrer">Open Google</a>
              {text && <button type="button" className={quiet} onClick={copy}>{copied === 'yes' ? 'Copied' : 'Copy what you wrote'}</button>}
            </div>
            <p role="status" className="mt-3 text-[15px] leading-snug text-silver-400">
              {copied === 'yes' ? 'Change anything you like before you post it.' : copied === 'failed' ? 'This browser would not copy it. You can select the words above instead.' : 'Google may ask you to sign in.'}
            </p>
          </section>
        )}
      </main>
    </Page>
  )
}
