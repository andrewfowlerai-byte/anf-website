import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchSiteContent } from '../lib/siteContent'

/** A footer link: a word in the footer's ink that underlines on hover. */
const foot = 'text-silver-100 underline-offset-4 decoration-2 hover:underline hover:text-flame-400'

const FALLBACK_EMAIL = 'admin@anfconsult.com'
const FALLBACK_PHONE_DISPLAY = '(573) 276-9756'
const FALLBACK_PHONE_TEL = '+15732769756'

export function Footer() {
  const [email, setEmail] = useState(FALLBACK_EMAIL)
  const [phoneDisplay, setPhoneDisplay] = useState(FALLBACK_PHONE_DISPLAY)
  const [phoneTel, setPhoneTel] = useState(FALLBACK_PHONE_TEL)

  useEffect(() => {
    let cancelled = false
    fetchSiteContent().then(({ contact }) => {
      if (cancelled) return
      if (contact.contact_email) setEmail(contact.contact_email)
      if (contact.contact_phone_display) setPhoneDisplay(contact.contact_phone_display)
      if (contact.contact_phone_tel) setPhoneTel(contact.contact_phone_tel)
    })
    return () => { cancelled = true }
  }, [])

  return (
    // Redesigned 2026-11-23 (DESIGN.md): the page closes on the name, built from blocks in the brand's colours.
    // Every link the old footer carried is still here (class attendees are told to find theirs on the site).
    <footer className="bg-midnight-950 text-silver-100 px-[var(--edge)] pt-[clamp(3.5rem,7vw,6rem)] pb-8">
      <Link to="/" aria-label="ANF Consulting home" className="block">
        <p className="mark" aria-hidden="true"><span>A</span><span>N</span><span>F</span></p>
      </Link>
      <p className="mt-5 text-[length:var(--step-lead)] font-extrabold tracking-tight text-silver-100">Clarity. Integration. Automation.</p>

      <nav aria-label="Footer" className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12 text-base leading-relaxed">
        <ul className="col-span-2 md:col-span-12 lg:col-span-4 min-w-0 space-y-2 break-words">
          <li><a href={`mailto:${email}`} className={`${foot} text-[length:var(--step-lead)] font-extrabold tracking-tight`}>{email}</a></li>
          <li><a href={`tel:${phoneTel}`} className={`${foot} text-[length:var(--step-lead)] font-extrabold tracking-tight`}>{phoneDisplay}</a></li>
        </ul>
        <ul className="md:col-span-3 lg:col-span-2 space-y-2">
          <li><Link to="/work" className={foot}>Our work</Link></li>
          <li><Link to="/work?show=demo" className={foot}>Live demos</Link></li>
          <li><Link to="/reviews" className={foot}>Reviews</Link></li>
          <li><Link to="/answers" className={foot}>Answers</Link></li>
        </ul>
        <ul className="md:col-span-3 lg:col-span-2 space-y-2">
          <li><Link to="/services" className={foot}>Services</Link></li>
          <li><Link to="/audit" className={foot}>Free website audit</Link></li>
          <li><Link to="/start" className={foot}>Start a project</Link></li>
          <li><Link to="/book" className={foot}>Send a request</Link></li>
        </ul>
        <ul className="md:col-span-3 lg:col-span-2 space-y-2">
          <li><Link to="/free-class" className={foot}>Free AI class</Link></li>
          <li><Link to="/events" className={foot}>Events and classes</Link></li>
          <li><Link to="/handouts" className={foot}>Class handouts</Link></li>
        </ul>
        <ul className="md:col-span-3 lg:col-span-2 space-y-2">
          <li><Link to="/about" className={foot}>About</Link></li>
          <li><Link to="/refer" className={foot}>Refer a business</Link></li>
          <li><a href="https://crm.anfconsult.com/portal" className={foot}>Client login</a></li>
        </ul>
      </nav>

      <div className="mt-14 flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-base text-silver-100">
        <span>© {new Date().getFullYear()} ANF Consulting LLC. All rights reserved. Invoicing via Stripe.</span>
        <span className="flex items-center gap-5">
          <Link to="/privacy" className={foot}>Privacy Policy</Link>
          <Link to="/terms" className={foot}>Terms</Link>
        </span>
      </div>
    </footer>
  )
}
