import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowRight, Check, Download, Globe, Loader2, Mail, MessageSquare, Phone, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSeo } from '../lib/useSeo'
import { useLocalDraft } from '../hooks/useLocalDraft'
import { recordPageview } from '../lib/traffic'
import { submitCardSwap } from '../lib/card'

/**
 * Andrew's digital business card, at /andrew.
 *
 * This is what the QR on the printed card opens, so it is built for a phone
 * held at arm's length: one tap to call, text, email, or drop the contact into
 * the phone's address book. Standalone (outside the marketing Layout) so it
 * loads as a card, not as a website with a nav bar.
 *
 * The contact file lives at public/andrew-fowler.vcf. vercel.json serves it as
 * text/vcard, which is what makes iOS open it in Contacts instead of
 * downloading a file nobody can find again. Change the details in both places.
 */

const PHONE_DISPLAY = '(573) 276-9756'
const PHONE_HREF = '+15732769756'
const EMAIL = 'admin@anfconsult.com'

const navy = '#0B1A33'
const slate = '#24334D'
const rust = '#A6420C'

/** Remembered per browser so a return visit says "you're all set" instead of asking again. */
const SHARED_KEY = 'anf.card.shared'

function readShared(): string | null {
  try {
    return window.localStorage.getItem(SHARED_KEY)
  } catch {
    return null
  }
}

function Action({ href, download, icon, label, sub, primary, onClick }: {
  href: string
  download?: string
  icon: ReactNode
  label: string
  sub?: string
  primary?: boolean
  onClick?: () => void
}) {
  return (
    <a
      href={href}
      download={download}
      onClick={onClick}
      className="flex items-center gap-4 rounded-xl px-5 py-4 transition-transform active:scale-[0.99]"
      style={{
        backgroundColor: primary ? navy : '#FFFFFF',
        color: primary ? '#F5F7FA' : navy,
        border: primary ? '1px solid #0B1A33' : '1px solid #D9DFE9',
        boxShadow: primary ? '0 10px 24px rgba(11,26,51,0.22)' : '0 2px 10px rgba(11,26,51,0.06)',
        textDecoration: 'none',
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: primary ? 'rgba(255,255,255,0.12)' : '#F1F4F9', color: primary ? '#FBB088' : rust }}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-semibold leading-tight">{label}</span>
        {sub && (
          <span className="mt-0.5 block text-[14px] leading-tight" style={{ color: primary ? '#AEB6C4' : slate }}>
            {sub}
          </span>
        )}
      </span>
    </a>
  )
}

const inputStyle = {
  border: '1px solid #D9DFE9',
  color: navy,
  backgroundColor: '#FFFFFF',
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[14px] font-semibold" style={{ color: slate }}>
        {label}
        {optional && <span className="font-normal" style={{ color: '#7A8599' }}> (optional)</span>}
      </span>
      {children}
    </label>
  )
}

/**
 * The other half of the swap. Saving Andrew's contact only goes one way: the
 * visitor's phone learns about him and he learns nothing about them. So right
 * after the save (and any time from the button), the card asks for their name
 * and a number or email. It lands in Andrew's CRM with a follow-up drafted.
 * Never gates the save: the contact is theirs either way.
 */
