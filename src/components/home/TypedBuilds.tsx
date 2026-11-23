import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { currentImage, listShowcaseProjects } from '../../lib/showcase'
import { hostOf, matchBuild, type Build } from '../../lib/matchBuild'
import { Reveal } from '../Reveal'

/**
 * The headline you can type (2026-11-23 redesign). The section's headline is a real field: a visitor types their own
 * kind of business and the page answers with the build ANF made for one like it, from the published showcase in the
 * CRM. This is the page's one live thing, and its proof: nothing shown here is a mock-up.
 *
 * Until the CRM answers (or if it does not), four builds that ship with the site stand in, so the first paint is
 * never empty. Their words match the CRM's.
 */

const SEED: Build[] = [
  { title: 'Brokerage Office Toolkit', category: 'Office Ops', tags: ['CRM', 'Real Estate', 'Recruiting'], image_url: '/showcase/brokerage.jpg', live_url: 'https://brokerage.anfconsult.com', blurb: 'A brokerage office manager toolkit: a speed-to-lead engine plus an agent-recruiting CRM.' },
  { title: 'Strive Field-Service Platform', category: 'Field Service', tags: ['Web App', 'Home Services', 'Infrastructure'], image_url: '/showcase/strive.png', live_url: 'https://field-service.anfconsult.com', blurb: 'A three-in-one field-service platform: a homeowner app, a technician field app, and an admin console, replacing four disconnected tools.' },
  { title: 'Realtor Personal OS', category: 'AI Dashboard', tags: ['AI', 'Dashboard', 'Real Estate'], image_url: '/showcase/kiki-christakos.png', live_url: 'https://realtor-os.anfconsult.com', blurb: 'A realtor personal operating system: an AI chief-of-staff with a command-center dashboard that ties the whole business together.' },
  { title: 'CoachFlow', category: 'Coaching CRM', tags: ['CRM', 'Coaching', 'Sample'], image_url: '/showcase/coachflow.png', live_url: 'https://coaching.anfconsult.com', blurb: 'A CRM built for coaches and consultants: client roster, session notes, packages, and payments, all in one calm place.' },
  { title: "A family's whole life, in one app", category: 'Family Operating System', tags: ['Family', 'Web App', 'AI', 'Mobile'], image_url: '/showcase/home-base.png', live_url: 'https://aubreeseverything.com', blurb: 'A shared calendar, meal planning that turns into a grocery list, every kid’s details and appointments, chores and travel, in one place.' },
]

// Andrew, 2026-11-23: lead with the brokerage build, not the solo agent's CRM.
const FIRST = 'real estate brokerage'
const TRY = ['HVAC company', 'coach', 'family of five', 'bar']

export function TypedBuilds() {
  const [typed, setTyped] = useState(FIRST)
  const [builds, setBuilds] = useState<Build[]>(SEED)

  useEffect(() => {
    let on = true
    listShowcaseProjects()
      .then((rows) => { if (on && rows.length) setBuilds(rows.map((r) => ({ title: r.title, category: r.category, blurb: r.blurb, live_url: r.live_url, tags: r.tags ?? [], image_url: currentImage(r) }))) })
      .catch(() => { /* the builds that ship with the site stay */ })
    return () => { on = false }
  }, [])

  const hit = useMemo(() => matchBuild(typed, builds), [typed, builds])
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
                  <a className="link" href={hit.live_url} target="_blank" rel="noreferrer">Open it at {hostOf(hit.live_url)}</a>
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
              <button key={t} type="button" className="chip" aria-pressed={typed.trim().toLowerCase() === t} onClick={() => setTyped(t)}>{t}</button>
            ))}
          </div>
          <p className="t-body" style={{ marginTop: '1.5rem' }}>
            <Link to="/work" className="link">{builds.length > SEED.length ? `See all ${builds.length} builds` : 'See every build'}</Link>
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
