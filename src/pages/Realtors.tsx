import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { PageHero } from '../components/PageHero'

const stack = [
  {
    title: 'A website that actually sells',
    body: 'A fast, modern site built around your listings, your area expertise, and a clear path for buyers and sellers to reach you.',
  },
  {
    title: 'A CRM built for your team',
    body: 'One place for leads, contacts, and follow-ups, shaped around how a real estate team actually works, not generic sales software.',
  },
  {
    title: 'AI Lead Responder',
    body: 'An assistant that answers and qualifies inbound leads 24/7, then routes them to the right agent in seconds, so no lead goes cold overnight.',
  },
  {
    title: 'CE-backed AI training',
    body: 'As an Ohio-certified CE provider, ANF can train your team on the AI tools that save real time, with continuing-education credit.',
  },
]

const outcomes = [
  'Stop losing leads to slow response times',
  'Replace four disconnected tools with one system',
  'Look as sharp online as you are in person',
  'Spend less time on admin, more time with clients',
]

export function Realtors() {
  return (
    <>
      <PageHero
        eyebrow="For real estate professionals"
        title={<>Your website, CRM, and lead response,<br className="hidden sm:block" /> handled by one partner.</>}
        subtitle="ANF builds the website, the team CRM, and the AI lead response that modern agents and brokerages need to compete, plus the training to use all of it well."
      >
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <BookCallButton size="lg" className="!rounded-full" />
          <Link
            to="/audit"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/[0.12] text-silver-100 hover:border-flame-500/50 hover:bg-white/[0.03] transition-colors font-medium"
          >
            Get a free audit →
          </Link>
        </div>
      </PageHero>

      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">The full stack</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Everything in one place</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {stack.map((s) => (
            <div
              key={s.title}
              className="border border-white/[0.07] hover:border-flame-500/40 rounded-2xl p-7 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors"
            >
              <h3 className="text-xl font-display text-silver-100 mb-2">{s.title}</h3>
              <p className="text-silver-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What changes</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">What it does for your business</h2>
        </div>
        <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-4 max-w-3xl mx-auto">
          {outcomes.map((o) => (
            <li key={o} className="flex items-start gap-3 text-silver-300">
              <span className="text-flame-500 mt-1 leading-none">·</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-display text-silver-100 mb-4">See where your leads are leaking</h2>
        <p className="text-lg text-silver-400 mb-8">
          A 30-minute call, or a free audit of your current site and lead flow. No pitch, no pressure.
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
