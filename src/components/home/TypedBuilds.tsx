import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentImage, listShowcaseProjects } from '../../lib/showcase'
import { SITE_DEMOS } from '../../lib/demos'
import { hostOf, isOnSite, rankBuilds, type Build } from '../../lib/matchBuild'
import { Reveal } from '../Reveal'

/**
 * The headline you can type (2026-11-23 redesign). The section's headline is a real field: a visitor types their own
 * kind of business and the page answers with the build ANF made for one like it, from the published showcase in the
 * CRM. This is the page's one live thing, and its proof: nothing shown here is a mock-up.
 *
 * Under the answer sit the other builds that fit the same words (press one to see it instead), and a row of trades
 * to try, each of which lands on a different build (Andrew, 2026-11-23: "more variety and examples in this area").
 *
 * Until the CRM answers (or if it does not), the builds that ship with the site stand in, so the first paint is
 * never empty. Their words match the CRM's.
 */

/**
 * What "real estate brokerage" answers with (Andrew, 2026-11-23: "it should be the build that is at
 * anfconsult.com/brokerage, not the first North Ridgeville build"). The whole-brokerage system is not a row in the
 * CRM's showcase, so it ships with the site and leads the list. The office toolkit at brokerage.anfconsult.com is
 * still a CRM row and still on /work.
 */
const BROKERAGE: Build = {
  title: 'Brokerage System',
  category: 'Brokerage System',
  tags: ['Real Estate', 'Brokerage', 'Office', 'Recruiting', 'Commissions', 'Compliance'],
  image_url: '/showcase/brokerage-system.jpg',
  live_url: 'https://anfconsult.com/brokerage',
  blurb: 'One system for a whole brokerage, built as a sample: a desk for everyone from the broker-owner to a new agent, commission plans and the trust ledger, lead routing, compliance and recruiting. Walk one deal from a website request to the agent’s payout.',
}

/** The six demos that open inside this site. They come last, so a real build at its own address wins a tie. */
const DEMOS: Build[] = SITE_DEMOS.map((d) => ({ title: d.name, category: 'Interactive demo', tags: d.tags, image_url: d.image, live_url: d.link, blurb: d.summary }))

const SEED: Build[] = [
  BROKERAGE,
  { title: 'Strive Field-Service Platform', category: 'Field Service', tags: ['Web App', 'Home Services', 'Infrastructure'], image_url: '/showcase/strive.png', live_url: 'https://field-service.anfconsult.com', blurb: 'A three-in-one field-service platform: a homeowner app, a technician field app, and an admin console, replacing four disconnected tools.' },
  { title: 'Realtor Personal OS', category: 'AI Dashboard', tags: ['AI', 'Dashboard', 'Real Estate'], image_url: '/showcase/kiki-christakos.png', live_url: 'https://realtor-os.anfconsult.com', blurb: 'A realtor personal operating system: an AI chief-of-staff with a command-center dashboard that ties the whole business together.' },
  { title: 'CoachFlow', category: 'Coaching CRM', tags: ['CRM', 'Coaching', 'Sample'], image_url: '/showcase/coachflow.png', live_url: 'https://coaching.anfconsult.com', blurb: 'A CRM built for coaches and consultants: client roster, session notes, packages, and payments, all in one calm place.' },
  { title: "A family's whole life, in one app", category: 'Family Operating System', tags: ['Family', 'Web App', 'AI', 'Mobile'], image_url: '/showcase/home-base.png', live_url: 'https://aubreeseverything.com', blurb: 'A shared calendar, meal planning that turns into a grocery list, every kid’s details and appointments, chores and travel, in one place.' },
  ...DEMOS,
]

// Andrew, 2026-11-23: lead with the brokerage build (BROKERAGE above), not the solo agent's CRM.
const FIRST = 'real estate brokerage'
// Trades to try. Each lands on a different build; the first brings a visitor back to where the section starts.
const TRY = [FIRST, 'real estate agent', 'HVAC company', 'coach', 'gym', 'family of five', 'content creator', 'events', 'bar']
// How many other builds to name under the answer.
const ALSO = 3

