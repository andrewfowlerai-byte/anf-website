import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'

type Demo = {
  name: string
  who: string
  features: string[]
  to?: string
  live?: { url: string; passcode: string }
}

const demos: Demo[] = [
  {
    name: 'Coaches and consultants',
    who: '1:1 and group programs',
    features: ['Client roster', 'Session notes', 'Packages and payments'],
    live: { url: 'https://coaches-crm.vercel.app', passcode: 'coaches2026' },
  },
  {
    name: 'Real estate agents',
    who: 'Solo agents and teams',
    features: ['Listings pipeline', 'Speed to lead', 'Closing reels'],
  },
  {
    name: 'Parents and family',
    who: 'A family HQ, not a CRM',
    features: ["Kids' schedules", 'Meals and errands', 'Appointments'],
  },
  {
    name: 'Home and service pros',
    who: 'Trades, cleaners, landscapers',
    features: ['Jobs and quotes', 'Scheduling', 'Invoices and reviews'],
    to: '/demos/home-services',
  },
  {
    name: 'Fitness and wellness',
    who: 'Trainers, studios, clinics',
    features: ['Members', 'Bookings', 'Retention'],
  },
  {
    name: 'Creators and solopreneurs',
    who: 'Content as the business',
    features: ['Brand deals', 'Content calendar', 'Reel studio'],
  },
]

export function Demos() {
  return (
    <>
      <section className="relative max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-10 text-center">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[70%] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(242, 107, 29, 0.10), transparent 70%)' }}
        />
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-flame-500">Demo studio</p>
        <h1 className="mt-5 text-4xl md:text-6xl font-display font-medium text-silver-100 leading-[1.05] tracking-tight">
          See a CRM built for your world.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-silver-400 leading-relaxed">
          One engine, shaped for the way your business actually runs. Click into a live demo and click around. New industries are rolling out, so if yours is not here yet, it is on the way.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((d) =>
            d.to ? (
              <Link
                key={d.name}
                to={d.to}
                className="group flex flex-col border border-midnight-700/30 hover:border-flame-500/50 rounded-2xl p-7 bg-midnight-900/40 transition-colors"
              >
                <span className="text-xs tracking-[0.2em] uppercase text-emerald-400 mb-3">Live demo</span>
                <h3 className="text-xl font-display text-silver-100 mb-1">{d.name}</h3>
                <p className="text-sm text-silver-400 mb-4">{d.who}</p>
                <ul className="space-y-1.5 mb-5">
                  {d.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-silver-300 text-sm">
                      <span className="text-flame-500 mt-1 leading-none">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 border-t border-midnight-700/30 flex items-center justify-between">
                  <span className="text-flame-400 group-hover:text-flame-300 text-sm uppercase tracking-widest font-medium">Open demo →</span>
                  <span className="text-xs text-silver-500">Interactive</span>
                </div>
              </Link>
            ) : d.live ? (
              <a
                key={d.name}
                href={d.live.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col border border-midnight-700/30 hover:border-flame-500/50 rounded-2xl p-7 bg-midnight-900/40 transition-colors"
              >
                <span className="text-xs tracking-[0.2em] uppercase text-emerald-400 mb-3">Live demo</span>
                <h3 className="text-xl font-display text-silver-100 mb-1">{d.name}</h3>
                <p className="text-sm text-silver-400 mb-4">{d.who}</p>
                <ul className="space-y-1.5 mb-5">
                  {d.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-silver-300 text-sm">
                      <span className="text-flame-500 mt-1 leading-none">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-3 border-t border-midnight-700/30 flex items-center justify-between">
                  <span className="text-flame-400 group-hover:text-flame-300 text-sm uppercase tracking-widest font-medium">Open demo →</span>
                  <span className="text-xs text-silver-500">Code: {d.live.passcode}</span>
                </div>
              </a>
            ) : (
              <div
                key={d.name}
                className="flex flex-col border border-midnight-700/30 rounded-2xl p-7 bg-midnight-900/20"
              >
                <span className="text-xs tracking-[0.2em] uppercase text-silver-500 mb-3">Coming soon</span>
                <h3 className="text-xl font-display text-silver-200 mb-1">{d.name}</h3>
                <p className="text-sm text-silver-500 mb-4">{d.who}</p>
                <ul className="space-y-1.5">
                  {d.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-silver-500 text-sm">
                      <span className="text-silver-600 mt-1 leading-none">·</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-display text-silver-100 mb-4">Don't see your industry?</h2>
        <p className="text-lg text-silver-400 mb-8">
          Tell us what you do, and we will build a demo shaped around your business. No pitch, no pressure.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <BookCallButton size="lg" />
          <Link to="/audit" className="text-flame-400 hover:text-flame-300 text-sm uppercase tracking-widest font-medium">
            Get a free audit →
          </Link>
        </div>
      </section>
    </>
  )
}
