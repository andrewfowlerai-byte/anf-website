import { useEffect, useState } from 'react'
import { BookCallButton } from '../components/BookCallButton'
import { pricingSection } from '../lib/siteContent'

// Fallback copy: shown immediately and used whenever a section has not been
// live-edited yet in the CRM's Site Settings page (migration 0116). Editing a
// price there takes over from these within a minute; these never need a code
// change to update again, they are just the safety net.
const FALLBACK_OVERVIEW = [
  { service: 'Complete Platform', format: 'Website + CRM bundle', starting: '$2,200', anchor: 'platform' },
  { service: 'Website Development', format: 'Flat project fee', starting: '$1,500', anchor: 'website' },
  { service: 'Proof-of-Work Marketing System', format: 'Build + monthly', starting: '$4,000', anchor: 'proof-of-work' },
  { service: 'AI Coaching & Integration', format: 'Per session or retainer', starting: '$229', anchor: 'coaching' },
  { service: 'AI Strategy', format: 'Flat package', starting: '$229', anchor: 'strategy' },
  { service: 'AI Implementation', format: 'Flat package', starting: '$1,500', anchor: 'implementation' },
  { service: 'Ohio Real Estate CE', format: 'Per seat or private booking', starting: '$39/seat', anchor: 'education' },
  { service: 'Corporate Workshops', format: 'Flat per event', starting: '$500', anchor: 'education' },
]

const FALLBACK_WEBSITE_TIERS = [
  {
    name: 'Simple',
    price: '$1,500',
    idealFor: 'Personal brands, solo professionals, landing pages',
    scope: 'Up to 5 pages (Home, About, Services, Contact, +1). Mobile-responsive design. Basic SEO setup (meta titles, descriptions, alt tags). Contact form integration. Social media links.',
  },
  {
    name: 'Mid-Scale',
    price: '$3,500',
    idealFor: 'Growing businesses, service providers, consultants',
    scope: 'Up to 10 pages. Custom design with brand-aligned visuals. Advanced SEO (keyword research, on-page optimization, sitemap submission). Blog or content section setup. Email opt-in / lead capture integration.',
  },
  {
    name: 'Complex',
    price: '$7,000+',
    idealFor: 'Established businesses, e-commerce, multi-functional platforms',
    scope: '15+ pages or custom functionality. Full custom design with advanced UI/UX. Comprehensive SEO strategy with competitive analysis. E-commerce (cart, payment gateway) or membership/portal functionality. Advanced integrations (CRM, automation tools, APIs).',
  },
]

const FALLBACK_PLATFORM_TIERS = [
  {
    name: 'Starter',
    price: '$2,200',
    idealFor: 'A clean, professional presence and the essentials',
    scope: 'A custom marketing website with SEO, built to load fast and convert. Your own design, on your own domain.',
  },
  {
    name: 'Growth',
    price: '$4,500',
    idealFor: 'A website plus a CRM to actually run the business',
    scope: 'Everything in Starter, plus a custom CRM, social scheduling, and automated follow-ups so leads never slip.',
  },
  {
    name: 'Platform',
    price: '$8,000',
    idealFor: 'The full operation: site, CRM, portal, and AI',
    scope: 'Everything in Growth, plus a client login portal and a built-in AI assistant. One system that runs your whole business.',
  },
]

const proofOfWorkIncluded = [
  'Your team captures before and after photos plus a quick customer review on site, tagged to the job address and service',
  'Those become search-indexable proof pages and an interactive service-area map, so you show up for "near me" searches in the towns you actually serve',
  'An embeddable "recent work near you" gallery that drops onto your existing website',
  'A running portfolio of completed jobs your sales team can pull up to win the next bid',
  'Automatic review requests after each job, with the strongest ones featured on your site',
  'Hosting, content generation, and review management handled for you every month',
]

const FALLBACK_COACHING_PACKAGES = [
  { name: 'Single Session', price: '$229', includes: 'One 60-minute coaching session. Topic of your choice: strategy, tool selection, hands-on training.', rate: '$229/session' },
  { name: 'Monthly', price: '$450/mo', includes: '2 coaching sessions per month. Ideal for ongoing skill-building or implementation support.', rate: '$225/session' },
  { name: '3-Month', price: '$1,200', includes: '6 sessions (2 per month over 3 months). Structured curriculum or fully custom.', rate: '$200/session' },
  { name: '6-Month', price: '$2,400', includes: '12 sessions (2 per month over 6 months). Deepest engagement with measurable outcomes.', rate: '$200/session' },
]