export function TypedBuilds() {
  const [typed, setTyped] = useState(FIRST)
  const [builds, setBuilds] = useState<Build[]>(SEED)
  // How many things /work lists (the CRM's published rows and the demos), for the link under the chips.
  const [listed, setListed] = useState(0)
  // A build picked from "also built" for what is typed now. Typing something else lets go of it.
  const [pick, setPick] = useState<{ for: string; title: string } | null>(null)

  useEffect(() => {
    let on = true
    listShowcaseProjects()
      .then((rows) => {
        if (!on || !rows.length) return
        const fromCrm = rows.map((r) => ({ title: r.title, category: r.category, blurb: r.blurb, live_url: r.live_url, tags: r.tags ?? [], image_url: currentImage(r) }))
        // The site's own brokerage build leads; a CRM row at the same address would be the same build twice.
        setBuilds([BROKERAGE, ...fromCrm.filter((b) => hostOf(b.live_url) !== hostOf(BROKERAGE.live_url)), ...DEMOS])
        setListed(rows.length + DEMOS.length)
      })
      .catch(() => { /* the builds that ship with the site stay */ })
    return () => { on = false }
  }, [])

  const ranked = useMemo(() => rankBuilds(typed, builds), [typed, builds])
  const picked = pick && pick.for === typed ? ranked.find((b) => b.title === pick.title) : undefined
  const hit = picked ?? ranked[0] ?? null
  const also = ranked.filter((b) => b !== hit).slice(0, ALSO)
  const empty = typed.trim().length < 2

  return (
    <section className="ch ch-paper" aria-labelledby="builds-title">
      <h2 id="builds-title" className="sr-only">See what we built for a business like yours</h2>

      <Reveal>
        <p className="t-lead" style={{ maxWidth: '34ch' }}>Type your kind of business. This is what we built for one like it.</p>
      </Reveal>

      <Reveal delay={80}>
        <div className="typed" data-ui style={{ marginTop: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
          <label htmlFor="trade" className="sr-only">Your kind of business</label>
          <input
            id="trade"
            className="typed-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Your business"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="search"
            maxLength={40}
          />
          <span className="typed-mirror" aria-hidden="true">{typed}<i /></span>
        </div>
      </Reveal>

      <div className="ch-grid" style={{ marginTop: 'clamp(2rem, 4vw, 3rem)', rowGap: '2rem' }} aria-live="polite">
        <div className="col-span-12 lg:col-span-5 min-w-0">
          {hit ? (
            <Reveal key={hit.title} delay={60}>
              <h3 className="t-head" style={{ textWrap: 'balance' }}>{hit.title}</h3>
              {hit.blurb && <p className="t-body" style={{ marginTop: '1.25rem', maxWidth: '46ch' }}>{hit.blurb}</p>}
              {hit.live_url && (
                <p className="t-body" style={{ marginTop: '1.5rem' }}>
                  {isOnSite(hit.live_url)
                    ? <Link className="link" to={hit.live_url}>Click through the demo</Link>
                    : <a className="link" href={hit.live_url} target="_blank" rel="noreferrer">Open it at {hostOf(hit.live_url)}</a>}
                </p>
              )}
              {also.length > 0 && (
                <p className="t-body typed-also" style={{ marginTop: '1.5rem', maxWidth: '46ch' }}>
                  Also built for this:{' '}
                  {also.map((b, i) => (
                    <span key={b.title}>
                      <button type="button" className="link typed-also-pick" onClick={() => setPick({ for: typed, title: b.title })}>{b.title}</button>
                      {i < also.length - 1 ? ', ' : '.'}
                    </span>
                  ))}
                </p>
              )}
            </Reveal>
          ) : (
            <Reveal key={empty ? 'empty' : 'none'} delay={60}>
              <h3 className="t-head">{empty ? 'Start typing.' : 'Not one of those yet.'}</h3>
              <p className="t-body" style={{ marginTop: '1.25rem', maxWidth: '46ch' }}>
                {empty
                  ? 'A trade, a role, a kind of shop. Or pick one below.'
                  : 'Yours would be the first of its kind here, which is how most of these began. Tell Andrew what you need and he will say what it would take.'}
              </p>
              {!empty && <p style={{ marginTop: '1.5rem' }}><Link to="/book" className="btn">Send a request</Link></p>}
            </Reveal>
          )}

          <div style={{ marginTop: '2.5rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {TRY.map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={typed.trim().toLowerCase() === t.toLowerCase()} onClick={() => setTyped(t)}>{t}</button>
            ))}
          </div>
          <p className="t-body" style={{ marginTop: '1.5rem' }}>
            <Link to="/work" className="link">{listed ? `See all ${listed} builds and demos` : 'See every build'}</Link>
          </p>
        </div>

        <div className="col-span-12 lg:col-span-7 min-w-0">
          {hit?.image_url ? (
            <Reveal key={hit.image_url} kind="wipe">
              <img className="typed-shot" src={hit.image_url} alt={`${hit.title}, as it runs today`} width={1600} height={1000} decoding="async" style={{ aspectRatio: '16 / 10', objectFit: 'cover', objectPosition: 'top left' }} />
            </Reveal>
          ) : hit ? (
            <Reveal key={`${hit.title}-plain`} kind="wipe">
              <div className="typed-none"><p className="t-head">{hit.category ?? hit.title}</p></div>
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  )
}
