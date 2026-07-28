import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { LeadChat } from './LeadChat'
import { ErrorBoundary } from './ErrorBoundary'
import { useSeo } from '../lib/useSeo'
import { seoForPath } from '../lib/pageSeo'

export function Layout() {
  // One place sets the title, description, canonical, and link-preview tags for
  // every route. Without this each page inherits the home page metadata from
  // index.html, which Google reads as duplicate content across the whole site.
  const { pathname } = useLocation()
  // Unknown paths render the 404 page; give them noindex 404 metadata rather than
  // the home page's, so junk URLs are not soft-404 duplicates of home.
  const seo = seoForPath(pathname) ?? { title: 'Page Not Found', description: 'That page could not be found.', noindex: true }
  useSeo({ ...seo, path: pathname })

  // The six industry demo pages render their own in-demo assistant (DemoAssistant)
  // in the bottom-right corner. Hide the global LeadChat there so the two floating
  // buttons don't stack on top of each other.
  const isDemoDetail = /^\/demos\/.+/.test(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Let keyboard users jump past the nav straight to the page content. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-flame-500 focus:px-4 focus:py-2 focus:text-white focus:font-medium"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {/* A render error in one page shows a recover fallback instead of white-
            screening the SPA (keyed by path so navigating away clears it).
            Suspense covers the lazily-loaded page chunks. */}
        <ErrorBoundary key={pathname}>
          <Suspense fallback={<div className="min-h-[60vh]" />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      {!isDemoDetail && <LeadChat />}
    </div>
  )
}