const FALLBACK_STRATEGY_OFFERINGS = [
  {
    name: 'AI Possibilities Session',
    price: '$229',
    includes: '60-minute working session walking through 5 to 8 specific AI use cases tailored to your business, plus a 3-page written summary of where AI can help you.',
    bestFor: 'Owners curious about AI but unsure where to start. The right first step for most clients.',
  },
  {
    name: 'AI Roadmap',
    price: '$1,500',
    includes: 'Discovery interviews with key stakeholders, full written roadmap with prioritized tools and sequencing, cost estimates, and two review calls.',
    bestFor: 'Businesses ready to make real decisions about where AI fits and need a credible plan to execute against.',
  },
]

const FALLBACK_IMPLEMENTATION_PACKAGES = [
  {
    name: 'Custom GPT Build',
    price: '$1,500',
    body: 'One trained, branded custom GPT for your workflow: listing description writer, email drafter, FAQ bot, brand-voice content generator, or any specific use case. Includes discovery, build, knowledge upload, testing, documentation, and 45-minute training call.',
    timeline: 'Delivered in 2 to 3 weeks.',
  },
  {
    name: 'Workflow Automation Setup',
    price: '$2,500',
    body: 'One automation built in Zapier, Make, or n8n connecting 2 to 3 of your existing tools (CRM to email, listings to social, intake to Slack, etc.). Includes scope discovery, build, full documentation, and 30-day post-launch support.',
    timeline: 'Delivered in 2 to 3 weeks.',
  },
  {
    name: 'AI Operations Package',
    price: '$5,000',
    body: 'Up to 2 custom GPTs plus 1 workflow automation, designed to work together. Includes team training session and 30 days of support. The right starting point for businesses ready to deploy AI across multiple functions.',
    timeline: 'Delivered in 4 to 6 weeks.',
  },
]

const FALLBACK_IMPLEMENTATION_ADDONS = [
  { addon: 'GPT Maintenance Retainer', price: '$150/mo', includes: 'Quarterly prompt tune-ups, up to 2 new conversation starters or knowledge refreshes per quarter, bug fixes for platform changes, 30-minute quarterly review call.' },
  { addon: 'Additional Custom GPT', price: '+$1,200', includes: 'Each additional GPT added to an existing engagement (reduced from $1,500 standalone).' },
]

const FALLBACK_CE_CHANNELS = [
  { channel: 'Open Enrollment', price: '$39/seat', format: 'Public registration. Virtual or in-person sessions scheduled throughout the year. Includes 3 hours of approved Ohio Real Estate CE credit.' },
  { channel: 'Private Brokerage Booking', price: '$1,200 flat', format: '3-hour private session delivered to your brokerage’s agents. The brokerage pays one flat fee; agents attend at no cost as a team benefit. Ideal for recruiting and retention.' },
]

const FALLBACK_CORPORATE_FORMATS = [
  { format: '1-Hour Lunch-and-Learn', price: '$500', includes: 'Single-topic AI briefing. Great for introducing a team to AI capabilities or covering one specific use case in depth.' },
  { format: 'Half-Day Workshop (3 hrs)', price: '$1,500', includes: 'Interactive workshop combining education and hands-on exercises. Most-requested format.' },
  { format: 'Full-Day Workshop (6 hrs)', price: '$2,500', includes: 'Comprehensive training covering multiple AI use cases with practical implementation exercises. Includes follow-up materials and 30-day Q&A access.' },
]

const processSteps = [
  { step: '1', title: 'Discovery Call', body: '30-minute call to understand your business, goals, and what you’d like ANF to help with. No pitch, no pressure.' },
  { step: '2', title: 'Proposal', body: 'If there’s a fit, you’ll receive a written proposal within 48 hours outlining the recommended scope and investment.' },
  { step: '3', title: 'Agreement & Onboarding', body: 'Once signed, onboarding begins immediately. For retainer services, work begins within 5 business days. For project work, kickoff is scheduled within 2 weeks.' },
  { step: '4', title: 'Delivery', body: 'Clear timelines, regular check-ins, and total transparency throughout. You always know where things stand.' },
]

