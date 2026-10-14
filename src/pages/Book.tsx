import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { submitRequest } from '../lib/leads'
import { PageHero } from '../components/PageHero'
import { useLocalDraft } from '../hooks/useLocalDraft'

// Request a call. There is no scheduler on this page (Cal.com came off the
// site on 2026-10-14): a visitor leaves their name, number and what they need,
// and Andrew calls them. The CRM's inbound-lead endpoint turns the request into
// a "Call ..." Inbox card and a push, and emails the visitor that he will call.

type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface RequestDraft {
  name: string
  business: string
  email: string
  phone: string
  bestTime: string
  message: string
}

const EMPTY_DRAFT: RequestDraft = { name: '', business: '', email: '', phone: '', bestTime: '', message: '' }

/** The best-time choices. "" is "Any time", which sends no preference. */
const BEST_TIMES = [
  { value: '', label: 'Any time' },
  { value: 'Mornings', label: 'Mornings' },
  { value: 'Afternoons', label: 'Afternoons' },
  { value: 'Evenings', label: 'Evenings' },
]

export function Book() {
  // Old links and the header point at /book#request (and older ones at
  // /book#schedule, where the scheduler used to be). React Router does not
  // scroll to a hash on its own, so bring the form into view, and the key
  // dependency makes a second click work when you are already on this page.
  const { hash, key } = useLocation()
  useEffect(() => {
    if (hash !== '#request' && hash !== '#schedule') return
    const frame = requestAnimationFrame(() => {
      document.getElementById('request')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [hash, key])

  return (
    <>
      <PageHero
        eyebrow="Start Here"
        title="Let's talk."
        subtitle="Leave your name, your number and a line about what you need. Andrew reads every request and calls you back within one business day. No pitch, no pressure."
      />

      <section className="max-w-3xl mx-auto px-6 pb-4">
        <p className="text-center text-xs tracking-[0.3em] uppercase text-flame-500 mb-6">What happens next</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: '1', t: 'Request a call', b: 'Your name, your number and a few lines about what you need. Two minutes, tops.' },
            { n: '2', t: 'Andrew calls you', b: 'Within one business day, at the time you pick. About 30 minutes: your goals, what you have now, and where you are stuck. A conversation, not a pitch.' },
            { n: '3', t: 'You get a plan', b: 'A clear proposal with scope and price within two business days. If it fits, we start. If not, the plan is yours to keep.' },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5">
              <div className="w-8 h-8 rounded-full bg-flame-500/15 border border-flame-400/40 text-flame-300 flex items-center justify-center font-semibold text-sm mb-3">{s.n}</div>
              <p className="text-silver-100 font-medium mb-1">{s.t}</p>
              <p className="text-silver-400 text-sm leading-relaxed">{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="request" className="max-w-2xl mx-auto px-6 pt-8 pb-24 scroll-mt-24">
        <RequestCallForm />
      </section>
    </>
  )
}

function RequestCallForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  // Typed input survives a tab switch or a reload (house rule: forms persist).
  const [draft, setDraft, clearDraft] = useLocalDraft<RequestDraft>('book.requestCall', EMPTY_DRAFT)
  // What the thank-you shows after the draft is cleared.
  const [sent, setSent] = useState<{ firstName: string; phone: string; bestTime: string } | null>(null)

  const set = (field: keyof RequestDraft) => (value: string) => setDraft((d) => ({ ...d, [field]: value }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const name = draft.name.trim()
    const phone = draft.phone.trim()
    setState('submitting')
    try {
      await submitRequest({
        contact_name: name,
        business_name: draft.business.trim() || undefined,
        email: draft.email.trim() || undefined,
        phone: phone || undefined,
        notes: draft.message.trim() || undefined,
        source: 'website-call-request',
        callRequested: true,
        bestTime: draft.bestTime || undefined,
      })
      setSent({ firstName: name.split(/\s+/)[0] || name, phone, bestTime: draft.bestTime })
      clearDraft()
      setState('success')
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (state === 'success' && sent) {
    return (
      <div role="status" className="rounded-2xl border border-flame-500/40 p-8 bg-midnight-900/60 text-center">
        <h2 className="text-2xl font-display text-silver-100 mb-2">Got it{sent.firstName ? `, ${sent.firstName}` : ''}.</h2>
        <p className="text-silver-300">
          Andrew will call you{sent.phone ? ` at ${sent.phone}` : ''} within one business day
          {sent.bestTime ? `, ${sent.bestTime.toLowerCase()} if he can` : ''}. A confirmation is on its way to your email.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-white/[0.07] p-6 md:p-8 bg-gradient-to-b from-white/[0.05] to-white/[0.01]"
    >
      <h2 className="text-xl font-display text-silver-100">Request a call</h2>
      <Field label="Your name" name="name" autoComplete="name" required value={draft.name} onChange={set('name')} />
      <Field label="Business name" name="business" autoComplete="organization" value={draft.business} onChange={set('business')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" required value={draft.phone} onChange={set('phone')} />
        <Field label="Email" name="email" type="email" autoComplete="email" required value={draft.email} onChange={set('email')} />
      </div>
      <label className="block">
        <span className="block text-sm text-silver-300 mb-2">Best time to call</span>
        <select
          name="bestTime"
          value={draft.bestTime}
          onChange={(e) => set('bestTime')(e.target.value)}
          className={FIELD_CLASS}
        >
          {BEST_TIMES.map((t) => (
            <option key={t.label} value={t.value}>{t.label}</option>
          ))}
        </select>
        <span className="block text-xs text-silver-500 mt-1.5">Eastern time. Andrew is in Northeast Ohio.</span>
      </label>
      <Field label="What would you like to talk about?" name="message" textarea value={draft.message} onChange={set('message')} />

      {state === 'error' && (
        <p role="alert" className="text-sm text-flame-400">
          Couldn&rsquo;t send your request: {errorMsg}. Try emailing{' '}
          <a href="mailto:admin@anfconsult.com" className="underline">admin@anfconsult.com</a> directly.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full bg-flame-500 hover:bg-flame-600 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-md shadow-flame-glow transition-all"
      >
        {state === 'submitting' ? 'Sending…' : 'Request a call'}
      </button>

      <p className="text-xs text-silver-500 text-center pt-2">
        Or reach out directly:{' '}
        <a href="mailto:admin@anfconsult.com" className="text-silver-300 hover:text-flame-400">admin@anfconsult.com</a>
        {' · '}
        <a href="tel:+15732769756" className="text-silver-300 hover:text-flame-400">(573) 276-9756</a>
      </p>
    </form>
  )
}

const FIELD_CLASS =
  'w-full bg-midnight-950/60 border border-midnight-700 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40 rounded-md px-4 py-3 text-silver-100 placeholder-silver-500 transition-colors'

interface FieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  textarea?: boolean
  autoComplete?: string
}

function Field({ label, name, value, onChange, type = 'text', required = false, textarea = false, autoComplete }: FieldProps) {
  return (
    <label className="block">
      <span className="block text-sm text-silver-300 mb-2">
        {label}
        {required && <span className="text-flame-500 ml-1">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} value={value} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} />
      ) : (
        <input name={name} type={type} required={required} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} />
      )}
    </label>
  )
}
