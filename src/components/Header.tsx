import { Link, NavLink } from 'react-router-dom'
import { BookCallButton } from './BookCallButton'

const navLink = ({ isActive }: { isActive: boolean }) =>
  `text-base font-medium tracking-wide transition-colors ${
    isActive ? 'text-flame-400' : 'text-silver-200 hover:text-silver-100'
  }`

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-midnight-700/40 bg-midnight-950/70 backdrop-blur supports-[backdrop-filter]:bg-midnight-950/55">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/" aria-label="ANF Consulting home" className="flex items-center shrink-0">
          <img src="/anf-logo.png" alt="ANF Consulting" className="h-11 md:h-12 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/services" className={navLink}>Services</NavLink>
          <NavLink to="/about" className={navLink}>About</NavLink>
        </div>

        <BookCallButton size="sm" />
      </nav>
    </header>
  )
}