function SwapBack({ justSaved }: { justSaved: boolean }) {
  const [openClicked, setOpenClicked] = useState(false)
  const [name, setName, clearName] = useLocalDraft('card.swap.name', '')
  const [phone, setPhone, clearPhone] = useLocalDraft('card.swap.phone', '')
  const [email, setEmail, clearEmail] = useLocalDraft('card.swap.email', '')
  const [company, setCompany, clearCompany] = useLocalDraft('card.swap.company', '')
  const [note, setNote, clearNote] = useLocalDraft('card.swap.note', '')
  const [hp, setHp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sharedAs, setSharedAs] = useState<string | null>(() => readShared())
  const ref = useRef<HTMLDivElement>(null)

  // Anything already typed (a draft from earlier in the visit) keeps the form open.
  const hasDraft = !!(name || phone || email || company || note)
  const open = !sharedAs && (openClicked || justSaved || hasDraft)
  const thanksRef = useRef<HTMLParagraphElement>(null)

  // Coming back from the phone's Contacts sheet, the form is the next thing
  // they should see.
  useEffect(() => {
    if (!justSaved || sharedAs) return
    const t = window.setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 350)
    return () => window.clearTimeout(t)
  }, [justSaved, sharedAs])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setError(null)
    if (!name.trim()) {
      setError('Add your name.')
      return
    }
    if (!phone.trim() && !email.trim()) {
      setError('Add a phone number or an email so I can reach you.')
      return
    }
    setBusy(true)
    try {
      await submitCardSwap({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        note: note.trim() || undefined,
        hp,
      })
      const first = name.trim().split(/\s+/)[0]
      try {
        window.localStorage.setItem(SHARED_KEY, first)
      } catch {
        /* a private window just asks again next time */
      }
      setSharedAs(first)
      recordPageview('/andrew/shared-back')
      // Move focus to the confirmation, so it is read out and keyboard users are not left on a removed button.
      window.setTimeout(() => thanksRef.current?.focus(), 50)
      clearName()
      clearPhone()
      clearEmail()
      clearCompany()
      clearNote()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That did not go through. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const shareAgain = () => {
    try {
      window.localStorage.removeItem(SHARED_KEY)
    } catch {
      /* ignore */
    }
    setSharedAs(null)
    setOpenClicked(true)
  }

  if (sharedAs) {
    return (
      <div ref={ref} role="status" aria-live="polite" className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9DFE9' }}>
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: '#E8F5EE', color: '#1E7A4C' }}>
            <Check className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p ref={thanksRef} tabIndex={-1} className="text-[17px] font-semibold leading-snug outline-none" style={{ color: navy }}>
              Thanks, {sharedAs}. I have your info.
            </p>
            <p className="mt-1 text-[15px] leading-relaxed" style={{ color: slate }}>
              I will follow up personally. No mailing list.
            </p>
            <button type="button" onClick={shareAgain} className="mt-2 text-[14px] font-medium underline" style={{ color: slate }}>
              Not you? Share different info
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className="rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: `1px solid ${justSaved ? rust : '#D9DFE9'}` }}>
      <p className="text-[17px] font-semibold leading-snug" style={{ color: navy }}>
        {justSaved ? 'Saved. Now swap back?' : 'Swap info with me'}
      </p>
      <p className="mt-1 text-[15px] leading-relaxed" style={{ color: slate }}>
        Leave your name and a number or email, and I will follow up once, personally. No mailing list.
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpenClicked(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-3 text-[15px] font-semibold"
          style={{ backgroundColor: rust, color: '#FFFFFF' }}
        >
          Share yours
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col gap-3" noValidate>
          <Field label="Your name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              maxLength={120}
              className="rounded-lg px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#A6420C]/30"
              style={inputStyle}
            />
          </Field>
          <Field label="Phone">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={40}
              className="rounded-lg px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#A6420C]/30"
              style={inputStyle}
            />
          </Field>
          <Field label="Email">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              className="rounded-lg px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#A6420C]/30"
              style={inputStyle}
            />
          </Field>
          <Field label="Business" optional>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              maxLength={160}
              className="rounded-lg px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#A6420C]/30"
              style={inputStyle}
            />
          </Field>
          <Field label="What should I follow up about?" optional>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              className="rounded-lg px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#A6420C]/30"
              style={inputStyle}
            />
          </Field>
          {/* Honeypot: hidden from people, filled by bots. */}
          <input
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 opacity-0"
            name="company_website"
          />
          {error && (
            <p role="alert" className="text-[14px] font-medium" style={{ color: '#B42318' }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3.5 text-[16px] font-semibold disabled:opacity-60"
            style={{ backgroundColor: rust, color: '#FFFFFF' }}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {busy ? 'Sending' : 'Send to Andrew'}
          </button>
          <p className="text-[13px]" style={{ color: '#7A8599' }}>
            Only Andrew sees this. Tell me to stop anytime and I will.
          </p>
        </form>
      )}
    </div>
  )
}

/** Remembered for the visit, so coming back from the Contacts sheet still shows the swap form. */
const SAVED_KEY = 'anf.card.saved'

function readSaved(): boolean {
  try {
    return window.sessionStorage.getItem(SAVED_KEY) === '1'
  } catch {
    return false
  }
}

export function CardAndrew() {
  const [saved, setSaved] = useState<boolean>(() => readSaved())
  const onSave = () => {
    setSaved(true)
    try {
      window.sessionStorage.setItem(SAVED_KEY, '1')
    } catch {
      /* ignore */
    }
    // Counted like a pageview, so saves show next to scans in Website Traffic.
    recordPageview('/andrew/saved-contact')
  }

  useSeo({
    title: 'Andrew Fowler',
    description:
      'Andrew Fowler, founder of ANF Consulting in Northeast Ohio. Custom websites, CRMs, and AI systems. Call, text, email, or save my contact card.',
    path: '/andrew',
  })

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{
        background:
          'radial-gradient(ellipse 420px 360px at 85% 12%, rgba(216,101,38,0.30), rgba(216,101,38,0) 70%),' +
          'linear-gradient(160deg, #F7F9FC 0%, #E7ECF4 55%, #D5D8E0 100%)',
      }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: '460px' }}>
        <div className="flex items-center gap-4">
          <img
            src="/anf-logo.png"
            alt="ANF Consulting"
            className="h-16 w-16 shrink-0 rounded-xl"
            style={{ boxShadow: '0 8px 20px rgba(11,26,51,0.25)' }}
          />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase" style={{ color: rust, letterSpacing: '0.18em' }}>
              ANF Consulting
            </p>
            <p className="mt-1 text-[14px]" style={{ color: slate }}>
              Northeast Ohio
            </p>
          </div>
        </div>

        <h1 className="mt-6 text-[40px] font-bold leading-none" style={{ color: navy, letterSpacing: '-0.02em' }}>
          Andrew Fowler
        </h1>
        <p className="mt-2 text-[18px] font-semibold" style={{ color: slate }}>
          Founder, ANF Consulting LLC
        </p>
        <p className="mt-3 text-[17px] leading-relaxed" style={{ color: slate }}>
          Custom websites, CRMs, and AI systems, built for how your business actually runs.
        </p>

        <div className="mt-7 flex flex-col gap-3">
          <Action
            href="/andrew-fowler.vcf"
            download="Andrew Fowler.vcf"
            primary
            icon={<Download className="h-5 w-5" />}
            label="Save my contact"
            sub="Adds me to your phone in one tap"
            onClick={onSave}
          />
          <SwapBack justSaved={saved} />
          <Action href={`tel:${PHONE_HREF}`} icon={<Phone className="h-5 w-5" />} label="Call" sub={PHONE_DISPLAY} />
          <Action href={`sms:${PHONE_HREF}`} icon={<MessageSquare className="h-5 w-5" />} label="Text" sub={PHONE_DISPLAY} />
          <Action href={`mailto:${EMAIL}`} icon={<Mail className="h-5 w-5" />} label="Email" sub={EMAIL} />
          <Action href="https://anfconsult.com" icon={<Globe className="h-5 w-5" />} label="anfconsult.com" sub="Services, pricing and the work" />
        </div>

        <div className="mt-6 rounded-xl p-5" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D9DFE9' }}>
          <p className="text-[16px] font-semibold" style={{ color: navy }}>
            Want to see what this looks like for your business?
          </p>
          <p className="mt-1 text-[15px] leading-relaxed" style={{ color: slate }}>
            Tell me what is slowing you down. You get a straight answer, not a pitch.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-[15px] font-semibold"
              style={{ backgroundColor: rust, color: '#FFFFFF', textDecoration: 'none' }}
            >
              Send a request
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/work"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-3 text-[15px] font-semibold"
              style={{ border: '1px solid #D9DFE9', color: navy, textDecoration: 'none' }}
            >
              See the work
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[15px] font-bold" style={{ color: navy }}>
          Clarity. <span style={{ color: rust }}>Integration.</span> Automation.
        </p>
      </div>
    </div>
  )
}
