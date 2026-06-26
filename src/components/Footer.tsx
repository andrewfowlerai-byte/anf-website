import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-midnight-700/40 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <Link to="/" className="inline-flex items-center" aria-label="ANF Consulting home">
            <img src="/anf-wordmark.png" alt="ANF Consulting" className="h-10 w-auto" />
          </Link>
          <p className="mt-4 text-sm text-silver-500 leading-relaxed">
            Clarity <span className="text-flame-500">·</span> Structure <span className="text-flame-500">·</span> Confidence.<br />
            One partner, one roadmap, one team.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-silver-100 mb-3 font-display tracking-wide">Get in touch</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="mailto:anfaiconsulting@gmail.com" className="text-silver-300 hover:text-flame-400">anfaiconsulting@gmail.com</a></li>
            <li><a href="tel:+15732769756" className="text-silver-300 hover:text-flame-400">(573) 276-9756</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-silver-100 mb-3 font-display tracking-wide">Site</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="text-silver-300 hover:text-flame-400">Services</Link></li>
            <li><Link to="/about" className="text-silver-300 hover:text-flame-400">About</Link></li>
            <li><Link to="/book" className="text-silver-300 hover:text-flame-400">Book a discovery call</Link></li>
            <li><a href="https://crm.anfconsult.com/portal" className="text-silver-300 hover:text-flame-400">Client login</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-8 pt-6 border-t border-midnight-700/30 flex flex-col md:flex-row justify-between gap-3 text-xs text-silver-500">
        <span>© {new Date().getFullYear()} ANF Consulting LLC. All rights reserved.</span>
        <span>Invoicing via Stripe.</span>
      </div>
    </footer>
  )
}
