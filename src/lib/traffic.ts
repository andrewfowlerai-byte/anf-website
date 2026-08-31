import { supabase } from './supabase'

/**
 * Pageview beacon.
 *
 * There was no analytics of any kind on this site, which is why "the website
 * produced one real lead in its lifetime" could be true for months without
 * anyone knowing whether that was a conversion problem or simply nobody
 * visiting. Those want opposite responses.
 *
 * Deliberately tiny and deliberately private:
 *   - No IP and no raw user agent leave the browser. The database stores neither.
 *   - The visitor id is a random string in this browser's own storage. It says
 *     "same browser as last time" and nothing else. Not a cookie, so it needs no
 *     consent banner, and not linked to any contact, email or person.
 *   - It calls one SECURITY DEFINER function and has no rights on any table, so
 *     nobody can fill the traffic numbers with junk by reading this file.
 *
 * It must never be able to break the page. Every path is wrapped, storage
 * failures are swallowed, and a failed call is simply a pageview nobody counted.
 */

const KEY = 'anf.vid'

/** A stable-per-browser random id. Regenerates if storage is cleared, which is correct. */
function visitorId(): string | null {
  try {
    let id = window.localStorage.getItem(KEY)
    if (!id) {
      id = (crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
        .replace(/-/g, '')
        .slice(0, 32)
      window.localStorage.setItem(KEY, id)
    }
    return id.length >= 8 ? id : null
  } catch {
    // Private window, blocked storage, or a locked-down device. Do not count
    // rather than invent an id that changes on every page and inflates visitors.
    return null
  }
}

/** Coarse enough to be useful, coarse enough not to identify anybody. */
function device(): string {
  try {
    const w = window.innerWidth
    if (w < 768) return 'phone'
    if (w < 1180) return 'tablet'
    return 'desktop'
  } catch {
    return 'unknown'
  }
}

/** Only the origin of an external referrer. The full URL is somebody's browsing history. */
function referrer(): string | null {
  try {
    const r = document.referrer
    if (!r) return null
    const u = new URL(r)
    if (u.hostname === window.location.hostname) return null // internal navigation
    return u.hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

let lastPath: string | null = null

/**
 * Record one pageview. Safe to call on every route change.
 *
 * Repeated calls for the same path are ignored, because React Router fires on
 * search-param changes too and a filter click is not a new pageview.
 */
export function recordPageview(path: string): void {
  if (path === lastPath) return
  lastPath = path

  const id = visitorId()
  if (!id) return

  try {
    void supabase
      .rpc('record_visit', {
        p_visitor_id: id,
        p_path: path,
        p_referrer: referrer(),
        p_device: device(),
      })
      .then(
        () => {},
        () => {}, // a missed count is not worth a console error on a client's screen
      )
  } catch {
    /* never let analytics break a page */
  }
}
