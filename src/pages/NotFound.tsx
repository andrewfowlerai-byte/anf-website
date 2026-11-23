import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'

/**
 * Real 404 page. Rendered by the catch-all route inside the marketing Layout,
 * which also hands it noindex metadata (see Layout's SEO fallback) so junk URLs
 * are not treated as soft-404 duplicates of the home page.
 */
const PLACES = [
  { to: '/work', label: 'The builds', line: 'Every system ANF has made, open to click through.' },
  { to: '/services', label: 'The service menu', line: 'What ANF does, priced in the open.' },
  { to: '/about', label: 'About Andrew', line: 'Who is behind it.' },
  { to: '/reviews', label: 'Reviews', line: 'What clients and class attendees said.' },
  { to: '/book', label: 'Send a request', line: 'Tell Andrew what you are trying to build.' },
]

export function NotFound() {
  return (
    <>
      <PageHero
        title="Page not found"
        subtitle="The page you are looking for moved or never existed. Let's get you back on track."
      >
        <Link to="/" className="btn btn-ink">Back home</Link>
      </PageHero>
      <section className="px-[var(--edge)] pt-[clamp(3rem,6vw,5rem)] pb-[clamp(7rem,14vw,11rem)]">
        <h2 className="t-head">Or start here</h2>
        <ul className="mt-8 grid gap-5">
          {PLACES.map((p) => (
            <li key={p.to}>
              <Link to={p.to} className="link t-lead">{p.label}</Link>
              <span className="block mt-1">{p.line}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
