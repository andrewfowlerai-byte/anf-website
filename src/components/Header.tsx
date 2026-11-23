import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

// Kept short on purpose. Answers, Demos and Events are pages you hand someone
// a link to, not nav items, and a nav full of send-a-link pages is what made it
// hard to tell which page mattered. Everything still has its URL and the footer
// still links what needs crawling.
//
// Home and Book are here because the marketing videos send people to
// anfconsult.com/book by name, so both words need to be visible in the header
// on the page they land on. /book is the request-a-call form (no scheduler since
// 2026-10-14); Book jumps straight to the form, the orange button opens the page.
//
// Redesigned 2026-11-23 (DESIGN.md): a plain paper bar. The logo is a chrome mark on navy, so it sits in its own
// navy block at the left edge. Links are words; the one action is a flat flame rectangle. No blur, no hairline.
const NAV: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Home', end: true },
  { to: '/work', label: 'Work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/book#request', label: 'Book' },
]

const link = 'text-base font-semibold text-silver-100 underline-offset-[6px] decoration-2 decoration-flame-500 hover:underline'
const action = 'inline-flex items-center justify-center bg-flame-500 px-4 text-base font-semibold text-midnight-950 transition-colors hover:bg-flame-400 active:translate-y-px'

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    // The bar is the logo's own navy (#07102B), so the chrome mark sits in it with no box around it, and on a wide
    // screen it takes the centre of the bar (Andrew, 2026-11-23: pushed into the top left corner it "feels out of
    // place"). On a phone it leads from the left, where a thumb expects home.
    <header className="sticky top-0 z-40 bg-[#07102B] text-silver-100">
      <nav className="grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-4 px-[var(--edge)]" aria-label="Main">
        <div className="hidden lg:flex items-center gap-6">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `${link} ${isActive ? 'underline' : ''}`}>
              {n.label}
            </NavLink>
          ))}
          {/* Solden, ANF's own app (2026-11-16). */}
          <Link to="/#solden" className={link}>Solden</Link>
        </div>

        <Link to="/" aria-label="ANF Consulting home" className="col-start-1 justify-self-start lg:col-start-2 lg:justify-self-center">
          <img src="/anf-wordmark.webp" alt="ANF Consulting" width={210} height={140} className="h-[4.5rem] w-auto" />
        </Link>

        <div className="col-start-3 flex items-center justify-end gap-5">
          <a href="https://crm.anfconsult.com/portal" className={`hidden xl:inline ${link}`}>Client login</a>
          <Link to="/start" className={`hidden xl:inline ${link}`}>Start a project</Link>
          <Link to="/book" className={`${action} h-11`}>Send a request</Link>

          {/* Mobile menu toggle. */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="lg:hidden inline-flex h-11 w-11 items-center justify-center bg-silver-100 text-midnight-950"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile panel. The desktop nav is hidden below lg, so this is the only
          way to navigate on phones and tablets. */}
      {open && (
        <div className="lg:hidden bg-midnight-950 text-silver-100">
          <div className="flex flex-col px-[var(--edge)] py-4">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) => `py-2.5 text-2xl font-extrabold tracking-tight ${isActive ? 'text-flame-500' : 'text-silver-100'}`}
              >
                {n.label}
              </NavLink>
            ))}
            <Link to="/#solden" onClick={() => setOpen(false)} className="py-2.5 text-2xl font-extrabold tracking-tight text-silver-100">Solden, our app</Link>
            <Link to="/start" onClick={() => setOpen(false)} className="mt-4 py-2 text-base font-semibold text-silver-100">Start a project</Link>
            <a href="https://crm.anfconsult.com/portal" className="py-2 text-base font-semibold text-silver-100">Client login</a>
            <Link to="/book" onClick={() => setOpen(false)} className={`${action} mt-4 h-12`}>Send a request</Link>
          </div>
        </div>
      )}
    </header>
  )
}
