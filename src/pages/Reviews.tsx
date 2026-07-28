import { useState, type FormEvent } from 'react'
import { PageHero } from '../components/PageHero'
import { Testimonials } from '../components/Testimonials'
import { useLocalDraft, clearLocalDrafts } from '../hooks/useLocalDraft'
import { submitClientReview } from '../lib/reviews'

/**
 * Public guided-review page at anfconsult.com/reviews (no auth). Andrew shares
 * the link with clients after a project. Guided prompts (before, outcome, what
 * stood out, recommendation) plus a star rating produce a usable testimonial.
 * Posts cross-origin to the CRM's public submit-review endpoint, so reviews land
 * in the CRM Reviews tab and email Andrew, the same as the class-review form.
 */

const SERVICE_OPTIONS = [
  'Website',
  'CRM or client portal',
  'AI and automation',
  'Systems integration',
  'Coaching or class',
  'Other',
]

const DRAFT_KEYS = [
  'review.name',
  'review.business',
  'review.email',
  'review.serviceSel',
  'review.serviceOther',
  'review.before',
  'review.outcome',
  'review.highlight',
  'review.recommend',
] as const

const fieldCls =
  'w-full rounded-xl border border-midnight-700/60 bg-midnight-900/60 px-4 py-2.5 text-silver-100 placeholder-silver-700 focus:border-flame-500 focus:outline-none'
const labelCls = 'block text-sm text-silver-300 mb-1.5'
const helpCls = 'text-xs text-silver-500 mb-2'

export function Reviews() {
  const [name, setName] = useLocalDraft('review.name', '')
  const [business, setBusiness] = useLocalDraft('review.business', '')
  const [email, setEmail] = useLocalDraft('review.email', '')
  const [serviceSel, setServiceSel] = useLocalDraft('review.serviceSel', '')
  const [serviceOther, setServiceOther] = useLocalDraft('review.serviceOther', '')
  const [before, setBefore] = useLocalDraft('review.before', '')
  const [outcome, setOutcome] = useLocalDraft('review.outcome', '')
  const [highlight, setHighlight] = useLocalDraft('review.highlight', '')
  const [recommend, setRecommend] = useLocalDraft('review.recommend', '')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [allowPublic, setAllowPublic] = useState(true)
  const [hp, setHp] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')
  const [googleUrl, setGoogleUrl] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (hp) {
      setStatus('done')
      return
    }
    setErr('')
    if (name.trim().length < 2) {
      setErr('Please add your name.')
      return
    }
    if (rating < 1) {
      setErr('Please pick a star rating.')
      return
    }
    setStatus('sending')
    try {
      const service = serviceSel === 'Other' ? serviceOther.trim() : serviceSel
      const { googleReviewUrl } = await submitClientReview({
        clientName: name.trim(),
        businessName: business.trim() || undefined,
        email: email.trim() || undefined,
        service,
        rating,
        before: before.trim() || undefined,
        outcome: outcome.trim() || undefined,
        highlight: highlight.trim() || undefined,
        recommend: recommend.trim() || undefined,
        allowPublic,
      })
      if (googleReviewUrl) setGoogleUrl(googleReviewUrl)
      setStatus('done')
      clearLocalDrafts(...DRAFT_KEYS)
    } catch (e) {
      setStatus('idle')
      setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'done') {
    return (
      <PageHero
        eyebrow="Review received"
        title={`Thank you, ${name.split(' ')[0] || 'so much'}.`}
        subtitle="Your words mean a lot and genuinely help other business owners know what to expect. We appreciate you taking the time."
      >
        {googleUrl && (
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-flame-500 hover:bg-flame-400 text-midnight-950 font-semibold px-6 py-3 transition-colors"
          >
            If you have one more minute, leave it on Google too
          </a>
        )}
      </PageHero>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Reviews"
        title="What our clients say"
        subtitle="Real words from people we've worked with. Read a few, or leave your own below."
      >
        <a
          href="#leave"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-flame-500 hover:bg-flame-400 text-midnight-950 font-semibold px-6 py-3 transition-colors"
        >
          Leave a review
        </a>
      </PageHero>

      {/* Auto-wired 5-star reviews (consented public reviews, pulled from the CRM). */}
      <Testimonials fiveStarOnly limit={30} hideHeader />

      <section id="leave" className="max-w-2xl mx-auto px-6 pb-20 scroll-mt-24">
        <div className="text-center mb-7">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-2">Your turn</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Leave a review</h2>
          <p className="mt-3 text-silver-400">A few quick prompts. Two minutes, tops, and a real help to us.</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="space-y-5 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 md:p-8"
        >
          <input
            type="text"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />

          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className={labelCls}>
                Your name<span className="text-flame-500"> *</span>
              </span>
              <input className={fieldCls} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </label>
            <label className="block">
              <span className={labelCls}>Business (optional)</span>
              <input
                className={fieldCls}
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                autoComplete="organization"
              />
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <label className="block">
              <span className={labelCls}>Email (optional)</span>
              <input
                type="email"
                className={fieldCls}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className={labelCls}>What did we help with?</span>
              <select className={`${fieldCls} appearance-none`} value={serviceSel} onChange={(e) => setServiceSel(e.target.value)}>
                <option value="" className="bg-midnight-900">
                  Choose one
                </option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-midnight-900">
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {serviceSel === 'Other' && (
            <input
              className={fieldCls}
              placeholder="Tell us what we worked on"
              aria-label="What we worked on"
              value={serviceOther}
              onChange={(e) => setServiceOther(e.target.value)}
            />
          )}

          <div>
            <label className={labelCls}>
              How was it overall?<span className="text-flame-500"> *</span>
            </label>
            <div className="flex items-center gap-1.5 mt-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    className="p-1 -m-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-9 h-9 transition-colors ${active ? 'text-flame-500' : 'text-silver-700'}`}
                      fill={active ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={active ? 0 : 1.5}
                    >
                      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.11-6.46-4.7-4.58 6.49-.94L12 2.5z" />
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          <label className="block">
            <span className={labelCls}>Where were you before working with us?</span>
            <span className={`${helpCls} block`}>The challenge, or what wasn't working yet.</span>
            <textarea className={fieldCls} rows={2} value={before} onChange={(e) => setBefore(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelCls}>What did we do, and what changed?</span>
            <span className={`${helpCls} block`}>The work we delivered and the results you saw.</span>
            <textarea className={fieldCls} rows={3} value={outcome} onChange={(e) => setOutcome(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelCls}>What stood out about the experience?</span>
            <span className={`${helpCls} block`}>Communication, clarity, responsiveness, anything.</span>
            <textarea className={fieldCls} rows={2} value={highlight} onChange={(e) => setHighlight(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelCls}>Who would you recommend us to?</span>
            <span className={`${helpCls} block`}>The kind of business or person who would benefit.</span>
            <textarea className={fieldCls} rows={2} value={recommend} onChange={(e) => setRecommend(e.target.value)} />
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={allowPublic}
              onChange={(e) => setAllowPublic(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-flame-500"
            />
            <span className="text-sm text-silver-400">
              You may share my review publicly as a testimonial (first name and business only).
            </span>
          </label>

          {err && <p className="text-sm text-flame-400">{err}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-xl bg-flame-500 hover:bg-flame-400 disabled:opacity-60 text-midnight-950 font-semibold px-6 py-3 transition-colors"
          >
            {status === 'sending' ? 'Sending...' : 'Send review'}
          </button>
        </form>
      </section>
    </>
  )
}
