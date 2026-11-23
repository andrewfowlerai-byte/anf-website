import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { currentImage, listShowcaseProjects, type ShowcaseProject } from '../lib/showcase'


type Project = {
  name: string
  category: string
  /** 'demo' is one of the six interactive CRMs hosted on this site, which a
   *  visitor can click through immediately. 'build' is a real project living at
   *  its own URL. They are different promises and should not look identical. */
  kind?: 'demo' | 'build'
  summary: string
  tags: string[]
  link?: string
  linkLabel?: string
  image?: string
  domain?: string
  accessCode?: string
  accessNote?: string
}

// Fallback, shown only if the CRM-managed list is empty or unreachable, so the
// page is never blank. The live list is managed from the CRM (Showcase).
const FALLBACK: Project[] = [
  {
    name: 'A daily AI product, shipped',
    category: 'Product & SaaS',
    summary:
      'Everlee: fresh AI content and streaks that bring people back every day. Our own product, designed and built end to end and shipped to web and mobile. Proof we build real software, not slide decks.',
    tags: ['Product', 'SaaS', 'AI'],
    link: 'https://useeverlee.com',
    linkLabel: 'Visit Everlee',
    domain: 'useeverlee.com',
  },
  {
    name: 'A client portal and CRM platform',
    category: 'Web App & Infrastructure',
    summary:
      'A full portal and internal CRM that runs engagements from first hello to monthly delivery: contracts and e-signing, invoicing, a shared content calendar, and an AI assistant, all in one place.',
    tags: ['Web App', 'Infrastructure', 'AI'],
    link: 'https://crm.anfconsult.com/portal',
    linkLabel: 'See the portal',
    domain: 'crm.anfconsult.com',
  },
]

/**
 * The interactive demos that used to live on their own /demos page.
 *
 * Splitting them from Work was the single biggest reason it was hard to tell
 * which page mattered: a visitor faced two menu items covering the same idea
 * with no way to know which held the thing they wanted. They are one list now,
 * and the only real distinction, whether you can click through it here or it
 * opens somewhere else, is carried on the card instead of in the navigation.
 */
const DEMOS: Project[] = [
  {
    name: 'Real estate agents',
    category: 'Interactive demo',
    summary: 'A CRM shaped around how an agent actually works: lead pipeline, speed to lead, listings through to closing. Click straight in.',
    tags: ['Real Estate', 'CRM', 'Interactive'],
    link: '/demos/real-estate', linkLabel: 'Open the demo', kind: 'demo',
    image: '/showcase/demo-real-estate.jpg',
  },
  {
    name: 'Home and service pros',
    category: 'Interactive demo',
    summary: 'For trades, cleaners and landscapers. Jobs and quotes, scheduling, invoices and reviews, in the order a working day happens.',
    tags: ['Home Services', 'CRM', 'Interactive'],
    link: '/demos/home-services', linkLabel: 'Open the demo', kind: 'demo',
    image: '/showcase/demo-home-services.jpg',
  },
  {
    name: 'Coaches and consultants',
    category: 'Interactive demo',
    summary: 'Built for one to one and group programs. Client roster, session notes, packages and payments.',
    tags: ['Coaching', 'CRM', 'Interactive'],
    link: '/demos/coaches', linkLabel: 'Open the demo', kind: 'demo',
    image: '/showcase/demo-coaches.jpg',
  },
  {
    name: 'Fitness and wellness',
    category: 'Interactive demo',
    summary: 'Trainers, studios and clinics. Members, classes and the retention problem that decides whether a studio survives.',
    tags: ['Wellness', 'CRM', 'Interactive'],
    link: '/demos/fitness', linkLabel: 'Open the demo', kind: 'demo',
    image: '/showcase/demo-fitness.jpg',
  },
  {
    name: 'Parents and family',
    category: 'Interactive demo',
    summary: 'A family HQ rather than a CRM. Kids\u2019 schedules, meals and errands, appointments, all in one place.',
    tags: ['Family', 'Interactive'],
    link: '/demos/family', linkLabel: 'Open the demo', kind: 'demo',
    image: '/showcase/demo-family.jpg',
  },
  {
    name: 'Creators and solopreneurs',
    category: 'Interactive demo',
    summary: 'When content is the business. Brand deals, a content calendar, and posting that does not depend on remembering.',
    tags: ['Creator', 'Interactive'],
    link: '/demos/creators', linkLabel: 'Open the demo', kind: 'demo',
    image: '/showcase/demo-creators.jpg',
  },
]

/**
 * Filters, matched loosely against category and tags.
 *
 * Loose matching is deliberate. The categories are written by hand in the CRM
 * and are almost all unique ("Realtor CRM", "Realtor Website + CRM", "Office
 * Ops"), so filtering on them exactly would give eighteen filters for eighteen
 * projects, which is not a filter. Industry is what a visitor self-identifies
 * by, so that is the axis.
 */
const FILTERS: { key: string; label: string; match?: RegExp }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'demo', label: 'Try one now', match: /interactive/i },
  { key: 'realestate', label: 'Real estate', match: /realtor|real estate|brokerage|office ops/i },
  { key: 'service', label: 'Service business', match: /home services|field service|hospitality|coaching|trades/i },
  { key: 'wellness', label: 'Wellness and retail', match: /wellness|health|retail|fitness/i },
  { key: 'software', label: 'Products and platforms', match: /product|saas|dashboard|web app|platform|family/i },
]

function matchesFilter(p: Project, key: string): boolean {
  if (key === 'all') return true
  const f = FILTERS.find((x) => x.key === key)
  if (!f?.match) return true
  return f.match.test(`${p.category} ${p.tags.join(' ')}`)
}