const paymentTerms = [
  'All invoicing handled via Stripe.',
  'Retainer services billed monthly in advance.',
  'Project work billed 50% on signing, 50% on completion (or as scoped in proposal).',
  'Educational and workshop offerings billed on confirmation of booking.',
  'All pricing in USD.',
  'Every project is different. The prices here are starting points based on typical scope, not quotes. What your build actually needs may cost more or less, and you will have a firm number in writing before any work begins.',
  'Published prices are subject to change at any time and are not guaranteed.',
  'Once you sign, your price is locked. Later changes to our published pricing never apply to work already agreed, and a monthly rate stays where it is unless you add features.',
]

const faqs = [
  {
    q: 'What does the discovery call include?',
    a: 'A 30-minute conversation to understand your business, your goals, and where you’d like help. No sales pitch. Just a real assessment of whether ANF is the right fit. If we’re a fit, you’ll receive a written proposal within 48 hours.',
  },
  {
    q: 'How quickly do you start once we sign?',
    a: 'For retainer services (coaching and ongoing support), work begins within 5 business days. For project work (website builds, CRM builds, AI implementation), kickoff is scheduled within 2 weeks. Educational and workshop bookings work to your calendar.',
  },
  {
    q: 'Do you work with clients outside Ohio?',
    a: 'Yes. The Ohio Real Estate Continuing Education credential is location-specific, but websites, CRMs, AI services, and corporate workshops are delivered virtually nationwide. In-person workshops are available within Northeast Ohio.',
  },
  {
    q: 'I’m not in real estate. Is ANF still a fit?',
    a: 'Yes. Andrew’s background includes real estate, but the vast majority of services (websites, CRMs, AI coaching, AI implementation, corporate workshops) are built for professionals and small businesses in any industry. Only the Ohio CE course is real-estate-specific.',
  },
  {
    q: 'Can I bundle services or change packages later?',
    a: 'Yes. Custom bundles combining website + CRM, AI implementation + coaching, etc., are available on request. Tiers can be adjusted as your needs evolve, with reasonable notice.',
  },
  {
    q: 'Are there contracts? Can I cancel?',
    a: 'Retainer engagements (coaching and ongoing support) renew monthly and can be cancelled any time. Project work is scoped per-engagement and ends when the deliverable ships. Workshops and CE bookings are per-event.',
  },
  {
    q: 'How is payment handled?',
    a: 'All invoicing through Stripe. Retainer services billed monthly in advance. Project work billed 50% on signing, 50% on completion (or as scoped in proposal). Workshops and CE bookings billed on confirmation.',
  },
  {
    q: 'What if I’m not sure which service I need?',
    a: 'Start with the discovery call. It’s free and almost always the right first step. If you’re specifically curious about AI but not sure where to begin, the AI Possibilities Session ($229) walks through 5 to 8 use cases tailored to your business with a written 3-page summary.',
  },
]

