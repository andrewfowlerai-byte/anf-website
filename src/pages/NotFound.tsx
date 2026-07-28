import { Link } from 'react-router-dom'

/**
 * Real 404 page. Rendered by the catch-all route inside the marketing Layout,
 * which also hands it noindex metadata (see Layout's SEO fallback) so junk URLs
 * are not treated as soft-404 duplicates of the home page.
 */
export function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 md:py-32 text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">404</p>
      <h1 className="text-3xl md:text-4xl font-display text-silver-100 mb-3">Page not found</h1>
      <p className="text-silver-400 mb-8">
        The page you are looking for moved or never existed. Let's get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-md bg-flame-500 hover:bg-flame-600 text-white font-medium px-6 py-3 transition-colors"
        >
          Back home
        </Link>
        <Link
          to="/services"
          className="inline-flex items-center justify-center rounded-md border border-white/10 text-silver-200 hover:border-flame-500/50 px-6 py-3 transition-colors"
        >
          See what we do
        </Link>
      </div>
    </div>
  )
}
