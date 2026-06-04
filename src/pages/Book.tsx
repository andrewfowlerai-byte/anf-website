import { useState, useEffect } from 'react'
import Cal, { getCalApi } from '@calcom/embed-react'
import { submitLead } from '../lib/leads'

// ─── Cal.com setup ────────────────────────────────────────────────────────────
// To enable inline booking, set CAL_USERNAME to your Cal.com username.
// (Sign up free at https://cal.com, your booking URL will be cal.com/<username>.)
// CAL_EVENT_SLUG is the event-type URL slug for the discovery call.
const CAL_USERNAME: string = 'andrew-fowler'
const CAL_EVENT_SLUG = 'discovery-call'
// ─────────────────────────────────────────────────────────────────────────────

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function Book() {
  return (
    <>
      <section className="max-w-2xl mx-auto px-6 pt-16 md:pt-24 pb-8">
        <div className="text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Discovery Call</p>
          <h1 className="text-4xl md:text-5xl font-display text-silver-100 mb-4 leading-tight">
            Let&rsquo;s talk.
          </h1>
          <p className="text-silver-400 text-lg">
            A 30-minute call to understand your business, your goals, and how ANF can help. No pitch, no pressure.
          </p>
        </div>
      </section>

      {CAL_USERNAME && (
        <section className="max-w-4xl mx-auto px-6 py-8">
          <CalBooking />
        </section>
      )}

      <section className="max-w-2xl mx-auto px-6 pb-24">
        {CAL_USERNAME && (
          <p className="text-center text-sm text-silver-500 mb-6">or send a note instead</p>
        )}
        <ContactForm />
      </section>
    </>
  )
}

function CalBooking() {
  useEffect(() => {
    ;(async () => {
      const cal = await getCalApi()
      cal('ui', {
        theme: 'dark',
        styles: { branding: { brandColor: '#F26B1D' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    })()
  }, [])

  return (
    <div className="rounded-2xl border border-midnight-700/30 bg-midnight-900/60 overflow-hidden">
      <Cal
        calLink={`${CAL_USERNAME}/${CAL_EVENT_SLUG}`}
        style={{ width: '100%', height: '640px', overflow: 'auto' }}
        config={{ layout: 'month_view' }}
      />
    </div>
  )
}

function ContactForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    setState('submitting')
    try {
      await submitLead({
        contact_name: String(data.get('name') ?? '').trim(),
        business_name: String(data.get('business') ?? '').trim() || undefined,
        email: String(data.get('email') ?? '').trim() || undefined,
        phone: String(data.get('phone') ?? '').trim() || undefined,
        notes: String(data.get('message') ?? '').trim() || undefined,
      })
      setState('success')
      form.reset()
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (state === 'success') {
    return (
      <div className="rounded-2xl border border-flame-500/40 p-8 bg-midnight-900/60 text-center">
        <h2 className="text-2xl font-display text-silver-100 mb-2">Got it.</h2>
        <p className="text-silver-300">Andrew will reach out within 24 hours to schedule a time.</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-midnight-700/30 p-6 md:p-8 bg-midnight-900/40"
    >
      <Field label="Your name" name="name" required />
      <Field label="Business name" name="business" />
      <Field label="Email" name="email" type="email" required />
      <Field label="Phone" name="phone" type="tel" />
      <Field label="What are you looking for?" name="message" textarea />

      {state === 'error' && (
        <p className="text-sm text-flame-400">
          Couldn&rsquo;t send your message: {errorMsg}. Try emailing{' '}
          <a href="mailto:anfaiconsulting@gmail.com" className="underline">anfaiconsulting@gmail.com</a> directly.
        </p>
      )}

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full bg-flame-500 hover:bg-flame-600 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-md shadow-flame-glow transition-all"
      >
        {state === 'submitting' ? 'Sending…' : 'Request a discovery call'}
      </button>

      <p className="text-xs text-silver-500 text-center pt-2">
        Or reach out directly:{' '}
        <a href="mailto:anfaiconsulting@gmail.com" className="text-silver-300 hover:text-flame-400">anfaiconsulting@gmail.com</a>
        {' · '}
        <a href="tel:+15732769756" className="text-silver-300 hover:text-flame-400">(573) 276-9756</a>
      </p>
    </form>
  )
}

interface FieldProps {
  label: string
  name: string
  type?: string
  required?: boolean
  textarea?: boolean
}

function Field({ label, name, type = 'text', required = false, textarea = false }: FieldProps) {
  const className =
    'w-full bg-midnight-950/60 border border-midnight-700 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40 rounded-md px-4 py-3 text-silver-100 placeholder-silver-500 transition-colors'
  return (
    <label className="block">
      <span className="block text-sm text-silver-300 mb-2">
        {label}
        {required && <span className="text-flame-500 ml-1">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} className={className} />
      ) : (
        <input name={name} type={type} required={required} className={className} />
      )}
    </label>
  )
}
