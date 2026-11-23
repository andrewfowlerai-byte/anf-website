import { useState, type FormEvent } from 'react'
import { submitClassSignup } from '../lib/freeClass'
import { useLocalDraft, clearLocalDrafts } from '../hooks/useLocalDraft'
import { PageHero } from '../components/PageHero'

/**
 * Public landing page for the free "Getting Real With AI" class. Built to be the
 * front door for the one channel that actually converts, so it is also the right
 * place to send ad traffic. A sign-up posts to the CRM class-signup endpoint,
 * which drops the person straight into the Class Funnel.
 */

function Field({
  label, value, onChange, type = 'text', required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block mb-1.5">
        {label}
        {required && <span className="text-flame-700"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className='field'
      />
    </label>
  )
}

const DRAFT_KEYS = ['class.name', 'class.email', 'class.business', 'class.role', 'class.note'] as const

const WHAT_YOU_LEAVE_WITH = [
  'The handful of AI tools worth your time, and which to ignore',
  'How to write to AI so it gives you something useful, not generic',
  'Real tasks you do every week, done in minutes: emails, summaries, first drafts, listings',
  'A simple way to keep client data safe while you use these tools',
  'Quick-start sheets to take home, so you actually use it the next day',
]

const FORMATS = [
  { value: 'in_person', label: 'In person', hint: 'Northeast Ohio' },
  { value: 'virtual', label: 'Virtual', hint: 'Join from anywhere' },
  { value: 'either', label: 'Either works', hint: 'Whatever is next' },
]

export function FreeClass() {
  const [name, setName] = useLocalDraft('class.name', '')
  const [email, setEmail] = useLocalDraft('class.email', '')
  const [business, setBusiness] = useLocalDraft('class.business', '')
  const [role, setRole] = useLocalDraft('class.role', '')
  const [format, setFormat] = useState('either')
  const [note, setNote] = useLocalDraft('class.note', '')
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [err, setErr] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (hp) { setStatus('done'); return }
    if (name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setErr('Please add your name and a valid email.')
      return
    }
    setStatus('sending')
    setErr('')
    try {
      await submitClassSignup({
        name: name.trim(),
        email: email.trim(),
        business: business.trim() || undefined,
        role: role.trim() || undefined,
        format,
        note: note.trim() || undefined,
      })
      setStatus('done')
      clearLocalDrafts(...DRAFT_KEYS)
    } catch {
      setStatus('idle')
      setErr('Something went wrong. Please email admin@anfconsult.com and we will get you on the list.')
    }
  }

  if (status === 'done') {
    return (
      <PageHero
        title="See you in class"
        subtitle="Check your inbox for a confirmation. Andrew will email you the dates for the next session, in person in Northeast Ohio or virtual, so you can join from anywhere."
      />
    )
  }

  return (
    <>
      <PageHero
        title="Getting Real With AI"
        subtitle="A free, practical, plain-English class for business owners and professionals on actually using AI in your business. No hype, no jargon, no coding. Just the tools you can put to work the same week. Free to attend, in person in Northeast Ohio or virtual from anywhere."
      />

      <section className="px-6 pb-6 grid md:grid-cols-2 gap-8 md:gap-12">
        <div>
          <h2 className="t-lead font-extrabold tracking-[-0.03em] mb-4">What you leave with</h2>
          <ul className="space-y-3">
            {WHAT_YOU_LEAVE_WITH.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <svg aria-hidden="true" viewBox="0 0 16 16" className="mt-[0.35em] h-4 w-4 flex-shrink-0 text-flame-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square"><path d="M2.5 8.5l3.5 3.5 7.5-8" /></svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 slab">
            <p className="leading-relaxed">
              Built for people who run something: business owners, real estate agents, service pros, and the folks who
              keep an office running. If you have felt behind on AI, this is the session that gets you comfortable
              using it, not just hearing about it.
            </p>
          </div>
        </div>

        <div>
          <form onSubmit={onSubmit} className="space-y-5 slab">
            <p className="t-lead font-extrabold tracking-[-0.03em]">Save your spot</p>
            <input type="text" value={hp} onChange={(e) => setHp(e.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />

            <Field label="Your name" value={name} onChange={setName} required />
            <Field label="Your email" value={email} onChange={setEmail} type="email" required />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Business" value={business} onChange={setBusiness} placeholder="Optional" />
              <Field label="What you do" value={role} onChange={setRole} placeholder="Realtor, owner, office manager" />
            </div>

            <div>
              <label className="block mb-2">How would you like to attend?</label>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormat(f.value)}
                    aria-pressed={format === f.value}
                    className={`px-2 py-2.5  transition-colors ${
 format === f.value
 ? ' bg-midnight-100 '
 : ' bg-silver-200 '
 }`}
                  >
                    <span className="block font-medium">{f.label}</span>
                    <span className="block text-[13px] text-midnight-500 mt-0.5">{f.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="block mb-1.5">Anything you are hoping to get out of it?</span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Optional. Helps Andrew tailor the session."
                className='field'
              />
            </label>

            {err && <p role="alert" className="text-flame-700">{err}</p>}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-flame-500 hover:bg-flame-400 disabled:opacity-60 text-midnight-950 font-semibold px-6 py-3 transition-colors"
            >
              {status === 'sending' ? 'Saving your spot...' : 'Save my spot'}
            </button>
            <p className="text-[13px] text-midnight-500">
              Free, no pitch. You will get one email with the next session dates. That is it.
            </p>
          </form>
        </div>
      </section>
    </>
  )
}
