import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { Testimonials } from '../components/Testimonials'

const PILLARS = [
  { num: '01', title: 'Marketing', body: 'Content and campaigns that compound.' },
  { num: '02', title: 'Infrastructure', body: 'Websites and CRMs that run the business.' },
  { num: '03', title: 'AI', body: 'Practical tools woven into your work.' },
  { num: '04', title: 'Education', body: 'Workshops and Ohio real estate CE.' },
]

const credibility = [
  { title: 'Ohio CE Provider', body: 'Certified by the State of Ohio to deliver Continuing Education credit for real estate professionals.' },
  { title: 'Hands-on practitioner', body: 'Years of direct, daily work with modern tools. These are not theories pulled from a deck.' },
  { title: 'Small by design', body: 'Intentionally limited roster. Longer engagements, not one-off projects.' },
  { title: 'Transparent pricing', body: 'Every tier and package is published. No mystery numbers, no hidden scope.' },
]

const services = [
  { title: 'Marketing & Social', body: 'Daily content, engagement, and strategy across every major platform.' },
  { title: 'Websites & Systems', body: 'From single-page landing sites to full custom platforms and CRMs.' },
  { title: 'AI Coaching & Integration', body: 'Practical AI training and productized implementation for your workflows.' },
  { title: 'Education & Workshops', body: 'Ohio Real Estate CE and corporate AI training built on real delivery.' },
]

const approach = [
  { title: 'Specific over generic', body: 'Every deliverable is built for your business, your brand, and your audience, not pulled from a template.' },
  { title: 'Transparent pricing', body: 'Tiers and packages are published. Custom scoping happens only when the work genuinely warrants it.' },
  { title: 'Productized delivery', body: 'The services that should be standardized are standardized. Same quality, same timeline, every time.' },
  { title: 'Long engagements over short', body: 'Our best work happens over 3+ months. We are not interested in one-off projects that do not compound.' },
]

const cardClass = 'rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-all duration-300'

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">{eyebrow}</p>
      <h2 className="text-3xl md:text-4xl font-display text-silver-100">{title}</h2>
      {subtitle && <p className="mt-4 max-w-2xl mx-auto text-silver-400 leading-relaxed">{subtitle}</p>}
    </div>
  )
}

