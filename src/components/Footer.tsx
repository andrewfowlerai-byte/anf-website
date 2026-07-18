import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchSiteContent } from '../lib/siteContent'

const FALLBACK_EMAIL = 'anfaiconsulting@gmail.com'
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
    <footer className="border-t border-midnight-700/40 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Link to="/" className="inline-flex items-center" aria-label="ANF Consulting home">
            <img src="/anf-wordmark.png" alt="ANF Consulting" className="h-10 w-auto" />
          </Link>
          <p className="mt-4 text-sm text-silver-500 leading-relaxed">
            Clarity <span className="text-flame-500">·</span> Integration <span className="text-flame-500">·</span> Automation.<br />
            One partner, one roadmap, one team.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-silver-100 mb-3 font-display tracking-wide">Get in touch</h3>
          <ul className="space-y-2 text-sm">
            <li><a href={`mailto:${email}`} className="text-silver-300 hover:text-flame-400">{email}</a></li>
            <li><a href={`tel:${phoneTel}`} className="text-silver-300 hover:text-flame-400">{phoneDisplay}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-silver-100 mb-3 font-display tracking-wide">Site</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/start" className="text-silver-300 hover:text-flame-400">Start a project</Link></li>
            <li><Link to="/services" className="text-silver-300 hover:text-flame-400">Services</Link></li>
            <li><Link to="/about" className="text-silver-300 hover:text-flame-400">About</Link></li>
            <li><Link to="/book" className="text-silver-300 hover:text-flame-400">Book a discovery call</Link></li>
            <li><Link to="/audit" className="text-silver-300 hover:text-flame-400">Free website audit</Link></li>
            <li><Link to="/refer" className="text-silver-300 hover:text-flame-400">Refer a business</Link></li>
            <li><a href="https://crm.anfconsult.com/portal" className="text-silver-300 hover:text-flame-400">Client login</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 pt-6 border-t border-midnight-700/30 flex flex-col md:flex-row justify-between gap-3 text-xs text-silver-500">
        <span>© {new Date().getFullYear()} ANF Consulting LLC. All rights reserved.</span>
        <span className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-flame-400">Privacy Policy</Link>
          <span>Invoicing via Stripe.</span>
        </span>
      </div>
    </footer>
  )
}
