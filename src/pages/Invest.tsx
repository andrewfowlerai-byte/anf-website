import { BookCallButton } from '../components/BookCallButton'
import { PageHero } from '../components/PageHero'

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
      <PageHero
        title="From builds to a product"
        subtitle="We build the systems people run their businesses and their lives on. Now we are turning that into a product. ANF builds websites, CRMs, client portals, AI tools, and personal life-management systems, for small businesses and the people who run them. The next step is turning each build into a repeatable, recurring-revenue platform. Here is where we are and where this goes."
      />

      <section className="max-w-4xl px-[var(--edge)] py-10 md:py-14">
        <div className="mb-8">
          <h2 className="t-head">Productized delivery, not billable hours</h2>
        </div>
        <p className="leading-relaxed t-lead max-w-3xl">
          Most agencies sell time. We are turning delivery into a product. A client fills out one intake, and a growing share of their website and CRM is assembled automatically from a single engine, then reviewed and shipped. A public demo studio lets a prospect see a working version built for their industry before they ever talk to us. The result is a lower cost to deliver and recurring revenue on every client, with equal weight on marketing, infrastructure, AI, and education.
        </p>
      </section>

      <section className="px-[var(--edge)] py-8 md:py-12">
        <div className="mb-8">
          <h2 className="t-head">Traction</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {traction.map((t) => (
            <div key={t.label} className="slab">
              <p className="t-head font-extrabold tracking-[-0.03em] text-flame-700">{t.value}</p>
              <p className="font-medium mt-2">{t.label}</p>
              <p className="text-[13px] mt-1 leading-relaxed">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl px-[var(--edge)] py-10 md:py-14">
        <div className="mb-8">
          <h2 className="t-head">How it makes money</h2>
        </div>
        <p className="leading-relaxed t-lead max-w-3xl">
          Each client pays a build fee plus a monthly for hosting, support, and iteration. As the platform automates more of the build, the cost to deliver drops while the recurring revenue compounds. Every vertical we package becomes an offer we can sell again and again, with the demo studio doing the first round of selling for us.
        </p>
      </section>

      <section className="px-[var(--edge)] py-8 md:py-12">
        <div className="mb-10">
          <h2 className="t-head">The roadmap</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {roadmap.map((r) => (
            <div key={r.title} className="slab">
              <h3 className="t-lead font-extrabold tracking-[-0.03em] mb-2">{r.title}</h3>
              <p className="leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl px-[var(--edge)] py-8 md:py-12">
        <div className="md:p-9 slab">
          <p className="t-lead leading-relaxed">
            We are raising <span>[$X]</span> to <span>[use of funds, for example accelerate the automation platform, sales, and onboarding]</span>.
          </p>
          <p className="mt-3">[Add your structure and terms here.]</p>
        </div>
      </section>

      {/* Partner programs: referral (one-time) and royalty (ongoing), matching the CRM briefs. */}
      <section className="px-[var(--edge)] py-10 md:py-14">
        <div className="mb-9">
          <h2 className="t-head">Partner with us instead of investing</h2>
          <p className="mt-5 max-w-2xl t-lead leading-relaxed">
            Not everyone wants to write a check, and we do not always need one. If you know business owners who could use what we build, send them our way and share in the business you help create. No money up front, no equity. Pick whichever fits you.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="slab">
            <h3 className="t-lead font-extrabold tracking-[-0.03em] mb-3">Earn on the introduction</h3>
            <p className="leading-relaxed mb-4">
              Introduce a business that becomes a client, and you earn a one-time reward when they sign. Paid once, simple and clean.
            </p>
            <p className="t-lead">
              <span>[10%]</span> of their first project when they sign.
            </p>
            <p className="mt-3">Best for people who want a straightforward finder's reward.</p>
          </div>
          <div className="slab">
            <h3 className="t-lead font-extrabold tracking-[-0.03em] mb-3">Earn on the relationship</h3>
            <p className="leading-relaxed mb-4">
              Introduce a business that becomes a client, and earn an ongoing share of what they keep paying us. Your upside grows as they do.
            </p>
            <p className="t-lead">
              <span>[5%]</span> of what that client pays us for <span>[the first 12 months]</span>. Paid as they pay us.
            </p>
            <p className="mt-3">Best for connectors who would rather build a stream of passive income.</p>
          </div>
        </div>
        <p className="mt-6 max-w-2xl">
          For people with a network of business owners: fellow consultants, agencies, realtors, and community connectors who would rather build alongside us than invest cash.
        </p>
      </section>

      <section className="max-w-3xl px-[var(--edge)] py-12 md:py-20">
        <h2 className="t-head mb-5">Let's talk</h2>
        <p className="t-lead mb-8">
          Send a request and I will walk you through the platform, the numbers, and the plan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <BookCallButton size="lg" />
          <a href="mailto:admin@anfconsult.com" className="link font-medium">
            admin@anfconsult.com
          </a>
        </div>
      </section>
    </>
  )
}