export function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[130%]" style={{ background: 'radial-gradient(ellipse 55% 45% at 50% 0%, rgba(242,107,29,0.16), transparent 70%)' }} />
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[55rem] h-[55rem] rounded-full opacity-[0.06] blur-3xl" style={{ background: 'conic-gradient(from 200deg at 50% 50%, #F26B1D, #1A2B4A, #060F1F, #F26B1D)' }} />
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at 50% 22%, #000, transparent 75%)',
              maskImage: 'radial-gradient(ellipse 65% 55% at 50% 22%, #000, transparent 75%)',
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 pt-20 md:pt-28 pb-14 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] sm:text-xs tracking-[0.22em] uppercase text-silver-300 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-flame-500" /> Marketing · Infrastructure · AI · Education
          </div>
          <h1 className="text-[2.6rem] sm:text-6xl md:text-7xl font-display font-medium text-silver-100 leading-[1.02] tracking-tight">
            Smart marketing.<br />Modern infrastructure.<br /><span className="text-flame-400">Practical AI.</span>
          </h1>
          <p className="mt-7 max-w-2xl mx-auto text-lg md:text-xl text-silver-400 leading-relaxed">
            One focused partner for the whole stack. The marketing that grows you, the systems that run you, the AI woven into how you work, and the training that makes it stick.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <BookCallButton size="lg" label="Book a discovery call" className="!rounded-full" />
            <Link
              to="/start"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/[0.12] text-silver-100 hover:border-flame-500/50 hover:bg-white/[0.03] transition-colors font-medium"
            >
              Start a project <span aria-hidden>→</span>
            </Link>
          </div>
          <p className="mt-6 text-sm text-silver-500">
            <Link to="/demos" className="hover:text-flame-400 transition-colors">See live demos</Link>
            <span className="mx-2.5 text-silver-700">/</span>
            <Link to="/experience" className="hover:text-flame-400 transition-colors">Enter the 3D experience</Link>
            <span className="mx-2.5 text-silver-700">/</span>
            <Link to="/audit" className="hover:text-flame-400 transition-colors">Free audit</Link>
          </p>
        </div>

        {/* Four pillars strip */}
        <div className="max-w-5xl mx-auto px-6 pb-16 md:pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.07]">
            {PILLARS.map((p) => (
              <div key={p.title} className="bg-midnight-950 hover:bg-midnight-900/60 p-5 md:p-6 transition-colors">
                <p className="text-flame-400 text-xs font-mono mb-2.5">{p.num}</p>
                <p className="text-silver-100 font-display text-lg">{p.title}</p>
                <p className="text-silver-500 text-sm mt-1 leading-snug">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHO WE WORK WITH */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <SectionHeader eyebrow="Who we work with" title="Built for two kinds of clients" />
        <div className="grid md:grid-cols-2 gap-5">
          {[
            { h: 'Independent Professionals', b: 'Solo lawyers, realtors, accountants, coaches, and other practitioners ready to weave AI and modern marketing into how they actually work, not just talk about it.' },
            { h: 'Business Owners', b: 'Owners running growing businesses who want their content, their website, their AI workflows, and their team training handled by one focused partner, not stitched together from four vendors.' },
          ].map((c) => (
            <div key={c.h} className={`${cardClass} p-8 hover:border-flame-500/30 hover:shadow-flame-glow`}>
              <h3 className="text-xl md:text-2xl font-display text-silver-100 mb-3">{c.h}</h3>
              <p className="text-silver-400 leading-relaxed">{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CREDIBILITY */}
      <section className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        <SectionHeader eyebrow="Why ANF" title="Built on credentials, not buzzwords" />
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

      {/* SERVICES */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <SectionHeader eyebrow="What we do" title="Four service lines, one strategy" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <div key={s.title} className={`${cardClass} p-6 hover:border-flame-500/30`}>
              <p className="text-flame-400/80 font-mono text-xs mb-3">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="text-lg font-display text-silver-100 mb-2">{s.title}</h3>
              <p className="text-sm text-silver-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link to="/services" className="text-flame-400 hover:text-flame-300 text-sm uppercase tracking-widest font-medium">
            See full service menu →
          </Link>
        </div>
      </section>

      {/* APPROACH */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <SectionHeader eyebrow="Our approach" title="How we work" />
        <div className="grid md:grid-cols-2 gap-4">
          {approach.map((p) => (
            <div key={p.title} className={`${cardClass} p-6`}>
              <h3 className="text-lg font-display text-silver-100 mb-2 flex items-center gap-3">
                <span className="text-flame-500 text-2xl leading-none">·</span>
                {p.title}
              </h3>
              <p className="text-silver-400 leading-relaxed pl-7">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ALTERNATIVES */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <SectionHeader
          eyebrow="Why ANF"
          title="One partner beats the alternatives"
          subtitle="Most businesses end up doing it themselves, hiring a freelancer, or paying an agency. Each one has a catch."
        />
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Doing it yourself', catch: 'Nights and weekends building tools you half-finish, while the real work waits.' },
            { label: 'A freelancer', catch: 'Cheap and quick, but one skill, no continuity, and gone when you need the next thing.' },
            { label: 'A big agency', catch: 'Expensive and slow, and you are a small account getting a template with your logo on it.' },
          ].map((c) => (
            <div key={c.label} className={`${cardClass} p-6`}>
              <p className="text-silver-300 font-medium mb-2">{c.label}</p>
              <p className="text-silver-500 text-sm leading-relaxed">{c.catch}</p>
            </div>
          ))}
          <div className="relative rounded-2xl border border-flame-500/50 bg-flame-500/[0.08] p-6 overflow-hidden shadow-flame-glow">
            <div aria-hidden className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-flame-500/20 blur-2xl" />
            <p className="text-flame-300 font-semibold mb-2">ANF Consulting</p>
            <p className="text-silver-200 text-sm leading-relaxed">
              One partner across marketing, infrastructure, AI, and education. A small roster, so you are never a number, and you own what we build.
            </p>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] px-6 py-14 md:py-20 text-center">
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{ background: 'radial-gradient(ellipse 70% 90% at 50% 110%, rgba(242,107,29,0.16), transparent 70%)' }}
          />
          <h2 className="text-3xl md:text-5xl font-display text-silver-100 mb-4">Ready to start?</h2>
          <p className="text-lg text-silver-400 mb-8 max-w-xl mx-auto">
            A 30-minute discovery call. No pitch, no pressure. Just a conversation about what you are trying to build.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <BookCallButton size="lg" label="Book a discovery call" className="!rounded-full" />
            <Link
              to="/start"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/[0.12] text-silver-100 hover:border-flame-500/50 hover:bg-white/[0.03] transition-colors font-medium"
            >
              Start a project <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
