import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'
import { LeadChat } from './LeadChat'
import { useSeo } from '../lib/useSeo'
import { seoForPath, PAGE_SEO } from '../lib/pageSeo'

export function Layout() {
  // One place sets the title, description, canonical, and link-preview tags for
  // every route. Without this each page inherits the home page metadata from
  // index.html, which Google reads as duplicate content across the whole site.
  const { pathname } = useLocation()
  const seo = seoForPath(pathname) ?? PAGE_SEO['/']
  useSeo({ ...seo, path: pathname })

  // The six industry demo pages render their own in-demo assistant (DemoAssistant)
  // in the bottom-right corner. Hide the global LeadChat there so the two floating
  // buttons don't stack on top of each other.
  const isDemoDetail = /^\/demos\/.+/.test(pathname)

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        {/* Covers the lazily-loaded demo routes. The fallback is a plain spacer
            rather than a spinner: these chunks land in a few hundred ms and a
            flashing spinner reads worse than a brief hold on the current frame. */}
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      {!isDemoDetail && <LeadChat />}
    </div>
  )
}
