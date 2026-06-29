import { Link } from 'react-router-dom'
import { useInView, useCountUp } from '../hooks/motion'

/**
 * "What we build" product showcase: a polished, animated preview of the kind of
 * CRM/dashboard ANF builds, framed like a real app in a browser window. Modeled
 * on the realtor demo (/demos/real-estate) with mock data only, so it shows real
 * product without touching any client data. Numbers count up and the lead-source
 * bars fill in as it scrolls into view.
 */

const NEEDS = [
  { tag: 'Call now', tagClass: 'bg-flame-100 text-flame-700', title: 'The Reyes family replied 2 minutes ago', sub: 'Pre-approved at $450k. Strike while it is warm.' },
  { tag: 'Showing', tagClass: 'bg-sky-100 text-sky-700', title: '2:00 PM at 88 Lakeview with the Hartleys', sub: 'Their favorite so far. Bring the comps you pulled.' },
  { tag: 'Follow up', tagClass: 'bg-violet-100 text-violet-700', title: 'CMA promised to the 510 Maple seller today', sub: 'Draft is ready in your templates. One click to send.' },
]

const SOURCES = [
  { label: 'Zillow', pct: 34 },
  { label: 'Website', pct: 22 },
  { label: 'Referral', pct: 18 },
  { label: 'Sphere', pct: 14 },
  { label: 'Open house', pct: 12 },
]

const INDUSTRIES = [
  { label: 'Real estate', to: '/demos/real-estate' },
  { label: 'Coaching', to: '/demos/coaches' },
  { label: 'Home services', to: '/demos/home-services' },
  { label: 'Fitness', to: '/demos/fitness' },
  { label: 'Creators', to: '/demos/creators' },
  { label: 'Family', to: '/demos/family' },
]

function Stat({ label, value, prefix = '', suffix = '', decimals = 0 }: { label: string; value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const { ref, display } = useCountUp(value, { decimals })
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
      <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-lg sm:text-xl font-semibold text-slate-900 mt-0.5 tabular-nums">
        {prefix}<span ref={ref}>{display}</span>{suffix}
      </p>
    </div>
  )
}

export function ProductShowcase() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3)
  const commission = useCountUp(142, {})
  const max = Math.max(...SOURCES.map((s) => s.pct))

  return (
    <section className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
      <div className="text-center mb-10 md:mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What we build</p>
        <h2 className="text-3xl md:text-5xl font-display text-silver-100 leading-tight">Software your business actually runs on</h2>
        <p className="mt-4 max-w-2xl mx-auto text-silver-400 leading-relaxed">
          Not a template with your logo on it. A real system built around how you work, like this CRM we built for a realtor. Yours is shaped around your business.
        </p>
      </div>

      {/* Browser-framed app preview */}
      <div className="relative">
        <div aria-hidden className="absolute -inset-x-6 -inset-y-10 -z-10" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 45%, rgba(242,107,29,0.14), transparent 70%)' }} />
        <div className="anf-float mx-auto max-w-5xl rounded-2xl border border-white/10 bg-midnight-900/70 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-midnight-950/60">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
            <div className="ml-3 flex-1 max-w-sm mx-auto">
              <div className="rounded-md bg-white/[0.06] text-[11px] text-silver-500 px-3 py-1 text-center truncate">app.yourbrand.com/dashboard</div>
            </div>
          </div>

          {/* App body (light, like the real product) */}
          <div ref={ref} className="bg-slate-50 p-4 sm:p-6 text-left">
            {/* Top row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-flame-500 to-flame-700 text-white text-xs font-bold flex items-center justify-center">JA</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight">Good morning, Jordan</p>
                <p className="text-[11px] text-slate-500">Tuesday, here is what needs you</p>
              </div>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 anf-pulse" /> Live
              </span>
            </div>

            {/* Stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
              <Stat label="Active listings" value={14} />
              <Stat label="Pipeline value" value={4.2} prefix="$" suffix="M" decimals={1} />
              <Stat label="Showings / week" value={8} />
              <Stat label="Avg lead response" value={2} suffix=" min" />
            </div>

            {/* Two columns */}
            <div className="grid md:grid-cols-[1.4fr_1fr] gap-3">
              {/* Needs you today */}
              <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Needs you today</p>
                <div className="space-y-2.5">
                  {NEEDS.map((n) => (
                    <div key={n.title} className="flex items-start gap-2.5">
                      <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${n.tagClass}`}>{n.tag}</span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-slate-800 leading-snug">{n.title}</p>
                        <p className="text-[11px] text-slate-500 leading-snug">{n.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right column: lead sources + commission */}
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2.5">Where leads come from</p>
                  <div className="space-y-1.5">
                    {SOURCES.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <span className="w-16 shrink-0 text-[11px] text-slate-600">{s.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-flame-500 to-flame-400 transition-[width] duration-1000 ease-out"
                            style={{ width: inView ? `${(s.pct / max) * 100}%` : '0%', transitionDelay: `${i * 90}ms` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-500">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Commission to goal</p>
                    <p className="text-[11px] text-slate-500"><span ref={commission.ref}>{commission.display}</span>k of $250k</p>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-1000 ease-out" style={{ width: inView ? '57%' : '0%', transitionDelay: '220ms' }} />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">57% to goal, ahead of last year's pace.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption + live-demo strip */}
      <div className="text-center mt-10">
        <p className="text-silver-400 max-w-xl mx-auto">
          This is one realtor's setup. We build yours around how you actually work, in any industry.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {INDUSTRIES.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-sm text-silver-300 hover:border-flame-500/50 hover:text-white transition-colors"
            >
              {it.label}
            </Link>
          ))}
        </div>
        <Link to="/demos" className="inline-block mt-6 text-flame-400 hover:text-flame-300 text-sm uppercase tracking-widest font-medium">
          Explore the live demos →
        </Link>
      </div>
    </section>
  )
}