export function Services() {
  // Live pricing: starts as the fallback copy above (renders immediately, no
  // flash of empty content), then swaps in whatever is live-edited in the
  // CRM's Site Settings. A section that has never been edited there keeps
  // showing its fallback, since the API returns nothing for it.
  const [overview, setOverview] = useState(FALLBACK_OVERVIEW)
  const [websiteTiers, setWebsiteTiers] = useState(FALLBACK_WEBSITE_TIERS)
  const [platformTiers, setPlatformTiers] = useState(FALLBACK_PLATFORM_TIERS)
  const [coachingPackages, setCoachingPackages] = useState(FALLBACK_COACHING_PACKAGES)
  const [strategyOfferings, setStrategyOfferings] = useState(FALLBACK_STRATEGY_OFFERINGS)
  const [implementationPackages, setImplementationPackages] = useState(FALLBACK_IMPLEMENTATION_PACKAGES)
  const [implementationAddons, setImplementationAddons] = useState(FALLBACK_IMPLEMENTATION_ADDONS)
  const [ceChannels, setCeChannels] = useState(FALLBACK_CE_CHANNELS)
  const [corporateFormats, setCorporateFormats] = useState(FALLBACK_CORPORATE_FORMATS)

  useEffect(() => {
    let cancelled = false
    pricingSection('overview', FALLBACK_OVERVIEW).then((v) => { if (!cancelled) setOverview(v) })
    pricingSection('website_tiers', FALLBACK_WEBSITE_TIERS).then((v) => { if (!cancelled) setWebsiteTiers(v) })
    pricingSection('platform_tiers', FALLBACK_PLATFORM_TIERS).then((v) => { if (!cancelled) setPlatformTiers(v) })
    pricingSection('coaching_packages', FALLBACK_COACHING_PACKAGES).then((v) => { if (!cancelled) setCoachingPackages(v) })
    pricingSection('strategy_offerings', FALLBACK_STRATEGY_OFFERINGS).then((v) => { if (!cancelled) setStrategyOfferings(v) })
    pricingSection('implementation_packages', FALLBACK_IMPLEMENTATION_PACKAGES).then((v) => { if (!cancelled) setImplementationPackages(v) })
    pricingSection('implementation_addons', FALLBACK_IMPLEMENTATION_ADDONS).then((v) => { if (!cancelled) setImplementationAddons(v) })
    pricingSection('ce_channels', FALLBACK_CE_CHANNELS).then((v) => { if (!cancelled) setCeChannels(v) })
    pricingSection('corporate_formats', FALLBACK_CORPORATE_FORMATS).then((v) => { if (!cancelled) setCorporateFormats(v) })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-x-0 top-0 h-[120%]" style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 0%, rgba(242,107,29,0.13), transparent 70%)' }} />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 18%, #000, transparent 72%)',
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 18%, #000, transparent 72%)',
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 pt-20 md:pt-28 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] sm:text-xs tracking-[0.22em] uppercase text-silver-300 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-flame-500" /> 2026 Service Menu
          </div>
          <h1 className="text-4xl md:text-6xl font-display text-silver-100 mb-6 leading-tight">
            Everything we do, <span className="text-flame-400">priced in the open</span>
          </h1>
          <p className="text-lg md:text-xl text-silver-400 leading-relaxed">
            A complete menu of services and engagement options. Each is a starting point we shape around your business, not a box you squeeze into. And it is priced in the open: where pricing varies you see the range, where it is fixed you see the number. These are starting points rather than quotes, because every project is different. You get a firm price in writing before any work begins.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-center text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">At a glance</h2>
        <p className="text-center text-silver-400 text-sm max-w-2xl mx-auto mb-6">Every number here is a starting point. The final build is shaped around your business, your workflow, and your goals.</p>
        <div className="overflow-hidden border border-white/[0.07] rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30">
          <table className="w-full text-left text-sm">
            <thead className="bg-midnight-900/80 text-silver-100">
              <tr>
                <th className="px-4 py-3 font-display font-medium">Service Line</th>
                <th className="px-4 py-3 font-display font-medium hidden sm:table-cell">Format</th>
                <th className="px-4 py-3 font-display font-medium text-right">Starting</th>
              </tr>
            </thead>
            <tbody>
              {overview.map((row, i) => (
                <tr key={row.service} className={i % 2 === 0 ? 'bg-midnight-900/30' : ''}>
                  <td className="px-4 py-3 text-silver-200">
                    <a href={`#${row.anchor}`} className="hover:text-flame-400 transition-colors">{row.service}</a>
                  </td>
                  <td className="px-4 py-3 text-silver-500 hidden sm:table-cell">{row.format}</td>
                  <td className="px-4 py-3 text-flame-400 font-medium text-right">{row.starting}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ServiceSection
        id="website"
        kicker="Websites"
        title="Website Development"
        blurb="Modern, mobile-first websites built for performance and conversion. ANF Consulting designs and develops websites that match your brand, load fast, rank well, and turn visitors into leads."
      >
        <div className="grid md:grid-cols-3 gap-4">
          {websiteTiers.map((t) => (
            <div key={t.name} className="border border-white/[0.07] rounded-2xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30 flex flex-col">
              <h4 className="font-display text-xl text-silver-100 mb-1">{t.name}</h4>
              <p className="text-2xl font-display text-flame-400 mb-3">{t.price}</p>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">Ideal for</p>
              <p className="text-sm text-silver-300 mb-4">{t.idealFor}</p>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">Scope</p>
              <p className="text-sm text-silver-400 leading-relaxed">{t.scope}</p>
            </div>
          ))}
        </div>
        <FinePrint>
          All projects include kickoff consultation, two rounds of design revisions, content review, and launch support. Hosting and domain are billed separately at provider cost. Ongoing maintenance retainers are available after launch.
        </FinePrint>
      </ServiceSection>

      <ServiceSection
        id="platform"
        kicker="Complete platform"
        title="Done-for-you platforms"
        blurb="Most businesses do not want to buy pieces. These are complete platforms: a website, a CRM, and the tools to run them, built as one system that is yours. Each is a starting point we tailor to you."
      >
        <div className="grid md:grid-cols-3 gap-4">
          {platformTiers.map((t) => (
            <div key={t.name} className="border border-white/[0.07] rounded-2xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30 flex flex-col">
              <h4 className="font-display text-xl text-silver-100 mb-1">{t.name}</h4>
              <p className="text-2xl font-display text-flame-400 mb-3">{t.price}</p>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">Best for</p>
              <p className="text-sm text-silver-300 mb-4">{t.idealFor}</p>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">What is included</p>
              <p className="text-sm text-silver-400 leading-relaxed">{t.scope}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <BookCallButton />
        </div>
        <FinePrint>
          Each platform is a starting point, tailored to your business. Prices shown are typical build fees; final scope and price are set together. Hosting, support, and ongoing iteration are billed monthly after launch.
        </FinePrint>
      </ServiceSection>

      <ServiceSection
        id="proof-of-work"
        kicker="Marketing"
        title="Proof-of-Work Marketing System"
        blurb="Turn the work you already do into your best marketing. Every completed job becomes proof: photos, a customer review, and local search pages that bring in the next customer. Built for home services and trades businesses that win on trust and reputation."
      >
        <div className="border border-flame-500/40 rounded-2xl p-8 bg-midnight-900/60 shadow-flame-glow">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6">
            <h4 className="font-display text-2xl text-silver-100">Proof-of-Work Marketing System</h4>
            <p className="text-right">
              <span className="block text-3xl font-display text-flame-400">$4,000 build</span>
              <span className="block text-sm text-silver-400 mt-1">then $250/mo</span>
            </p>
          </div>
          <p className="text-xs uppercase tracking-wider text-silver-500 mb-3">Included</p>
          <ul className="space-y-2 mb-6">
            {proofOfWorkIncluded.map((item) => (
              <li key={item} className="flex items-start gap-3 text-silver-300">
                <span className="text-flame-500 mt-1">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-midnight-700/40">
            <div>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">Best for</p>
              <p className="text-sm text-silver-300 leading-relaxed">
                Home services and trades (HVAC, plumbing, electrical, roofing, landscaping, cleaning) and any local business that earns work by proving it has done the job well nearby.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">Why this exists</p>
              <p className="text-sm text-silver-300 leading-relaxed">
                Most service businesses do great work that no one ever sees. This captures every completed job and turns it into proof that ranks on search, builds trust, and books the next customer. The work is already happening. This puts it to work for you.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <BookCallButton />
        </div>
        <FinePrint>
          Build covers setup, branding, and integration with your existing site. The monthly covers hosting, new proof content, and review management. Final scope and price are set together. Your photos, reviews, and pages remain yours.
        </FinePrint>
      </ServiceSection>

      <ServiceSection
        id="coaching"
        kicker="Coaching"
        title="AI Coaching & Integration"
        blurb="Practical AI training for business owners and teams. Whether you’re trying to understand what AI can actually do for your business, or you’re ready to embed it into your daily workflows, ANF Consulting provides hands-on coaching that translates AI capability into real productivity."
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {coachingPackages.map((p) => (
            <div key={p.name} className="border border-white/[0.07] rounded-2xl p-5 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30 flex flex-col">
              <h4 className="font-display text-lg text-silver-100 mb-1">{p.name}</h4>
              <p className="text-2xl font-display text-flame-400 mb-3">{p.price}</p>
              <p className="text-sm text-silver-400 leading-relaxed mb-3 flex-1">{p.includes}</p>
              <p className="text-xs text-silver-500 mt-auto pt-3 border-t border-midnight-700/40">Effective rate: {p.rate}</p>
            </div>
          ))}
        </div>
        <FinePrint>
          Sessions delivered virtually via Zoom unless in-person is requested. All coaching includes session recordings, summary notes, and homework or implementation tasks where applicable.
        </FinePrint>
      </ServiceSection>

      <ServiceSection
        id="strategy"
        kicker="Strategy"
        title="AI Strategy"
        blurb="Before you spend on tools, understand the landscape. AI Strategy engagements help business owners see what AI can specifically do for their business, with a clear roadmap, not a sales pitch."
      >
        <div className="grid md:grid-cols-2 gap-4">
          {strategyOfferings.map((o) => (
            <div key={o.name} className="border border-white/[0.07] rounded-2xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30 flex flex-col">
              <h4 className="font-display text-xl text-silver-100 mb-1">{o.name}</h4>
              <p className="text-2xl font-display text-flame-400 mb-3">{o.price}</p>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">What’s included</p>
              <p className="text-sm text-silver-300 mb-4">{o.includes}</p>
              <p className="text-xs uppercase tracking-wider text-silver-500 mb-2">Best for</p>
              <p className="text-sm text-silver-400 leading-relaxed">{o.bestFor}</p>
            </div>
          ))}
        </div>
        <FinePrint>
          Most clients begin with the AI Possibilities Session to clarify direction, then engage in Coaching or Implementation work based on what surfaces. The AI Roadmap is recommended when a business is committed to deploying AI and needs a structured plan to do so.
        </FinePrint>
      </ServiceSection>

      <ServiceSection
        id="implementation"
        kicker="Implementation"
        title="AI Implementation"
        blurb="Productized AI deliverables. Each package below is a complete, set-it-and-forget-it build. You know exactly what you’re getting, exactly what it costs, and exactly when it ships."
      >
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {implementationPackages.map((p) => (
            <div key={p.name} className="border border-white/[0.07] rounded-2xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30 flex flex-col">
              <h4 className="font-display text-xl text-silver-100 mb-1">{p.name}</h4>
              <p className="text-2xl font-display text-flame-400 mb-3">{p.price}</p>
              <p className="text-sm text-silver-300 leading-relaxed mb-3 flex-1">{p.body}</p>
              <p className="text-xs text-flame-400/80 mt-auto pt-3 border-t border-midnight-700/40">{p.timeline}</p>
            </div>
          ))}
        </div>
        <SubBlock title="Implementation add-ons">
          <div className="grid sm:grid-cols-2 gap-3">
            {implementationAddons.map((a) => (
              <div key={a.addon} className="border border-midnight-700/40 rounded-md p-4 bg-midnight-900/30">
                <div className="flex justify-between items-baseline gap-3 mb-2">
                  <span className="text-silver-100 font-medium">{a.addon}</span>
                  <span className="text-flame-400 text-sm whitespace-nowrap">{a.price}</span>
                </div>
                <p className="text-xs text-silver-500 leading-relaxed">{a.includes}</p>
              </div>
            ))}
          </div>
        </SubBlock>
      </ServiceSection>

      <ServiceSection
        id="education"
        kicker="Education"
        title="Education & Workshops"
        blurb="ANF Consulting delivers continuing education and corporate training built on real-world AI experience. Andrew Fowler is a certified Ohio Real Estate Continuing Education provider and an active practitioner. Every session reflects how AI is actually being used today, not theoretical frameworks."
      >
        <SubBlock title={<>Ohio Real Estate CE: <em className="text-silver-300 not-italic font-normal">Getting Real With AI</em></>}>
          <p className="text-sm text-silver-400 leading-relaxed mb-4">
            A 3-hour approved Ohio Real Estate CE course covering practical AI applications for residential and commercial agents. Available as open enrollment sessions or as a private booking for brokerages.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {ceChannels.map((c) => (
              <div key={c.channel} className="border border-white/[0.07] rounded-2xl p-5 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30 flex flex-col">
                <div className="flex justify-between items-baseline mb-2">
                  <h5 className="font-display text-silver-100">{c.channel}</h5>
                  <span className="text-flame-400 font-medium">{c.price}</span>
                </div>
                <p className="text-sm text-silver-400 leading-relaxed">{c.format}</p>
              </div>
            ))}
          </div>
        </SubBlock>

        <SubBlock title="Corporate Workshops (Non-CE)">
          <p className="text-sm text-silver-400 leading-relaxed mb-4">
            Tailored AI and business training for non-real-estate audiences. Workshops are customized to your team, industry, and use cases. All formats available virtually; in-person available within Northeast Ohio.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {corporateFormats.map((f) => (
              <div key={f.format} className="border border-white/[0.07] rounded-2xl p-5 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30 flex flex-col">
                <h5 className="font-display text-silver-100 mb-1">{f.format}</h5>
                <p className="text-xl font-display text-flame-400 mb-3">{f.price}</p>
                <p className="text-sm text-silver-400 leading-relaxed">{f.includes}</p>
              </div>
            ))}
          </div>
        </SubBlock>
      </ServiceSection>

      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">How to engage</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">The process</h2>
          <p className="mt-4 text-silver-400 max-w-2xl mx-auto">
            Engaging ANF Consulting is straightforward. Most engagements begin with a no-obligation discovery call to understand fit, scope, and goals.
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {processSteps.map((s) => (
            <div key={s.step} className="border border-white/[0.07] rounded-2xl p-6 bg-gradient-to-b from-white/[0.05] to-white/[0.01] transition-colors hover:border-flame-500/30">
              <p className="font-display text-3xl text-flame-500 mb-3">{s.step}</p>
              <h4 className="font-display text-silver-100 mb-2">{s.title}</h4>
              <p className="text-sm text-silver-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Payment terms</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Clear, predictable, transparent</h2>
        </div>
        <ul className="space-y-3 text-silver-300">
          {paymentTerms.map((term) => (
            <li key={term} className="flex items-start gap-3">
              <span className="text-flame-500 mt-1">·</span>
              <span>{term}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">FAQ</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Common questions</h2>
        </div>
        <div className="border-t border-midnight-700/40">
          {faqs.map((item) => (
            <details key={item.q} className="group border-b border-midnight-700/40 py-5">
              <summary className="flex justify-between items-start cursor-pointer list-none gap-4 marker:hidden [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-lg text-silver-100 group-hover:text-flame-400 transition-colors">
                  {item.q}
                </h3>
                <span
                  aria-hidden
                  className="text-flame-500 text-2xl leading-none flex-shrink-0 transition-transform group-open:rotate-45 mt-1"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-silver-400 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 text-sm text-silver-500 text-center">
          Still wondering? The discovery call is the fastest way to a real answer.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-display text-silver-100 mb-4">Ready to start?</h2>
        <p className="text-lg text-silver-400 mb-8 max-w-2xl mx-auto">
          A 30-minute discovery call. No pitch, no pressure. We&rsquo;ll talk through what you&rsquo;re trying to do and whether ANF is the right fit.
        </p>
        <BookCallButton size="lg" />
        <p className="mt-10 text-xs text-silver-500">Pricing effective May 2026 · Subject to change.</p>
      </section>
    </>
  )
}

interface ServiceSectionProps {
  id: string
  kicker: string
  title: string
  blurb: string
  children: React.ReactNode
}

function ServiceSection({ id, kicker, title, blurb, children }: ServiceSectionProps) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-6 py-16 md:py-20 scroll-mt-20">
      <div className="mb-8 md:mb-10 max-w-3xl">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">{kicker}</p>
        <h2 className="text-3xl md:text-4xl font-display text-silver-100 mb-4 leading-tight">{title}</h2>
        <p className="text-silver-400 leading-relaxed">{blurb}</p>
      </div>
      {children}
    </section>
  )
}

function SubBlock({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <h3 className="text-sm uppercase tracking-[0.2em] text-silver-300 font-display mb-4">{title}</h3>
      {children}
    </div>
  )
}

function FinePrint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 text-xs text-silver-500 italic leading-relaxed max-w-3xl">
      {children}
    </p>
  )
}
