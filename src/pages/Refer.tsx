import { useState, type FormEvent } from 'react'
import { submitReferral } from '../lib/refer'
import { useLocalDraft, clearLocalDrafts } from '../hooks/useLocalDraft'
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
    <label className="block">
      <span className="block text-sm text-silver-300 mb-1.5">
        {label}
        {required && <span className="text-flame-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-midnight-700/60 bg-midnight-900/60 px-4 py-2.5 text-silver-100 placeholder-silver-600 focus:border-flame-500 focus:outline-none"
      />
    </label>
  )
}

const DRAFT_KEYS = [
  'refer.yourName',
  'refer.yourEmail',
  'refer.business',
  'refer.contactName',
  'refer.contactInfo',
  'refer.note',
] as const

export function Refer() {
  const [yourName, setYourName] = useLocalDraft('refer.yourName', '')
  const [yourEmail, setYourEmail] = useLocalDraft('refer.yourEmail', '')
  const [business, setBusiness] = useLocalDraft('refer.business', '')
  const [contactName, setContactName] = useLocalDraft('refer.contactName', '')
  const [contactInfo, setContactInfo] = useLocalDraft('refer.contactInfo', '')
  const [note, setNote] = useLocalDraft('refer.note', '')
  const [hp, setHp] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (hp) {
      setStatus('done')
      return
    }
    if (yourName.trim().length < 2 || !yourEmail.trim() || business.trim().length < 2) {
      setErr('Please add your name, your email, and the business you are referring.')
      return
    }
    setStatus('sending')
    setErr('')
    try {
      // The contact field takes an email or a phone; sort it into the right slot.
      const info = contactInfo.trim()
      const isEmail = /@/.test(info)
      await submitReferral({
        referrerName: yourName.trim(),
        referrerEmail: yourEmail.trim(),
        business: business.trim(),
        contactName: contactName.trim() || undefined,
        contactEmail: isEmail ? info : undefined,
        contactPhone: !isEmail && info ? info : undefined,
        note: note.trim() || undefined,
      })
      setStatus('done')
      clearLocalDrafts(...DRAFT_KEYS)
    } catch {
      setStatus('idle')
      setErr('Something went wrong. Please email admin@anfconsult.com and we will sort it out.')
    }
  }

  if (status === 'done') {
    return (
      <PageHero
        eyebrow="Referral received"
        title="Thank you"
        subtitle="Andrew will reach out to them personally and treat them well. If it turns into a project, he will follow up with you about a referral credit as a thank you."
      />
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Know someone we can help?"
        title="Refer a business"
        subtitle="If you know a business drowning in manual work, a dated website, or leads slipping through the cracks, send them our way. If it turns into a project, you earn a referral credit. They get treated well either way."
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
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Your name" value={yourName} onChange={setYourName} required />
            <Field label="Your email" value={yourEmail} onChange={setYourEmail} type="email" required />
          </div>
          <Field label="Business you are referring" value={business} onChange={setBusiness} required />
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Their contact person" value={contactName} onChange={setContactName} placeholder="Owner or manager" />
            <Field label="Their email or phone" value={contactInfo} onChange={setContactInfo} placeholder="So Andrew can reach them" />
          </div>
          <label className="block">
            <span className="block text-sm text-silver-300 mb-1.5">Why did you think of them?</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Their website is ten years old, they track jobs on paper, they keep missing calls..."
              className="w-full rounded-xl border border-midnight-700/60 bg-midnight-900/60 px-4 py-2.5 text-silver-100 placeholder-silver-600 focus:border-flame-500 focus:outline-none"
            />
          </label>
          {err && <p className="text-sm text-flame-400">{err}</p>}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-xl bg-flame-500 hover:bg-flame-400 disabled:opacity-60 text-midnight-950 font-semibold px-6 py-3 transition-colors"
          >
            {status === 'sending' ? 'Sending...' : 'Send the referral'}
          </button>
          <p className="text-center text-xs text-silver-600">
            We never cold-blast referrals. Andrew reaches out personally, once, and takes no for an answer.
          </p>
        </form>
      </section>
    </>
  )
}
