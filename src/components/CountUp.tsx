import { useEffect, useRef, useState } from 'react'

// Animates a number up to its target the first time it scrolls into view, then
// holds. Preserves any prefix ($), suffix (%, k, M, " min"), decimals, and
// thousands commas from the original string. Drop-in around any stat value.

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const doneRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const m = value.match(/^([^\d-]*)([\d,.]+)(.*)$/)
    if (!m) { setDisplay(value); return }
    const prefix = m[1]
    const raw = m[2]
    const suffix = m[3]
    const numStr = raw.replace(/,/g, '')
    const target = parseFloat(numStr)
    if (!Number.isFinite(target)) { setDisplay(value); return }
    const decimals = (numStr.split('.')[1] || '').length
    const hasComma = raw.includes(',')
    const fmt = (n: number) => {
      const fixed = decimals > 0 ? n.toFixed(decimals) : Math.round(n).toString()
      const out = hasComma ? Number(fixed).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : fixed
      return prefix + out + suffix
    }
    setDisplay(fmt(0))

    const io = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || doneRef.current) return
      doneRef.current = true
      const dur = 1100
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(fmt(target * eased))
        if (p < 1) rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => { io.disconnect(); if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value])

  return <span ref={ref} className={className}>{display}</span>
}
