import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { submitLead } from '../lib/leads'
import { PageHero } from '../components/PageHero'

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="block text-sm text-silver-300 mb-1.5">
        {label}
        {required && <span className="text-flame-500"> *</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-midnight-700/60 bg-midnight-900/60 px-4 py-2.5 text-silver-100 placeholder-silver-600 focus:border-flame-500 focus:outline-none"
      />
    </div>
  )
}

export function Audit() {
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [goal, setGoal] = useState('')
  const [hp, setHp] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (hp) {
      setStatus('done')
      return
    }
    if (name.trim().length < 2 || !email.trim()) {
      setErr('Please add your name and email.')
      return
    }
    setStatus('sending')
    setErr('')
    try {
      const notes =
        [website && `Website: ${website.trim()}`, goal && `Goal: ${goal.trim()}`].filter(Boolean).join('\n') ||
        undefined
      await submitLead({
        contact_name: name.trim(),
        business_name: business.trim() || undefined,
        email: email.trim(),
        notes,
        source: 'website-audit',
      })
      setStatus('done')
    } catch {
      setStatus('idle')
      setErr('Something went wrong. Please email andrew@anfconsult.com and we will sort it out.')
    }
  }

  if (status === 'done') {
    return (
      <PageHero
        eyebrow="Request received"
        title="Your audit is on the way"
        subtitle="We will review your website and lead flow and send a short, specific audit within two business days. Want to talk it through sooner? Grab a time below."
      >
        <Link
          to="/book"
          className="inline-flex items-center gap-2 rounded-full bg-flame-500 hover:bg-flame-600 text-white font-semibold px-7 py-3.5 transition-colors shadow-flame-glow"
        >
          Book a call
        </Link>
      </PageHero>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Free, no obligation"
        title={<>Free Website &amp; CRM Audit</>}
        subtitle="Tell us about your business and we will send back a short, specific audit: where your site and lead flow are costing you, and the highest-leverage fixes. No pitch attached."
      />
      <section className="max-w-2xl mx-auto px-6 pb-20">
      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 md:p-8">
        <input
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />
        <Field label="Your name" value={name} onChange={setName} required />
        <Field label="Business name" value={business} onChange={setBusiness} />
        <Field label="Email" value={email} onChange={setEmail} type="email" required />
        <Field label="Website (if you have one)" value={website} onChange={setWebsite} placeholder="yourbusiness.com" />
        <div>
          <label className="block text-sm text-silver-300 mb-1.5">What are you hoping to improve?</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            placeholder="More leads, a better site, a CRM to stay organized..."
            className="w-full rounded-xl border border-midnight-700/60 bg-midnight-900/60 px-4 py-2.5 text-silver-100 placeholder-silver-600 focus:border-flame-500 focus:outline-none"
          />
        </div>
        {err && <p className="text-sm text-flame-400">{err}</p>}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-xl bg-flame-500 hover:bg-flame-400 disabled:opacity-60 text-midnight-950 font-semibold px-6 py-3 transition-colors"
        >
          {status === 'sending' ? 'Sending...' : 'Send me my free audit'}
        </button>
        <p className="text-center text-xs text-silver-600">
          We will only use this to send your audit and follow up. No spam.
        </p>
      </form>
      </section>
    </>
  )
}
