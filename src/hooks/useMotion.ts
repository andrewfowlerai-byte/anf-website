import { useEffect, useRef } from 'react'

/**
 * The motion layer for a page (2026-11-23, Andrew: "lets get some more animation on services, about, and book").
 * Attach the returned ref to the page's root and mark elements inside it:
 *
 *   data-reveal            one element rises into place the first time it comes on screen
 *   data-reveal="wipe"     a picture is uncovered from its top edge and settles from a slight zoom
 *   data-reveal="draw"     a filled bar draws from left to right
 *   data-stagger           the element's children arrive one after another ("wipe" uncovers each instead)
 *   data-progress          --p runs 0 to 1 as the element crosses the screen (a progress bar, a drifting picture)
 *
 * The styles live in chapters.css under [data-motion]. This only says when: it sets data-in once an element has
 * come on screen and keeps --p current while one is crossing it. With reduced motion everything is simply shown.
 * It watches for elements added later (a list that fills from the CRM), so they are never left hidden.
 */
export function useMotion<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || typeof IntersectionObserver === 'undefined'
    const ENTER = '[data-reveal], [data-stagger]'
    const show = (el: Element) => el.setAttribute('data-in', '')

    const io = still ? null : new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { show(e.target); io?.unobserve(e.target) }
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' })
    const watch = (el: Element) => { if (el.hasAttribute('data-in')) return; if (io) io.observe(el); else show(el) }
    root.querySelectorAll(ENTER).forEach(watch)

    // Elements that arrive after the first paint.
    const mo = new MutationObserver((changes) => {
      for (const c of changes) c.addedNodes.forEach((n) => {
        if (!(n instanceof Element)) return
        if (n.matches(ENTER)) watch(n)
        n.querySelectorAll(ENTER).forEach(watch)
      })
    })
    mo.observe(root, { childList: true, subtree: true })

    // Scroll-linked values, one measurement per frame.
    const tracked = Array.from(root.querySelectorAll<HTMLElement>('[data-progress]'))
    let frame = 0
    const measure = () => {
      frame = 0
      const vh = window.innerHeight
      for (const el of tracked) {
        const r = el.getBoundingClientRect()
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)))
        el.style.setProperty('--p', p.toFixed(3))
      }
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(measure) }
    if (tracked.length) {
      if (still) tracked.forEach((el) => el.style.setProperty('--p', '1'))
      else {
        measure()
        window.addEventListener('scroll', onScroll, { passive: true })
        window.addEventListener('resize', onScroll)
      }
    }

    return () => {
      io?.disconnect()
      mo.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return ref
}
