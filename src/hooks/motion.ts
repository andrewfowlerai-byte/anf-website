import { useEffect, useRef, useState } from 'react'

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** True once the element has scrolled into view (fires once). */
export function useInView<T extends HTMLElement = HTMLDivElement>(threshold = 0.25) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') { setInView(true); return }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setInView(true); obs.disconnect() }
      },
      { threshold },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

/** Counts up from 0 to target the first time it scrolls into view. */
export function useCountUp(target: number, opts?: { duration?: number; decimals?: number }) {
  const duration = opts?.duration ?? 1400
  const decimals = opts?.decimals ?? 0
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)
  const started = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion() || typeof IntersectionObserver === 'undefined') { setVal(target); return }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !started.current) {
          started.current = true
          const start = performance.now()
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            setVal(target * eased)
            if (t < 1) requestAnimationFrame(tick)
            else setVal(target)
          }
          requestAnimationFrame(tick)
          obs.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US')
  return { ref, display }
}
