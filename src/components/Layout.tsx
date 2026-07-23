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

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LeadChat />
    </div>
  )
}
