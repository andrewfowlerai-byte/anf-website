import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type FormEvent } from 'react'
import { Canvas } from '@react-three/fiber'
import { ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { submitRequest } from '../lib/leads'
import { FlightRig, Planets, StarTunnel, Constellations, Nebulae, PLANETS, PAGES, STATIONS } from './scene'

/**
 * ANF 3D experience: a flight.
 *
 * The previous version was a particle swarm that morphed between abstract forms.
 * It looked good and said very little, which was the honest complaint about it:
 * four trademarked names floating over shapes that could have belonged to any
 * company. Cool, and vague.
 *
 * Now the camera flies a fixed course past five worlds, and each one is a real
 * part of the work with room beside it to say so properly: what it is, and the
 * four concrete things you actually get. The journey is doing the job the
 * morphing was only gesturing at.
 *
 * Scene geometry lives in ./scene. This file is the shell, the copy, and the
 * request form.
 */

/** Only phones and low-end machines take the cheap path. */
const IS_LOW_END =
  typeof navigator !== 'undefined' &&
  ((navigator as Navigator & { deviceMemory?: number }).deviceMemory !== undefined
    ? ((navigator as Navigator & { deviceMemory?: number }).deviceMemory as number) <= 4
    : (navigator.hardwareConcurrency ?? 8) <= 4)

const HUD_LABELS = [
  'ANF // DEPARTURE',
  '01 / THE FRONT DOOR',
  '02 / THE NERVE CENTER',
  '03 / THE MACHINE ROOM',
  '04 / THE INTELLIGENCE',
  '05 / THE HANDOVER',
  'ANF // ARRIVAL',
]

/**
 * The five worlds.
 *
 * `body` says what the problem actually is, in the language someone would use
 * about their own week. `specifics` is the part that fixes the vagueness: four
 * concrete deliverables, no adjectives. Marketing, infrastructure, automation,
 * AI and education carry equal weight here on purpose, because ANF is not an AI
 * company that also builds websites.
 */
interface Station {
  num: string
  title: string
  /** One line that could stand alone. The headline under the headline. */
  kicker: string
  body: string
  specifics: string[]
}

const STATIONS_COPY: Station[] = [
  {
    num: '01',
    title: 'The Front Door',
    kicker: 'Be worth finding.',
    body:
      'People look you up long before they call you. If what they find is slow, stale, or missing, they dial the next name on the list.',
    specifics: [
      'A fast site that says what you do in one line',
      'Proof a stranger can check: work, reviews, results',
      'A request form wired straight into your system',
    ],
  },
  {
    num: '02',
    title: 'The Nerve Center',
    kicker: 'One place for everything.',
    body:
      'Four apps that do not talk, one guarded spreadsheet, and a memory doing too much. Nothing is lost, exactly. It is scattered, and scattered costs you every single day.',
    specifics: [
      'A CRM shaped to how you already work',
      'Contracts drafted, signed, and countersigned in one chain',
      'Invoices that reconcile themselves when the money lands',
      'A portal your clients check instead of emailing you',
    ],
  },
  {
    num: '03',
    title: 'The Machine Room',
    kicker: 'The busywork, handled.',
    body:
      'The Tuesday follow-up. The invoice nobody chased. The lead that came in at nine and sat until morning. None of that needs you. It needs a loop that never forgets.',
    specifics: [
      'Follow-up that sends itself on time',
      'Overdue invoices chased politely, on a schedule',
      'Every new lead answered within minutes, any hour',
      'Nothing reaches a client without your say-so',
    ],
  },
  {
    num: '04',
    title: 'The Intelligence',
    kicker: 'AI with a job, not a gimmick.',
    body:
      'Drafts in your voice. Research that used to eat an afternoon. Work that arrives already started instead of blank. And clear limits: pricing, judgment, and your relationships stay yours.',
    specifics: [
      'Drafts you approve before anything goes out',
      'An assistant wired into the whole system, not a chat box',
      'Straight answers about what AI cannot do',
    ],
  },
  {
    num: '05',
    title: 'The Handover',
    kicker: 'Yours to run. Never yours alone.',
    body:
      'Your team gets trained on it, it is written down, and the data is yours. And when something breaks or a new problem shows up, that lands on my desk, not yours. Support is part of what you pay for, not an upsell.',
    specifics: [
      'Training for the people who use it every day',
      'Documentation written for humans',
      'Troubleshooting and problem solving stay on me',
      'Your data, exportable, always',
    ],
  },
]

export default function Experience() {
  return (
    <ExperienceBoundary>
      <ExperienceInner />
    </ExperienceBoundary>
  )
}

function ExperienceInner() {
  // Phones get fewer stars, no bloom and dpr 1: additive points plus multi-pass
  // mipmap bloom is the main GPU cost, and the frame drops it caused used to
  // make the scroll pause and jump.
  const coarse = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches, [])
  const [section, setSection] = useState(0)

  const starCount = coarse ? (IS_LOW_END ? 900 : 1800) : 5000
  const constellationGroups = coarse ? (IS_LOW_END ? 5 : 9) : 16

  return (
    <div className="fixed inset-0 bg-[#040912] text-white overflow-hidden">
      <div className="fixed top-0 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-10 py-5">
        <a href="/" className="font-display text-sm font-medium tracking-[0.05em] text-silver-200/90 hover:text-white transition-colors">
          ANF Consulting
        </a>
        <span className="hidden sm:block text-[10px] uppercase tracking-[0.28em] text-flame-300/90">
          Clarity. Integration. Automation.
        </span>
      </div>

      <Canvas
        // fov is vertical: portrait phones need a wider one or the planets,
        // which sit off to the side, fall outside the narrow horizontal slice.
        camera={{ position: [0, 0, 0], fov: coarse ? 70 : 62, near: 0.1, far: 400 }}
        dpr={coarse ? 1 : [1, 1.8]}
        gl={{ antialias: !coarse, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#040912']} />
        <ScrollControls
          // A little extra length on phones so the tall final section can clear
          // the mobile address bar. The flight clamps at the last station, so the
          // trailing stretch just holds the arrival.
          pages={coarse ? PAGES + 0.6 : PAGES}
          damping={coarse ? 0.08 : 0.12}
          style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
        >
          {!coarse && <SmoothWheel />}
          <FlightRig />
          <Nebulae />
          <StarTunnel count={starCount} />
          <Constellations groups={constellationGroups} />
          <Planets />
          <ScrollReporter onSection={setSection} />
          <Scroll html style={{ width: '100%' }}>
            <Overlay />
          </Scroll>
        </ScrollControls>
        {!coarse && (
          <Suspense fallback={null}>
            <EffectComposer>
              <Bloom mipmapBlur intensity={0.7} luminanceThreshold={0.2} luminanceSmoothing={0.4} radius={0.65} />
            </EffectComposer>
          </Suspense>
        )}
      </Canvas>

      {/* Filmic edge darkening. Kept as a plain gradient with no CSS filter: a
          blurred layer over a canvas that repaints every frame is one of the most
          expensive things you can ask mobile Safari to do, and it used to make
          this page stutter. */}
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{ background: 'radial-gradient(ellipse 80% 80% at 50% 45%, transparent 48%, rgba(2,5,12,0.85) 100%)' }}
      />

      <Hud section={section} />
    </div>
  )
}

/* ------------------------------------------------------------------- chrome */

function Hud({ section }: { section: number }) {
  const label = HUD_LABELS[Math.min(section, HUD_LABELS.length - 1)]
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.7) 0px, rgba(255,255,255,0.7) 1px, transparent 1px, transparent 3px)' }}
      />
      <span className="absolute left-3 top-3 h-5 w-5 border-l border-t border-flame-500/30" />
      <span className="absolute right-3 top-3 h-5 w-5 border-r border-t border-flame-500/30" />
      <span className="absolute left-3 bottom-3 h-5 w-5 border-l border-b border-flame-500/30" />
      <span className="absolute right-3 bottom-3 h-5 w-5 border-r border-b border-flame-500/30" />

      <div className="absolute left-6 bottom-6 font-mono text-[10px] uppercase tracking-[0.2em] text-silver-400/80">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> ANF systems online
        </span>
        <span className="mt-1.5 block text-flame-300/90">{label}</span>
      </div>

      {/* Route marker: which world you are passing. */}
      <div className="absolute right-6 bottom-6 hidden sm:flex flex-col items-end gap-1.5">
        {Array.from({ length: STATIONS }, (_, i) => (
          <span
            key={i}
            className={`h-px transition-all duration-500 ${
              section === i + 1 ? 'w-8 bg-flame-400' : 'w-3 bg-silver-400/30'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

/** Desktop wheel momentum. On touch it fights native scrolling, so it is off. */
function SmoothWheel() {
  const scroll = useScroll()
  useEffect(() => {
    const el = scroll.el
    if (!el) return
    let target = el.scrollTop
    let raf = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      target = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, target + e.deltaY))
      if (!raf) raf = requestAnimationFrame(step)
    }
    const step = () => {
      const next = el.scrollTop + (target - el.scrollTop) * 0.12
      el.scrollTop = next
      raf = Math.abs(target - next) > 0.5 ? requestAnimationFrame(step) : 0
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [scroll])
  return null
}

function ScrollReporter({ onSection }: { onSection: (i: number) => void }) {
  const scroll = useScroll()
  const last = useRef(-1)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const i = Math.round(scroll.offset * (PAGES - 1))
      if (i !== last.current) {
        last.current = i
        onSection(i)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [scroll, onSection])
  return null
}

/* --------------------------------------------------------------------- copy */

const SHADOW = '[text-shadow:_0_2px_18px_rgba(0,0,0,0.92)]'

/**
 * The dark pad behind the text.
 *
 * This used to be `blur-2xl`. A 40px CSS blur on a large DOM layer over a
 * full-screen WebGL canvas is one of the most expensive things mobile Safari can
 * be asked to do: it cannot cheaply composite a filtered layer over a canvas
 * that repaints every frame, so it redoes the blur constantly while you scroll.
 * A radial gradient gives the same falloff with no filter at all.
 */
function Scrim({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-[2.5rem] ${className}`}
      style={{ background: 'radial-gradient(ellipse at center, rgba(4,9,18,0.88) 0%, rgba(4,9,18,0.68) 45%, rgba(4,9,18,0) 78%)' }}
    />
  )
}

function Overlay() {
  return (
    <div className="text-white pointer-events-none">
      <h1 className="sr-only">ANF Consulting</h1>

      <section className="h-screen flex flex-col items-center justify-between py-24 sm:py-28 text-center px-6">
        <div className="relative">
          <Scrim className="-inset-x-10 -inset-y-6" />
          <p className={`relative font-display text-[10px] sm:text-xs tracking-[0.3em] uppercase text-flame-300 ${SHADOW}`}>
            Five stops. One system.
          </p>
        </div>
        <div className="relative max-w-lg">
          <Scrim className="-inset-x-8 -inset-y-8" />
          <div className="relative">
            <p className={`text-base sm:text-lg text-silver-100 leading-relaxed ${SHADOW}`}>
              The five things we build, what each one is, and exactly what you get. A short flight, then you decide.
            </p>
            <p className={`mt-10 text-[10px] uppercase tracking-[0.4em] text-silver-400 ${SHADOW}`}>Scroll to begin the flight</p>
          </div>
        </div>
      </section>

      {STATIONS_COPY.map((s, i) => (
        // Copy opposite the planet, tinted by that planet's own light.
        <StationSection key={s.num} station={s} side={i % 2 === 0 ? 'right' : 'left'} accent={PLANETS[i].accent} />
      ))}

      <RequestCTA />
    </div>
  )
}

/**
 * Copy sits on the opposite side to the planet it describes, so the world stays
 * visible while you read about it. Planets alternate sides, so the text does too.
 */
function StationSection({ station, side, accent }: { station: Station; side: 'left' | 'right'; accent: string }) {
  return (
    // items-end on phones: the squeezed flight line means the planet crosses the
    // upper half of a portrait screen, so the copy keeps to the lower half
    // instead of sitting on top of it.
    <section className="h-screen flex items-end sm:items-center px-6 pb-16 sm:pb-0 sm:px-10 md:px-24">
      <div className={`relative w-full max-w-md ${side === 'left' ? 'mr-auto' : 'ml-auto'}`}>
        <Scrim className="-inset-x-8 -inset-y-10" />
        <div className="relative">
          <p className={`font-display text-[10px] tracking-[0.5em] uppercase mb-2.5 ${SHADOW}`} style={{ color: accent }}>
            Station {station.num}
          </p>
          <h2 className={`font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-[1.02] ${SHADOW}`}>
            {station.title}
          </h2>
          <p className={`mt-2 text-base sm:text-lg font-medium ${SHADOW}`} style={{ color: accent }}>
            {station.kicker}
          </p>
          <div className="mt-4 h-px w-12" style={{ background: accent, opacity: 0.8 }} />
          <p className={`mt-4 text-silver-200 text-sm sm:text-base leading-relaxed ${SHADOW}`}>{station.body}</p>
          <ul className="mt-5 space-y-2">
            {station.specifics.map((line) => (
              <li key={line} className={`flex gap-2.5 text-sm text-silver-300 leading-snug ${SHADOW}`}>
                <span aria-hidden className="mt-[0.45em] h-1 w-1 shrink-0 rounded-full" style={{ background: accent }} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function RequestCTA() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim() || status === 'sending') return
    setStatus('sending')
    try {
      await submitRequest({
        contact_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: message.trim(),
        source: 'website-experience',
      })
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const field =
    'w-full rounded-xl border border-white/12 bg-midnight-950/50 px-4 py-3 text-sm text-silver-100 placeholder:text-silver-400/70 outline-none focus:border-flame-500/60 transition-colors'

  return (
    <section className="min-h-screen flex flex-col items-center justify-center py-10 sm:py-24 text-center px-6">
      <div className="relative w-full max-w-lg pointer-events-auto">
        <Scrim className="-inset-x-10 -inset-y-10" />
        <div className="relative flex flex-col items-center">
          <p className={`font-display text-[10px] sm:text-xs tracking-[0.35em] uppercase text-flame-300 ${SHADOW}`}>
            Clarity. Integration. Automation.
          </p>
          <h2 className={`mt-3 sm:mt-4 font-display text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] sm:leading-[1.02] text-white ${SHADOW}`}>
            Tell me what's<br />slowing you down.
          </h2>

          {status === 'done' ? (
            <p className={`mt-4 sm:mt-6 max-w-md text-base sm:text-lg text-silver-100 leading-relaxed ${SHADOW}`}>
              Got it. I read every one of these myself, and I will be in touch soon. Thank you.
            </p>
          ) : (
            <>
              <p className={`mt-4 sm:mt-6 max-w-md text-base sm:text-lg text-silver-100 leading-relaxed ${SHADOW}`}>
                No call to schedule, no pitch. Tell me where the time or the mess is piling up, in your work or your life, and I will tell you plainly what a system could fix. Business or personal, anyone is welcome.
              </p>
              <form onSubmit={submit} className="mt-6 sm:mt-8 w-full space-y-2.5 sm:space-y-3 text-left">
                <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoComplete="email" required />
                  <input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" autoComplete="tel" required />
                </div>
                <textarea className={`${field} resize-y min-h-[84px] sm:min-h-[110px]`} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What's slowing you down?" required />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-flame-500/60 bg-flame-500/15 text-flame-100 hover:bg-flame-500/25 font-medium tracking-wide transition-colors disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending...' : 'Send my request'}
                </button>
                {status === 'error' && (
                  <p className="text-sm text-red-300 text-center">Something went wrong. Try again, or email admin@anfconsult.com.</p>
                )}
              </form>

              <div className="mt-7 sm:mt-8 pt-6 border-t border-white/10 text-left">
                <p className={`text-sm text-silver-300 leading-relaxed ${SHADOW}`}>
                  Know roughly what you want already?
                </p>
                <a
                  href="/start"
                  className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/[0.06] text-silver-100 hover:bg-white/[0.12] hover:border-white/35 text-sm font-medium tracking-wide transition-colors"
                >
                  Build your own plan
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </a>
                <p className={`mt-2.5 text-xs text-silver-400 ${SHADOW}`}>
                  Pick the pieces you want and we will price it around them.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

// Catches a mount or render crash in the scene so the page shows the actual
// error instead of a blank screen.
class ExperienceBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error) {
    console.error('[experience] crashed', error)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="fixed inset-0 bg-[#040912] text-white flex items-center justify-center p-8">
          <div className="max-w-lg text-center">
            <p className="text-flame-400 text-xs uppercase tracking-[0.3em] mb-3">3D experience hit an error</p>
            <p className="text-silver-300/80 text-sm mb-4">It loaded, but something in the scene crashed. Here is the message so it can be fixed fast:</p>
            <pre className="text-left text-xs text-red-300 bg-white/5 border border-white/10 rounded-lg p-4 overflow-auto whitespace-pre-wrap">{this.state.error.message}</pre>
            <a href="/" className="inline-block mt-5 text-flame-400 hover:text-flame-300 text-sm">Back to the site</a>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
