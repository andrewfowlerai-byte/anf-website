/**
 * Per-page SEO. This is a client-rendered SPA, so index.html can only carry one
 * title and description for the whole site. Without this hook every route shows
 * Google (and every link preview) the same home page metadata, which reads as
 * duplicate content and wastes the ranking value of pages like /services.
 *
 * Each page calls useSeo() once with its own title and description. The hook
 * writes document.title, the meta description, the canonical link, and the
 * Open Graph / Twitter tags that drive link previews, then restores the site
 * defaults on unmount so a stale title never leaks into the next route.
 */

import { useEffect } from 'react'

const SITE = 'ANF Consulting'
const ORIGIN = 'https://anfconsult.com'

/** Falls back to these whenever a page unmounts, so no route inherits another route's title. */
const DEFAULTS = {
  title: 'ANF Consulting · Clarity · Integration · Automation',
  description:
    'ANF Consulting is a growth partner for professionals and small businesses ready to invest in smart marketing, modern infrastructure, and practical AI. One partner, one roadmap, one team.',
}

interface Seo {
  /** Page-specific part of the title. The site name is appended automatically. */
  title: string
  /** Aim for 150 to 160 characters. Google truncates past that. */
  description: string
  /** Path only, e.g. "/services". Used for the canonical URL and og:url. */
  path?: string
  /** Keep unlisted or code-gated pages (invest, start, class) out of search results. */
  noindex?: boolean
}

/** Sets (or creates) a <meta> tag, keyed by name or property. */
function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function useSeo({ title, description, path, noindex }: Seo) {
  useEffect(() => {
    const full = title === SITE ? DEFAULTS.title : `${title} · ${SITE}`
    const url = path ? `${ORIGIN}${path}` : ORIGIN

    document.title = full
    setMeta('name', 'description', description)
    setMeta('property', 'og:title', full)
    setMeta('property', 'og:description', description)
    setMeta('property', 'og:url', url)
    setMeta('name', 'twitter:title', full)
    setMeta('name', 'twitter:description', description)
    setLink('canonical', url)

    // Unlisted pages are shared by direct link only, so keep them out of the index.
    const robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (noindex) setMeta('name', 'robots', 'noindex, nofollow')
    else if (robots) robots.remove()

    return () => {
      document.title = DEFAULTS.title
      setMeta('name', 'description', DEFAULTS.description)
      setMeta('property', 'og:title', DEFAULTS.title)
      setMeta('property', 'og:description', DEFAULTS.description)
      setMeta('property', 'og:url', ORIGIN)
      setLink('canonical', ORIGIN)
      document.head.querySelector('meta[name="robots"]')?.remove()
    }
  }, [title, description, path, noindex])
}
