import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { Testimonials } from '../components/Testimonials'

const credibility = [
  {
    title: 'Ohio CE Provider',
    body: 'Certified by the State of Ohio to deliver Continuing Education credit for real estate professionals.',
  },
  {
    title: 'Hands-on practitioner',
    body: 'Years of direct, daily work with modern tools. These aren’t theories pulled from a deck.',
  },
  {
    title: 'Small by design',
    body: 'Intentionally limited roster. Longer engagements, not one-off projects.',
  },
  {
    title: 'Transparent pricing',
    body: 'Every tier and package is published. No mystery numbers, no hidden scope.',
  },
]

const services = [
  { title: 'Social Media Management', body: 'Daily content, engagement, and strategy across every major platform.' },
  { title: 'Website Development', body: 'From single-page landing sites to full-scale custom platforms.' },
  { title: 'AI Coaching & Integration', body: 'Practical AI training and productized implementation for your workflows.' },
  { title: 'Education & Workshops', body: 'Ohio Real Estate CE and corporate AI training built on real delivery.' },
]

const pillars = [
  { title: 'Specific over generic', body: 'Every deliverable is built for your business, your brand, and your audience, not pulled from a template.' },
  { title: 'Transparent pricing', body: 'Tiers and packages are published. Custom scoping happens only when the work genuinely warrants it.' },
  { title: 'Productized delivery', body: 'The services that should be standardized are standardized. Same quality, same timeline, every time.' },
  { title: 'Long engagements over short', body: "Our best work happens over 3+ months. We're not interested in one-off projects that don't compound." },
]

export function Home() {
  return (
    <>
      <section className="relative max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 md:pb-28 text-center">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[70%] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(242, 107, 29, 0.10), transparent 70%)',
          }}
        />
        <div className="flex justify-center mb-8">
          <img src="/anf-wordmark.png" alt="ANF Consulting" className="h-24 md:h-32 w-auto" />
        </div>
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-silver-400">
          Clarity <span className="text-flame-500">·</span> Structure <span className="text-flame-500">·</span> Confidence
        </p>
        <h1 className="mt-6 text-4xl md:text-6xl font-display font-medium text-silver-100 leading-[1.05] tracking-tight">
          Smart marketing.<br className="hidden sm:block" /> Modern infrastructure.<br className="hidden sm:block" /> Practical AI.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-silver-400 leading-relaxed">
          ANF Consulting is a full-stack growth partner for businesses ready to invest in all three, plus the education and workshops that make any of it stick.
          <span className="block mt-3 text-flame-400 font-medium">One partner. One roadmap. One team.</span>
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <BookCallButton size="lg" />
          <Link
            to="/demos"
            className="text-silver-300 hover:text-silver-100 text-sm uppercase tracking-widest border-b border-silver-700/50 hover:border-flame-500 pb-1 transition-colors"
          >
            See live demos →
          </Link>
          <Link
            to="/services"
            className="text-silver-300 hover:text-silver-100 text-sm uppercase tracking-widest border-b border-silver-700/50 hover:border-flame-500 pb-1 transition-colors"
          >
            See services →
          </Link>
          <Link
            to="/audit"
            className="text-silver-300 hover:text-silver-100 text-sm uppercase tracking-widest border-b border-silver-700/50 hover:border-flame-500 pb-1 transition-colors"
          >
            Free audit →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Who we work with</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Built for two kinds of clients</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-midnight-700/30 hover:border-flame-500/40 rounded-2xl p-8 bg-midnight-900/40 transition-colors">
            <h3 className="text-xl md:text-2xl font-display text-silver-100 mb-3">Independent Professionals</h3>
            <p className="text-silver-400 leading-relaxed">
              Solo lawyers, realtors, accountants, coaches, and other practitioners ready to weave AI and modern marketing into how they actually work, not just talk about it.
            </p>
          </div>
          <div className="border border-midnight-700/30 hover:border-flame-500/40 rounded-2xl p-8 bg-midnight-900/40 transition-colors">
            <h3 className="text-xl md:text-2xl font-display text-silver-100 mb-3">Business Owners</h3>
            <p className="text-silver-400 leading-relaxed">
              Owners running growing businesses who want their content, their website, their AI workflows, and their team training handled by one focused partner, not stitched together from four vendors.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Why ANF</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Built on credentials, not buzzwords</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {credibility.map((c) => (
            <div key={c.title} className="text-center">
              <div className="inline-block w-10 h-px bg-flame-500 mb-4" aria-hidden />
              <h3 className="text-lg font-display text-silver-100 mb-2">{c.title}</h3>
              <p className="text-sm text-silver-400 leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What we do</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Four service lines, one strategy</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((s) => (
            <div key={s.title} className="border-t border-flame-500/50 pt-6">
              <h3 className="text-lg font-display text-silver-100 mb-2">{s.title}</h3>
              <p className="text-sm text-silver-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/services"
            className="text-flame-400 hover:text-flame-300 text-sm uppercase tracking-widest font-medium"
          >
            See full service menu →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Our approach</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">How we work</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl mx-auto">
          {pillars.map((p) => (
            <div key={p.title}>
              <h3 className="text-lg font-display text-silver-100 mb-2 flex items-center gap-3">
                <span className="text-flame-500 text-2xl leading-none">·</span>
                {p.title}
              </h3>
              <p className="text-silver-400 leading-relaxed pl-7">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-display text-silver-100 mb-4">Ready to start?</h2>
        <p className="text-lg text-silver-400 mb-8">
          A 30-minute discovery call. No pitch, no pressure. Just a conversation about what you're trying to build.
        </p>
        <BookCallButton size="lg" />
      </section>
    </>
  )
}
