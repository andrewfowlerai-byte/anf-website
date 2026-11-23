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
  'field'
const labelCls = 'block   mb-1.5'
const helpCls = 'text-[13px] text-midnight-500 mb-2'

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
        title={`Thank you, ${name.split(' ')[0] || 'so much'}.`}
        subtitle="Your words mean a lot and genuinely help other business owners know what to expect. We appreciate you taking the time."
      >
        {googleUrl && (
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-flame-500 hover:bg-flame-400 text-midnight-950 font-semibold px-6 py-3 transition-colors"
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
        title="What our clients say"
        subtitle="Real words from people we've worked with. Read a few, or leave your own below."
      >
        <a
          href="#leave"
          className="inline-flex items-center justify-center gap-2 bg-flame-500 hover:bg-flame-400 text-midnight-950 font-semibold px-6 py-3 transition-colors"
        >
          Leave a review
        </a>
      </PageHero>

      {/* Auto-wired 5-star reviews (consented public reviews, pulled from the CRM). */}
      <Testimonials fiveStarOnly limit={30} hideHeader />

      <section id="leave" className="max-w-2xl px-[var(--edge)] pb-20 scroll-mt-24">
        <div className="mb-7">
          <h2 className="t-head font-extrabold tracking-[-0.03em]">Leave a review</h2>
          <p className="mt-3">A few quick prompts. Two minutes, tops, and a real help to us.</p>
        </div>
        <form
          onSubmit={onSubmit}
          className="space-y-5 slab"
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
                Your name<span className="text-flame-700"> *</span>
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
                <option value="" className="bg-silver-200">
                  Choose one
                </option>
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s} value={s} className="bg-silver-200">
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
            <span id="rating-label" className={labelCls}>
              How was it overall?<span className="text-flame-700"> *</span>
            </span>
            <div role="radiogroup" aria-labelledby="rating-label" className="flex items-center gap-1.5 mt-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    aria-label={`${n} star${n === 1 ? '' : 's'}`}
                    className="p-1 -m-0.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-9 h-9 transition-colors ${active ? 'text-flame-700' : 'text-midnight-500'}`}
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
            <span>
              You may share my review publicly as a testimonial (first name and business only).
            </span>
          </label>

          {err && <p role="alert" className="text-flame-700">{err}</p>}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-flame-500 hover:bg-flame-400 disabled:opacity-60 text-midnight-950 font-semibold px-6 py-3 transition-colors"
          >
            {status === 'sending' ? 'Sending...' : 'Send review'}
          </button>
        </form>
      </section>
    </>
  )
}
