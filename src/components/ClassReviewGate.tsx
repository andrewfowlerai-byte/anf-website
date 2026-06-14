import { useState, type FormEvent } from 'react'
import { Loader2, Star, Gift } from 'lucide-react'
import { submitClassReview } from '../lib/reviews'

// Shown after a class attendee enters their class code. A short review unlocks
// the free workbook and flows to the CRM Reviews tab so Andrew can use it on
// socials. The workbook unlocks whether or not they consent to public sharing.
const CLASS_SERVICE_LABEL = 'Getting Real With AI class'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ClassReviewGate({
  slug,
  onDone,
}: {
  slug: string
  onDone: () => void
}) {
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [takeaway, setTakeaway] = useState('')
  const [thoughts, setThoughts] = useState('')
  const [recommend, setRecommend] = useState<'' | 'Yes' | 'No'>('')
  const [allowPublic, setAllowPublic] = useState(true)
  const [notify, setNotify] = useState(false)
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (name.trim().length < 2) {
      setError('Please add your name.')
      return
    }
    if (rating < 1) {
      setError('Please tap a star rating.')
      return
    }
    if (takeaway.trim().length < 2) {
      setError('Please share your biggest takeaway.')
      return
    }
    if (thoughts.trim().length < 2) {
      setError('Please tell us what you thought of the class.')
      return
    }
    if (!recommend) {
      setError('Please let us know if you would recommend the class.')
      return
    }
    if (notify && !EMAIL_RE.test(email.trim())) {
      setError('Please add a valid email so we can notify you about events.')
      return
    }
    setSubmitting(true)
    try {
      await submitClassReview({
        clientName: name.trim(),
        businessName: business.trim() || undefined,
        rating,
        outcome: takeaway.trim(),
        highlight: thoughts.trim(),
        recommend,
        email: email.trim() || undefined,
        notifyEvents: notify,
        allowPublic,
        service: CLASS_SERVICE_LABEL,
        website,
      })
      try {
        localStorage.setItem(`anf-class-reviewed-${slug}`, '1')
      } catch {
        /* private mode, ignore */
      }
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your review. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-1 flex items-center gap-2 text-flame-600">
          <Gift className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">One quick step</span>
        </div>
        <h1 className="text-2xl font-bold text-midnight-900">Leave a quick review to open your workbook</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          Your honest feedback unlocks the free workbook and helps other people decide to attend. Takes about thirty seconds.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Honeypot: hidden from people, tempting to bots. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="hidden"
            aria-hidden="true"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-midnight-900">How was the class?</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      (hover || rating) >= n ? 'fill-flame-500 text-flame-500' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <Field label="Your name" value={name} onChange={setName} placeholder="First and last" required />
          <Field
            label="Brokerage or company (optional)"
            value={business}
            onChange={setBusiness}
            placeholder="Where you work"
          />

          <TextArea
            label="Your biggest takeaway"
            value={takeaway}
            onChange={setTakeaway}
            placeholder="The one thing you'll use first..."
          />
          <TextArea
            label="What did you think of the class?"
            value={thoughts}
            onChange={setThoughts}
            placeholder="What stood out..."
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-midnight-900">
              Would you recommend this class to others?
            </label>
            <div className="flex gap-2">
              {(['Yes', 'No'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRecommend(opt)}
                  className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    recommend === opt
                      ? 'border-flame-500 bg-flame-500/10 text-flame-700'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={allowPublic}
              onChange={(e) => setAllowPublic(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-flame-500 focus:ring-flame-500/40"
            />
            <span>
              It's okay for ANF to share my review publicly (website and social media). You'll get the workbook either way.
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-flame-500 focus:ring-flame-500/40"
            />
            <span>Notify me when ANF Consulting hosts more events.</span>
          </label>

          {notify && (
            <Field
              label="Your email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@email.com"
              required
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-flame-500 px-5 py-3 font-medium text-white transition-colors hover:bg-flame-600 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit and open workbook
          </button>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">ANF Consulting · anfconsult.com</p>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-midnight-900">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-midnight-900 placeholder-slate-300 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40"
      />
    </div>
  )
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-midnight-900">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-midnight-900 placeholder-slate-300 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40"
      />
    </div>
  )
}
