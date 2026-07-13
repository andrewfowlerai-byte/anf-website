import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { PageHero } from '../components/PageHero'
import { listShowcaseProjects, type ShowcaseProject } from '../lib/showcase'

type Project = {
  name: string
  category: string
  summary: string
  tags: string[]
  /** External site (full URL) or internal route (starts with "/"). Optional. */
  link?: string
  linkLabel?: string
  image?: string
}

// Fallback content, shown only if the CRM-managed list is empty or unreachable,
// so /work is never blank. The live list is managed from the CRM (Showcase).
const FALLBACK: Project[] = [
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
    name: 'Everlee',
    category: 'Product & SaaS',
    summary:
      'A daily AI product we designed and built end to end: fresh content and streaks that bring people back every day. Our own product, shipped to web and mobile, proof we build real software, not just slide decks.',
    tags: ['Product', 'SaaS', 'AI'],
    link: 'https://useeverlee.com',
    linkLabel: 'Visit Everlee',
  },
]

function toProject(p: ShowcaseProject): Project {
  return {
    name: p.title,
    category: p.category ?? '',
    summary: p.blurb ?? '',
    tags: p.tags ?? [],
    link: p.live_url ?? undefined,
    linkLabel: p.link_label ?? undefined,
    image: p.image_url ?? undefined,
  }
}

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
  const [projects, setProjects] = useState<Project[]>(FALLBACK)

  useEffect(() => {
    let cancelled = false
    listShowcaseProjects()
      .then((rows) => { if (!cancelled && rows.length) setProjects(rows.map(toProject)) })
      .catch(() => { /* keep the fallback */ })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Portfolio"
        title="Things we've built"
        subtitle="A look at projects we have designed, built, and run. Many are live with sample data, so you can click in and look around. From brands and websites to the systems and AI behind them, every one is built to be clear, delivered, and accountable."
      />

      <section className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-5">
          {projects.map((p) => (
            <article
              key={p.name}
              className="group relative flex flex-col rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.05] to-white/[0.01] overflow-hidden transition-colors hover:border-flame-500/40"
            >
              {p.image ? (
                <div className="aspect-[16/9] w-full overflow-hidden bg-midnight-950 border-b border-white/[0.06]">
                  <img src={p.image} alt="" loading="lazy" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
              ) : (
                <div className="h-1.5 w-full bg-gradient-to-r from-flame-600/50 via-flame-400 to-flame-500" />
              )}
              <div className="p-6 md:p-7 flex flex-col flex-1">
                {p.category && (
                  <p className="text-xs tracking-[0.25em] uppercase text-flame-500 mb-2">{p.category}</p>
                )}
                <h3 className="text-xl md:text-2xl font-display text-silver-100 mb-3">{p.name}</h3>
                {p.summary && <p className="text-silver-400 leading-relaxed mb-5">{p.summary}</p>}
                {p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-midnight-700/60 text-silver-400">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
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
          Whether it&rsquo;s a website, a custom CRM, an AI workflow, or a system to tie it all
          together, the right first step is a short conversation. No pitch, no pressure.
        </p>
        <BookCallButton />
      </section>
    </>
  )
}
