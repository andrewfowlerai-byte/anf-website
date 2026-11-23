import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listShowcaseProjects } from '../../lib/showcase'
import { Reveal } from '../Reveal'

/**
 * The four kinds of work, as a mosaic of unlike tiles (2026-11-23 redesign). No two neighbours hold the same kind of
 * thing: a heading, a list, one live figure, sentences, two real builds. It replaces five
 * sections of identical cards that all said some version of this.
 *
 * The figure is counted from the CRM's published builds, never typed in. Prices are CRM-managed too, so none is
 * written here.
 */

const KINDS = [
  { name: 'Marketing', line: 'content and campaigns that compound' },
  { name: 'Infrastructure', line: 'websites and CRMs that run the business' },
  { name: 'AI', line: 'practical tools woven into your work' },
  { name: 'Education', line: 'workshops and Ohio real estate CE' },
]

export function WorkMosaic() {
  const [count, setCount] = useState<number | null>(null)
  useEffect(() => {
    let on = true
    listShowcaseProjects().then((rows) => { if (on && rows.length) setCount(rows.length) }).catch(() => undefined)
    return () => { on = false }
  }, [])

  return (
    <section className="ch ch-midnight" aria-labelledby="kinds-title">
      <div className="mosaic">
        <Reveal kind="wipe" className="tile tile-pic tile-6x5">
          <img src="/showcase/kiki-christakos.png" alt="A realtor personal operating system ANF built, shown with sample data" width={2560} height={1600} loading="lazy" decoding="async" style={{ objectPosition: 'top left' }} />
        </Reveal>

        <Reveal className="tile tile-ink tile-6x3">
          <h2 id="kinds-title" className="t-head">Four kinds of work</h2>
        </Reveal>

        <Reveal delay={70} className="tile tile-flame tile-3x2 tile-half">
          <Link to="/services" className="link t-body">See the full service menu</Link>
        </Reveal>

        <Reveal delay={140} className="tile tile-deep tile-3x2 tile-half">
          <p className="t-body" style={{ fontWeight: 600 }}>Clarity. Integration. Automation.</p>
        </Reveal>

        <Reveal className="tile tile-paper tile-6x3">
          <ul className="t-lead" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.45rem' }}>
            {KINDS.map((k) => (
              <li key={k.name}><strong style={{ fontWeight: 800 }}>{k.name}:</strong> {k.line}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={70} className="tile tile-flame tile-3x3 tile-half">
          <Link to="/work" style={{ display: 'block', height: '100%' }} aria-label={count ? `${count} builds you can open and click through` : 'Builds you can open and click through'}>
            <p className="tile-figure" style={{ margin: 0, visibility: count ? 'visible' : 'hidden' }}>{count ?? 0}</p>
            <p className="t-body" style={{ marginTop: '0.75rem', fontWeight: 600 }}>builds you can open and click through</p>
          </Link>
        </Reveal>

        <Reveal delay={140} className="tile tile-deep tile-3x3 tile-half">
          <p className="t-lead">Small on purpose: a short client list and long engagements.</p>
        </Reveal>

        <Reveal className="tile tile-mist tile-6x3">
          <p className="t-lead" style={{ maxWidth: '26ch' }}>Built around how you already work, not a template you bend to fit.</p>
        </Reveal>

        <Reveal kind="wipe" delay={70} className="tile tile-pic tile-6x3">
          <img src="/showcase/coachflow.png" alt="CoachFlow, a CRM ANF built for coaches, shown with sample data" width={1600} height={1000} loading="lazy" decoding="async" style={{ objectPosition: 'top left' }} />
        </Reveal>
      </div>
    </section>
  )
}
