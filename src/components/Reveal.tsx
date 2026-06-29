import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Scroll-reveal wrapper: starts hidden and slightly lowered, then eases into
 * place the first time it enters the viewport. Stagger siblings with `delay`.
 * Honors prefers-reduced-motion via the CSS in index.css.
 */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setShown(true); obs.disconnect() }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${shown ? 'is-in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}
