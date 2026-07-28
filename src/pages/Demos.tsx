import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { PageHero } from '../components/PageHero'

type Demo = {
  name: string
  who: string
  features: string[]
  to: string
}

const demos: Demo[] = [
  {
    name: 'Coaches and consultants',
    who: '1:1 and group programs',
    features: ['Client roster', 'Session notes', 'Packages and payments'],
    to: '/demos/coaches',
  },
  {
    name: 'Real estate agents',
    who: 'Solo agents and teams',
    features: ['Lead pipeline', 'Speed to lead', 'Listings and closings'],
    to: '/demos/real-estate',
  },
  {
    name: 'Parents and family',
    who: 'A family HQ, not a CRM',
    features: ["Kids' schedules", 'Meals and errands', 'Appointments'],
    to: '/demos/family',
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
    features: ['Members', 'Classes', 'Retention'],
    to: '/demos/fitness',
  },
  {
    name: 'Creators and solopreneurs',
    who: 'Content as the business',
    features: ['Brand deals', 'Content calendar', 'Posting'],
    to: '/demos/creators',
  },
]

export function Demos() {
  return (
    <>
      <PageHero
        eyebrow="Demo studio"
        title="See a CRM built for your world."
        subtitle="A CRM shaped for the way your kind of business actually runs. Each one is designed around its own world, not a template with the colors swapped. Open any one below to look around, or tell us yours and we will build a demo around it."
      />

      <section className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {demos.map((d) => (
            <Link
              key={d.name}
              to={d.to}
              className="group flex flex-col border border-white/[0.07] hover:border-flame-500/50 rounded-2xl p-7 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors"
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
              <div className="mt-auto pt-3 border-t border-white/[0.07] flex items-center justify-between">
                <span className="text-flame-400 group-hover:text-flame-300 text-sm uppercase tracking-widest font-medium">Open demo →</span>
                <span className="text-xs text-silver-500">Interactive</span>
              </div>
            </Link>
          ))}
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
