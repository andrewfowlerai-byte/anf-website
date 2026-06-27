import { useEffect, useRef, useState } from 'react'

// A little "watch the automation run" player. Steps light up one at a time, the
// connector fills with the niche accent, and the last step lands a checkmark.
// Auto-plays once when it scrolls into view, replays on click. Pure animation,
// no backend. Dropped into each demo with its own accent and script.

export interface WiwStep {
  t: string
  s?: string
}

export function WatchItWork({ accent, label, steps }: { accent: string; label: string; steps: WiwStep[] }) {
  const [shown, setShown] = useState(0)
  const [playing, setPlaying] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const playedRef = useRef(false)
  const timers = useRef<number[]>([])

  const clear = () => { timers.current.forEach((t) => clearTimeout(t)); timers.current = [] }

  const play = () => {
    clear()
    setShown(0)
    setPlaying(true)
    playedRef.current = true
    steps.forEach((_, i) => {
      const id = window.setTimeout(() => {
        setShown(i + 1)
        if (i === steps.length - 1) setPlaying(false)
      }, 800 * (i + 1))
      timers.current.push(id)
    })
  }

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !playedRef.current) play()
    }, { threshold: 0.45 })
    io.observe(el)
    return () => { io.disconnect(); clear() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const done = !playing && shown >= steps.length

  return (
    <div ref={ref} className="mt-12 md:mt-16 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">See it run</p>
        <h2 className="text-2xl md:text-3xl font-display text-silver-100">{label}</h2>
      </div>
      <div className="rounded-2xl border border-midnight-700/40 bg-midnight-900/40 p-5 md:p-7">
        <div className="space-y-0">
          {steps.map((st, i) => {
            const on = i < shown
            const last = i === steps.length - 1
            return (
              <div key={i} className="flex gap-3.5 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-500"
                    style={{
                      background: on ? accent : 'rgba(255,255,255,0.06)',
                      color: on ? '#0b1220' : '#64748b',
                      boxShadow: on ? `0 0 0 4px ${accent}22` : 'none',
                      transform: on ? 'scale(1)' : 'scale(0.9)',
                    }}
                  >
                    {on && last ? '✓' : i + 1}
                  </span>
                  {!last && (
                    <span className="w-0.5 flex-1 mt-1 rounded-full transition-all duration-700" style={{ background: on ? accent : 'rgba(255,255,255,0.08)', minHeight: 22 }} />
                  )}
                </div>
                <div
                  className="min-w-0 flex-1 pt-1 transition-all duration-500"
                  style={{ opacity: on ? 1 : 0.3, transform: on ? 'translateY(0)' : 'translateY(6px)' }}
                >
                  <p className="text-sm md:text-base font-medium text-silver-100 leading-snug">{st.t}</p>
                  {st.s && <p className="text-xs md:text-sm text-silver-400 mt-0.5">{st.s}</p>}
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-2 flex items-center gap-3 flex-wrap">
          <button
            onClick={play}
            disabled={playing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
            style={{ background: accent }}
          >
            {playing ? (
              <>Running...</>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                {done ? 'Replay' : 'Watch it work'}
              </>
            )}
          </button>
          {done && <span className="text-xs text-silver-400">All of that, while you were doing something else.</span>}
        </div>
      </div>
    </div>
  )
}
