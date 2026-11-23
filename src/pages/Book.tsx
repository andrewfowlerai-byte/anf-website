import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { submitRequest } from '../lib/leads'
import { PageHero } from '../components/PageHero'
import { useLocalDraft } from '../hooks/useLocalDraft'
import { BEST_TIMES, EMPTY_DRAFT, REQUEST_DRAFT_KEY, type RequestDraft } from '../lib/requestDraft'

// Request a call. There is no scheduler on this page (Cal.com came off the
// site on 2026-10-14): a visitor leaves their name, number and what they need,
// and Andrew calls them. The CRM's inbound-lead endpoint turns the request into
// a "Call ..." Inbox card and a push, and emails the visitor that he will call.

type FormState = 'idle' | 'submitting' | 'success' | 'error'

// The draft's shape and key live in lib/requestDraft.ts: the home page's closing section starts the same draft, so
// what a visitor types there is waiting in this form.

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
        title="Let's talk."
        subtitle="Leave your name, your number and a line about what you need. Andrew reads every request and calls you back within one business day. No pitch, no pressure."
      />

      {/* The form leads on a phone; on a wide screen what happens next sits beside it. */}
      <section className="ch-grid px-[var(--edge)] py-[clamp(3.5rem,7vw,6rem)] gap-y-12">
        <div id="request" className="col-span-12 lg:col-span-6 lg:col-start-7 lg:row-start-1 scroll-mt-24 min-w-0">
          <RequestCallForm />
        </div>

        <div className="col-span-12 lg:col-span-5 lg:col-start-1 lg:row-start-1 min-w-0">
          <h2 className="t-head">What happens next</h2>
          {/* A real ordered list: the order is the information. */}
          <ol className="mt-8 grid gap-7 list-decimal pl-[1.4em] t-lead marker:font-extrabold">
            {[
              { t: 'Request a call', b: 'Your name, your number and a few lines about what you need. Two minutes, tops.' },
              { t: 'Andrew calls you', b: 'Within one business day, at the time you pick. About 30 minutes: your goals, what you have now, and where you are stuck. A conversation, not a pitch.' },
              { t: 'You get a plan', b: 'A clear proposal with scope and price within two business days. If it fits, we start. If not, the plan is yours to keep.' },
            ].map((s) => (
              <li key={s.t}>
                <strong className="font-extrabold">{s.t}.</strong>
                <span className="block mt-1 text-[length:var(--step-body)] leading-normal">{s.b}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}

function RequestCallForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  // Typed input survives a tab switch or a reload (house rule: forms persist).
  const [draft, setDraft, clearDraft] = useLocalDraft<RequestDraft>(REQUEST_DRAFT_KEY, EMPTY_DRAFT)
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
      <div role="status" className="panel">
        <h2 className="t-head mb-4">Got it{sent.firstName ? `, ${sent.firstName}` : ''}.</h2>
        <p>
          Andrew will call you{sent.phone ? ` at ${sent.phone}` : ''} within one business day
          {sent.bestTime ? `, ${sent.bestTime.toLowerCase()} if he can` : ''}. A confirmation is on its way to your email.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="panel grid gap-5"
    >
      <h2 className="t-head">Request a call</h2>
      <Field label="Your name" name="name" autoComplete="name" required value={draft.name} onChange={set('name')} />
      <Field label="Business name" name="business" autoComplete="organization" value={draft.business} onChange={set('business')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" required value={draft.phone} onChange={set('phone')} />
        <Field label="Email" name="email" type="email" autoComplete="email" required value={draft.email} onChange={set('email')} />
      </div>
      <label className="block">
        <span className="block mb-2 font-semibold">Best time to call</span>
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
        <span className="block text-[13px] text-midnight-500 mt-1.5">Eastern time. Andrew is in Northeast Ohio.</span>
      </label>
      <Field label="What would you like to talk about?" name="message" textarea value={draft.message} onChange={set('message')} />

      {state === 'error' && (
        <p role="alert" className="text-flame-700">
          Couldn&rsquo;t send your request: {errorMsg}. Try emailing{' '}
          <a href="mailto:admin@anfconsult.com" className="underline">admin@anfconsult.com</a> directly.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="btn w-full disabled:opacity-60"
      >
        {state === 'submitting' ? 'Sending…' : 'Request a call'}
      </button>

      <p className="pt-2">
        Or reach out directly:{' '}
        <a href="mailto:admin@anfconsult.com" className="hover:underline">admin@anfconsult.com</a>
        {' or '}
        <a href="tel:+15732769756" className="hover:underline">(573) 276-9756</a>
      </p>
    </form>
  )
}

const FIELD_CLASS =
  'field'

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
      <span className="block mb-2 font-semibold">
        {label}
        {required && <span className="text-flame-700 ml-1">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} value={value} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} />
      ) : (
        <input name={name} type={type} required={required} autoComplete={autoComplete} value={value} onChange={(e) => onChange(e.target.value)} className={FIELD_CLASS} />
      )}
    </label>
  )
}
