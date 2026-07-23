import { BookCallButton } from '../components/BookCallButton'

// Unlisted investor page (no header nav link). Andrew shares the URL directly.
// Real strategy narrative; bracketed [ ] spots are his actual numbers to fill,
// so nothing financial is fabricated on an investor-facing page.

const traction = [
  { label: 'Clients live or building', value: '[X]', note: 'real estate, coaching, home services, and art' },
  { label: 'Monthly recurring', value: '[$X]', note: 'grows as builds convert to hosting and support' },
  { label: 'Signed + pipeline', value: '[$X]', note: 'committed work plus active proposals' },
  { label: 'Demo studio', value: 'Live', note: 'anfconsult.com/demos' },
]

const roadmap = [
  { title: 'Intake to draft, automatically', body: 'A client fills one intake and an increasing share of their build is assembled from one engine, then reviewed and shipped. Less time per client, same quality.' },
  { title: 'A vertical at a time', body: 'Each industry (realtor, coaching, field service, art, personal life OS) is productized once and sold many times, with a public demo that sells it before a call.' },
  { title: 'Recurring by default', body: 'Every build carries a monthly for hosting, support, and iteration, so the base compounds while the cost to deliver falls.' },
]

export function Invest() {
  return (
    <>
      <section className="relative max-w-5xl mx-auto px-6 pt-16 md:pt-24 pb-12 text-center">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 -z-10 h-[70%] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(242, 107, 29, 0.10), transparent 70%)' }}
        />
        <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-flame-500">Invest in ANF Consulting</p>
        <h1 className="mt-5 text-4xl md:text-6xl font-display font-medium text-silver-100 leading-[1.05] tracking-tight">
          We build the systems people run their businesses and their lives on.<br className="hidden sm:block" /> Now we are turning that into a product.
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-silver-400 leading-relaxed">
          ANF builds websites, CRMs, client portals, AI tools, and personal life-management systems, for small businesses and the people who run them. The next step is turning each build into a repeatable, recurring-revenue platform. Here is where we are and where this goes.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">The thesis</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Productized delivery, not billable hours</h2>
        </div>
        <p className="text-silver-400 leading-relaxed text-lg max-w-3xl mx-auto text-center">
          Most agencies sell time. We are turning delivery into a product. A client fills out one intake, and a growing share of their website and CRM is assembled automatically from a single engine, then reviewed and shipped. A public demo studio lets a prospect see a working version built for their industry before they ever talk to us. The result is a lower cost to deliver and recurring revenue on every client, with equal weight on marketing, infrastructure, AI, and education.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8 md:py-12">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Where we are</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Traction</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {traction.map((t) => (
            <div key={t.label} className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40 text-center">
              <p className="text-3xl font-display text-flame-400">{t.value}</p>
              <p className="text-sm font-medium text-silver-200 mt-2">{t.label}</p>
              <p className="text-xs text-silver-500 mt-1 leading-relaxed">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10 md:py-14">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">The model</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">How it makes money</h2>
        </div>
        <p className="text-silver-400 leading-relaxed text-lg max-w-3xl mx-auto text-center">
          Each client pays a build fee plus a monthly for hosting, support, and iteration. As the platform automates more of the build, the cost to deliver drops while the recurring revenue compounds. Every vertical we package becomes an offer we can sell again and again, with the demo studio doing the first round of selling for us.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8 md:py-12">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Where it goes</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">The roadmap</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {roadmap.map((r) => (
            <div key={r.title} className="border border-midnight-700/30 rounded-2xl p-7 bg-midnight-900/40">
              <h3 className="text-xl font-display text-silver-100 mb-2">{r.title}</h3>
              <p className="text-silver-400 leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8 md:py-12">
        <div className="border border-flame-500/30 rounded-2xl p-7 md:p-9 bg-midnight-900/40 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">The ask</p>
          <p className="text-silver-300 text-lg leading-relaxed">
            We are raising <span className="text-silver-100">[$X]</span> to <span className="text-silver-100">[use of funds, for example accelerate the automation platform, sales, and onboarding]</span>.
          </p>
          <p className="text-silver-500 text-sm mt-3">[Add your structure and terms here.]</p>
        </div>
      </section>

      {/* Partner programs: referral (one-time) and royalty (ongoing), matching the CRM briefs. */}
      <section className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="text-center mb-9">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Another way in</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Partner with us instead of investing</h2>
          <p className="mt-5 max-w-2xl mx-auto text-lg text-silver-400 leading-relaxed">
            Not everyone wants to write a check, and we do not always need one. If you know business owners who could use what we build, send them our way and share in the business you help create. No money up front, no equity. Pick whichever fits you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border border-flame-500/30 rounded-2xl p-7 md:p-8 bg-midnight-900/40">
            <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Referral</p>
            <h3 className="text-2xl font-display text-silver-100 mb-3">Earn on the introduction</h3>
            <p className="text-silver-400 leading-relaxed mb-4">
              Introduce a business that becomes a client, and you earn a one-time reward when they sign. Paid once, simple and clean.
            </p>
            <p className="text-silver-300 text-lg">
              <span className="text-silver-100">[10%]</span> of their first project when they sign.
            </p>
            <p className="text-silver-500 text-sm mt-3">Best for people who want a straightforward finder's reward.</p>
          </div>
          <div className="border border-flame-500/30 rounded-2xl p-7 md:p-8 bg-midnight-900/40">
            <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Royalty</p>
            <h3 className="text-2xl font-display text-silver-100 mb-3">Earn on the relationship</h3>
            <p className="text-silver-400 leading-relaxed mb-4">
              Introduce a business that becomes a client, and earn an ongoing share of what they keep paying us. Your upside grows as they do.
            </p>
            <p className="text-silver-300 text-lg">
              <span className="text-silver-100">[5%]</span> of what that client pays us for <span className="text-silver-100">[the first 12 months]</span>. Paid as they pay us.
            </p>
            <p className="text-silver-500 text-sm mt-3">Best for connectors who would rather build a stream of passive income.</p>
          </div>
        </div>
        <p className="text-center text-silver-500 text-sm mt-6 max-w-2xl mx-auto">
          For people with a network of business owners: fellow consultants, agencies, realtors, and community connectors who would rather build alongside us than invest cash.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-display text-silver-100 mb-4">Let's talk</h2>
        <p className="text-lg text-silver-400 mb-8">
          Book a call and I will walk you through the platform, the numbers, and the plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <BookCallButton size="lg" />
          <a href="mailto:admin@anfconsult.com" className="text-flame-400 hover:text-flame-300 text-sm uppercase tracking-widest font-medium">
            admin@anfconsult.com
          </a>
        </div>
      </section>
    </>
  )
}
