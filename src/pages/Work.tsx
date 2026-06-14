import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'

type Project = {
  name: string
  category: string
  summary: string
  tags: string[]
  /** External site (full URL) or internal route (starts with "/"). Optional. */
  link?: string
  linkLabel?: string
}

const projects: Project[] = [
  {
    name: 'ANF Consulting',
    category: 'Brand & Website',
    summary:
      'The brand, this website, and the booking flow behind it, designed and built end to end. A calm, clear identity and a site that tells the whole story: who we are, what we offer, and how to start.',
    tags: ['Brand', 'Website', 'Booking'],
    link: 'https://anfconsult.com',
    linkLabel: "You're on it",
  },
  {
    name: 'Client Portal & CRM Platform',
    category: 'Web App & Infrastructure',
    summary:
      'A full client portal and internal CRM we built to run engagements from first hello to monthly delivery. Contracts and e-signing, Stripe invoicing, a shared content calendar, document library, and an AI assistant, all in one place.',
    tags: ['Web App', 'Infrastructure', 'AI'],
    link: 'https://crm.anfconsult.com/portal',
    linkLabel: 'See the portal',
  },
  {
    name: 'Getting Real With AI',
    category: 'Education',
    summary:
      'A continuing-education course we created and teach for real estate professionals. How to actually talk to AI, which tools are worth your time, and how to stay visible as AI reshapes the way people search.',
    tags: ['Education', 'AI', 'Real Estate'],
    link: '/events',
    linkLabel: 'View upcoming dates',
  },
]

function ProjectLink({ link, label }: { link: string; label: string }) {
  const classes =
    'mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-flame-400 hover:text-flame-300 transition-colors'
  const arrow = (
    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
      &rarr;
    </span>
  )
  if (link.startsWith('/')) {
    return (
      <Link to={link} className={classes}>
        {label} {arrow}
      </Link>
    )
  }
  return (
    <a href={link} target="_blank" rel="noreferrer" className={classes}>
      {label} {arrow}
    </a>
  )
}

export function Work() {
  return (
    <>
      <section className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-10 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Portfolio</p>
        <h1 className="text-4xl md:text-6xl font-display text-silver-100 mb-6 leading-tight">
          Selected Work
        </h1>
        <p className="text-lg md:text-xl text-silver-400 leading-relaxed">
          A look at projects we&rsquo;ve designed, built, and run. From brands and websites to the
          systems and AI behind them, plus the education we deliver along the way. Every engagement
          is built to be clear, delivered, and accountable.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((p) => (
            <article
              key={p.name}
              className="group relative flex flex-col rounded-2xl border border-midnight-700/40 bg-midnight-900/40 overflow-hidden transition-colors hover:border-flame-500/40"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-flame-600/50 via-flame-400 to-flame-500" />
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <p className="text-xs tracking-[0.25em] uppercase text-flame-500 mb-2">
                  {p.category}
                </p>
                <h3 className="text-xl md:text-2xl font-display text-silver-100 mb-3">{p.name}</h3>
                <p className="text-silver-400 leading-relaxed mb-5">{p.summary}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full border border-midnight-700/60 text-silver-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {p.link && <ProjectLink link={p.link} label={p.linkLabel ?? 'View project'} />}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Your project next</p>
        <h2 className="text-3xl md:text-4xl font-display text-silver-100 mb-5 leading-tight">
          Have something you&rsquo;d like built or grown?
        </h2>
        <p className="text-lg text-silver-400 leading-relaxed mb-8">
          Whether it&rsquo;s a website, a social presence, an AI workflow, or a system to tie it all
          together, the right first step is a short conversation. No pitch, no pressure.
        </p>
        <BookCallButton />
      </section>
    </>
  )
}
