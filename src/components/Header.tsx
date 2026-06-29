import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BookCallButton } from './BookCallButton'

const NAV = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/work', label: 'Work' },
  { to: '/demos', label: 'Demos' },
  { to: '/realtors', label: 'For Realtors' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-midnight-950/75 backdrop-blur-xl border-b border-white/[0.06]">
      {/* Hairline flame accent across the very top. */}
      <div aria-hidden className="h-px w-full bg-gradient-to-r from-transparent via-flame-500/50 to-transparent" />

      <nav className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" aria-label="ANF Consulting home" className="flex items-center shrink-0">
          <img src="/anf-wordmark.png" alt="ANF Consulting" className="h-8 md:h-9 w-auto" />
        </Link>

        {/* Desktop nav with an animated underline. */}
        <div className="hidden lg:flex items-center gap-7">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `group relative text-sm font-medium tracking-wide transition-colors ${
                  isActive ? 'text-silver-100' : 'text-silver-400 hover:text-silver-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {n.label}
                  <span
                    className={`absolute -bottom-1.5 left-0 h-px bg-flame-500 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://crm.anfconsult.com/portal"
            className="hidden lg:inline-block text-sm text-silver-500 hover:text-silver-200 transition-colors"
          >
            Client Login
          </a>
          <Link
            to="/start"
            className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium rounded-full border border-white/10 text-silver-200 hover:border-flame-500/50 hover:text-white transition-colors"
          >
            Start a project
          </Link>
          <BookCallButton size="sm" label="Book a call" className="!rounded-full" />

          {/* Mobile menu toggle. */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-silver-200 hover:bg-white/5 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile panel. The desktop nav is hidden below lg, so this is the only
          way to navigate on phones and tablets. */}
      {open && (
        <div className="lg:hidden border-t border-white/[0.06] bg-midnight-950/95 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-base transition-colors ${
                    isActive ? 'text-flame-400 bg-white/[0.04]' : 'text-silver-200 hover:bg-white/5'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
            <div className="h-px bg-white/[0.06] my-2" />
            <Link to="/start" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-lg text-base text-silver-200 hover:bg-white/5 transition-colors">
              Start a project
            </Link>
            <a href="https://crm.anfconsult.com/portal" className="px-3 py-2.5 rounded-lg text-base text-silver-200 hover:bg-white/5 transition-colors">
              Client Login
            </a>
            <Link
              to="/book"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-flame-500 hover:bg-flame-600 text-white font-medium shadow-flame-glow transition-colors"
            >
              Book a call <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