function domainOf(link?: string): string | undefined {
  if (!link || link.startsWith('/')) return undefined
  try { return new URL(link).host } catch { return undefined }
}

function toProject(p: ShowcaseProject): Project {
  return {
    name: p.title,
    category: p.category ?? '',
    summary: p.blurb ?? '',
    tags: p.tags ?? [],
    link: p.live_url ?? undefined,
    linkLabel: p.link_label ?? undefined,
    image: currentImage(p) ?? undefined,
    domain: domainOf(p.live_url ?? undefined),
    accessCode: p.access_code ?? undefined,
    accessNote: p.access_note ?? undefined,
    kind: 'build',
  }
}

/**
 * One build: its real screen, large, and what it is. Redesigned 2026-11-23 (DESIGN.md). The old row put each
 * screenshot in a drawn browser window that tilted under the cursor, under a number, a badge and two labels. Now the
 * picture is the picture, the name is the heading, and the rest is two plain sentences and one link.
 */
function BuildRow({ p, flip }: { p: Project; flip: boolean }) {
  const isLive = !!p.link && !p.link.startsWith('/')
  const [copied, setCopied] = useState(false)
  const copyCode = () => {
    if (!p.accessCode) return
    navigator.clipboard?.writeText(p.accessCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => {})
  }
  const picture = p.image ? (
    <img className="wk-shot" src={p.image} alt={`${p.name}, as it runs today`} width={1600} height={1000} loading="lazy" decoding="async" />
  ) : (
    <div className="wk-shot wk-plain"><p className="t-head">{p.name}</p></div>
  )
  const filed = [p.category, ...p.tags].filter(Boolean).join(', ')
  return (
    <article className={`wk-row ${flip ? 'is-flipped' : ''}`}>
      <div className="wk-media">
        {p.link ? (
          isLive
            ? <a href={p.link} target="_blank" rel="noreferrer" aria-label={`Open ${p.name}`}>{picture}</a>
            : <Link to={p.link} aria-label={`Open ${p.name}`}>{picture}</Link>
        ) : picture}
      </div>
      <div className="wk-words">
        <h2 className="wk-name">{p.name}</h2>
        {p.summary && <p className="mt-4">{p.summary}</p>}
        {filed && <p className="mt-3 text-midnight-500">{filed}</p>}
        {p.accessCode ? (
          <p className="mt-5 flex flex-wrap items-center gap-3" data-ui>
            <span className="font-semibold">Password to explore</span>
            <button type="button" className="chip tabular-nums" onClick={copyCode} title="Copy the demo password">
              {p.accessCode} <span className="font-normal">({copied ? 'copied' : 'copy'})</span>
            </button>
          </p>
        ) : p.accessNote ? (
          <p className="mt-5 text-midnight-500">{p.accessNote}</p>
        ) : null}
        {p.link && (
          <p className="mt-6">
            {isLive
              ? <a className="link" href={p.link} target="_blank" rel="noreferrer">{p.linkLabel ?? 'See it live'}{p.domain ? ` at ${p.domain.replace(/^www\./, '')}` : ''}</a>
              : <Link className="link" to={p.link}>{p.linkLabel ?? 'View project'}</Link>}
          </p>
        )}
      </div>
    </article>
  )
}

export function Work() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK)
  // The filter lives in the URL so a filtered view can be sent to someone, and
  // so going into a demo and coming back does not lose it.
  const [params, setParams] = useSearchParams()
  const active = params.get('show') ?? 'all'

  useEffect(() => {
    let cancelled = false
    listShowcaseProjects()
      .then((rows) => { if (!cancelled && rows.length) setProjects(rows.map(toProject)) })
      .catch(() => { /* keep fallback */ })
    return () => { cancelled = true }
  }, [])

  // Demos first: they are the only things a visitor can open without leaving,
  // so they are the lowest-friction way into the work.
  const all = useMemo(() => [...DEMOS, ...projects], [projects])
  const shown = useMemo(() => all.filter((p) => matchesFilter(p, active)), [all, active])

  // Only offer a filter that would actually return something.
  const available = useMemo(
    () => FILTERS.filter((f) => f.key === 'all' || all.some((p) => matchesFilter(p, f.key))),
    [all],
  )

  const setFilter = (key: string) => {
    const next = new URLSearchParams(params)
    if (key === 'all') next.delete('show')
    else next.set('show', key)
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHero
        title="Things we’ve built."
        subtitle="Every one was built around a specific business, not pulled from a template. Open any of them and a short guided tour points out what matters, inside the real thing, with sample data you can click through. Narrow it to your world, or scroll the lot."
      />

      <nav className="wk-filters" aria-label="Filter the work">
        {available.map((f) => (
          <button key={f.key} type="button" onClick={() => setFilter(f.key)} className="chip" aria-pressed={active === f.key}>
            {f.label}
          </button>
        ))}
      </nav>

      <section className="wk-list" aria-label="Builds">
        {shown.length === 0 ? (
          <p className="px-[var(--edge)] py-16 t-lead">
            Nothing in that category yet. <button type="button" className="link" onClick={() => setFilter('all')}>Show everything</button>
          </p>
        ) : (
          shown.map((p, i) => <BuildRow key={p.name} p={p} flip={i % 2 === 1} />)
        )}
      </section>

      <section className="ch ch-flame lean-top" style={{ minHeight: 0 }}>
        <h2 className="t-head" style={{ maxWidth: '22ch' }}>Have something you’d like built or grown?</h2>
        <p className="t-lead mt-6 mb-8 max-w-2xl">
          Whether it is a website, a custom CRM, an AI workflow, or a system to tie it all
          together, the right first step is a short conversation. No pitch, no pressure.
        </p>
        <Link to="/book" className="btn btn-ink">Send a request</Link>
      </section>
    </>
  )
}
