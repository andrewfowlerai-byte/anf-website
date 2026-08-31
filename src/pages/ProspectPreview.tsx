import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSeo } from '../lib/useSeo'

/**
 * The homepage mockup the outreach opener promises.
 *
 * Every scored prospect's opener says "I can put together a free homepage
 * mockup". For the 218 prospects sitting at "new" that was a promise with
 * nothing behind it. This renders one from data already in the CRM: their real
 * business name, their city, their actual Google rating and review count, and
 * services matched to their industry.
 *
 * Two rules this page must never break.
 *
 * It is a CONCEPT BY ANF, never a thing that could pass as the business's own
 * site. The banner at the top is not decoration and must not be removed or
 * softened: a page carrying a real company's name has to say plainly who made
 * it and that they did not.
 *
 * And it reads through a narrow SECURITY DEFINER function, never the prospects
 * table. A business opening its own mockup must not be able to see that it sits
 * on a prospecting list, how it was scored, or what the diagnosis of its
 * weaknesses says.
 */

interface Mockup {
  name: string
  address: string | null
  phone: string | null
  rating: number | null
  total_ratings: number | null
  types: string[] | null
  has_website: boolean
}

type Trade = 'plumbing' | 'hvac' | 'roofing' | 'electrical' | 'realestate' | 'general'

/** "5743 Chevrolet Blvd, Parma, OH 44130, USA" -> "Parma" */
function cityOf(address: string | null): string {
  if (!address) return 'Northeast Ohio'
  const parts = address.split(',').map((s) => s.trim())
  // Second-to-last useful part is the city on a US Google address.
  const city = parts.length >= 3 ? parts[parts.length - 3] : parts[0]
  return city && !/^\d/.test(city) ? city : 'Northeast Ohio'
}

function tradeOf(types: string[] | null, name: string): Trade {
  const hay = `${(types ?? []).join(' ')} ${name}`.toLowerCase()
  if (/plumb/.test(hay)) return 'plumbing'
  if (/hvac|heating|cooling|air condition|furnace/.test(hay)) return 'hvac'
  if (/roof/.test(hay)) return 'roofing'
  if (/electric/.test(hay)) return 'electrical'
  if (/real_estate|realty|realtor|homes/.test(hay)) return 'realestate'
  return 'general'
}

/** Copy per trade. Written so a business owner reads their own job, not filler. */
const TRADES: Record<Trade, {
  label: string
  lede: string
  services: [string, string][]
  proof: string
  accent: string
  ink: string
  wash: string
}> = {
  plumbing: {
    label: 'Plumbing',
    lede: 'Burst pipe, backed-up drain, or a water heater that quit overnight. Call and talk to someone who can actually come out.',
    services: [
      ['Emergency repairs', 'Burst pipes, leaks and blockages, same day where we can.'],
      ['Water heaters', 'Repair, replacement and the honest answer about which you need.'],
      ['Drains and sewer', 'Cleared properly, with a camera so you know what caused it.'],
      ['Fixtures and remodels', 'Kitchens and bathrooms, done once and done right.'],
    ],
    proof: 'Licensed and insured',
    accent: '#1B5E8C', ink: '#0F2233', wash: '#F2F7FB',
  },
  hvac: {
    label: 'Heating and cooling',
    lede: 'No heat in January or no air in July. Fast, honest, and we tell you when a repair beats a replacement.',
    services: [
      ['Emergency repair', 'Heat and cooling failures, prioritised by how cold or hot it is.'],
      ['Installs and replacement', 'Sized for your house, not upsold from a catalogue.'],
      ['Seasonal maintenance', 'The tune-up that stops the January call from happening.'],
      ['Indoor air quality', 'Humidity, filtration and the things that make a house comfortable.'],
    ],
    proof: 'Licensed and insured',
    accent: '#B4471F', ink: '#241410', wash: '#FBF5F2',
  },
  roofing: {
    label: 'Roofing',
    lede: 'Storm damage, a leak you have been watching, or a roof at the end of its life. Free inspection, straight answer.',
    services: [
      ['Storm and leak repair', 'Found, explained with photos, and fixed.'],
      ['Full replacement', 'Materials and timeline in writing before anything starts.'],
      ['Inspections', 'Free, and you get the report whether or not you hire us.'],
      ['Gutters and siding', 'The rest of the envelope that keeps water out.'],
    ],
    proof: 'Licensed, insured, and we handle the insurance paperwork',
    accent: '#2F5D3A', ink: '#13251A', wash: '#F3F8F4',
  },
  electrical: {
    label: 'Electrical',
    lede: 'Panel upgrades, dead circuits, or the outlet that has been warm for a month. Licensed work, inspected and safe.',
    services: [
      ['Repairs and troubleshooting', 'The circuit nobody else could find.'],
      ['Panel upgrades', 'For older homes carrying modern loads.'],
      ['Lighting and outlets', 'Interior, exterior and everything code requires.'],
      ['Generators and EV charging', 'Installed properly and permitted.'],
    ],
    proof: 'Licensed and insured',
    accent: '#8A6A12', ink: '#241D0C', wash: '#FBF8F0',
  },
  realestate: {
    label: 'Real estate',
    lede: 'Buying or selling should not feel like a fight. Clear guidance, straight answers, and someone who protects your time.',
    services: [
      ['Selling your home', 'Priced on real comparables, marketed properly, negotiated hard.'],
      ['Buying', 'Someone in your corner who tells you when to walk away.'],
      ['Free home valuation', 'Prepared by hand from recent sales near you.'],
      ['Relocation', 'Local knowledge for someone arriving from out of state.'],
    ],
    proof: 'Licensed in Ohio',
    accent: '#2A4A6B', ink: '#111E2C', wash: '#F4F7FA',
  },
  general: {
    label: 'Local service',
    lede: 'Straightforward work, done when we say and priced the way we quoted.',
    services: [
      ['What we do', 'The work you are known for, said plainly.'],
      ['How we work', 'Clear pricing, clear timeline, no surprises.'],
      ['Service area', 'The towns you actually cover.'],
      ['Get in touch', 'One button, answered by a person.'],
    ],
    proof: 'Licensed and insured',
    accent: '#334A63', ink: '#141D26', wash: '#F5F7F9',
  },
}

export function ProspectPreview() {
  const { id = '' } = useParams()
  const [data, setData] = useState<Mockup | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useSeo({
    title: data ? `A homepage concept for ${data.name}` : 'Homepage concept',
    description: 'A concept homepage built by ANF Consulting.',
    path: `/preview/${id}`,
    noindex: true,
  })

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const { data: rows, error } = await supabase.rpc('get_prospect_mockup', { p_id: id })
        if (cancelled) return
        if (error || !Array.isArray(rows) || rows.length === 0) return setState('missing')
        setData(rows[0] as Mockup)
        setState('ready')
      } catch {
        if (!cancelled) setState('missing')
      }
    }
    // A malformed id would make Postgres throw on the uuid cast, so never call.
    if (!/^[0-9a-f-]{36}$/i.test(id)) setState('missing')
    else void run()
    return () => { cancelled = true }
  }, [id])

  if (state === 'loading') {
    return <div className="flex min-h-[60vh] items-center justify-center text-silver-400">Loading the concept...</div>
  }

  if (state === 'missing' || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="font-display text-3xl text-silver-100">This concept is no longer available.</h1>
        <p className="mt-3 max-w-md text-silver-400">
          The link may have expired. If you were sent this by Andrew at ANF Consulting, reply to him
          and he will send a fresh one.
        </p>
        <a href="/" className="mt-6 rounded-full border border-white/25 px-6 py-2.5 text-sm text-silver-100 hover:border-flame-500 hover:text-flame-500">
          See what ANF builds
        </a>
      </div>
    )
  }

  const trade = TRADES[tradeOf(data.types, data.name)]
  const city = cityOf(data.address)
  const tel = data.phone ? data.phone.replace(/[^\d+]/g, '') : null
  const stars = data.rating ? Math.round(data.rating) : 0

  return (
    <>
      <style>{css(trade)}</style>

      {/* Not decoration. A page carrying a real company's name has to say who
          made it and that they did not. */}
      <div className="pv-banner">
        <strong>A concept, not their website.</strong> ANF Consulting built this to show{' '}
        {data.name} what their homepage could look like. It is not affiliated with, endorsed by,
        or published by {data.name}.
      </div>

      <div className="pv">
        <header className="pv-top">
          <span className="pv-logo">{data.name}</span>
          <nav className="pv-nav">
            <span>Services</span><span>Service area</span><span>Reviews</span>
            {tel && <a className="pv-call" href={`tel:${tel}`}>{data.phone}</a>}
          </nav>
        </header>

        <section className="pv-hero">
          <p className="pv-kicker">{trade.label} in {city}, Ohio</p>
          <h1 className="pv-h1">{data.name}</h1>
          <p className="pv-lede">{trade.lede}</p>
          <div className="pv-cta-row">
            {tel && <a className="pv-btn" href={`tel:${tel}`}>Call {data.phone}</a>}
            <span className="pv-btn ghost">Request a quote</span>
          </div>
          {data.rating != null && (data.total_ratings ?? 0) > 0 && (
            <p className="pv-rating">
              <span className="pv-stars" aria-hidden>{'★'.repeat(stars)}{'☆'.repeat(Math.max(0, 5 - stars))}</span>
              <strong>{data.rating.toFixed(1)}</strong> from {data.total_ratings} Google reviews
            </p>
          )}
        </section>

        <section className="pv-services">
          <h2 className="pv-h2">What we do</h2>
          <div className="pv-grid">
            {trade.services.map(([t, d]) => (
              <div className="pv-card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pv-band">
          <div>
            <p className="pv-band-k">Serving</p>
            <p className="pv-band-v">{city} and the surrounding area</p>
          </div>
          <div>
            <p className="pv-band-k">Credentials</p>
            <p className="pv-band-v">{trade.proof}</p>
          </div>
          {tel && (
            <div>
              <p className="pv-band-k">Call directly</p>
              <p className="pv-band-v">{data.phone}</p>
            </div>
          )}
        </section>

        <section className="pv-close">
          <h2 className="pv-h2">Ready when you are</h2>
          <p>Tell us what is going on and we will tell you straight what it takes to fix it.</p>
          {tel && <a className="pv-btn" href={`tel:${tel}`}>Call {data.phone}</a>}
        </section>
      </div>

      {/* Andrew's side of it. The prospect should know exactly what to do next. */}
      <div className="pv-foot">
        <p className="pv-foot-h">This took about an hour, and it is yours either way.</p>
        <p className="pv-foot-p">
          {data.has_website
            ? `${data.name} already has a site. This is what a rebuilt one could look like: faster, clearer, and built to turn a visitor into a phone call.`
            : `${data.name} does not have a website yet, so this is a starting point rather than a pitch deck. Your real Google rating and reviews are already in it.`}
          {' '}A finished version would have your own photographs, your real service area, and a form that lands in your inbox.
        </p>
        <a className="pv-foot-btn" href="https://anfconsult.com/work">See what else ANF has built</a>
      </div>
    </>
  )
}

export default ProspectPreview

const css = (t: { accent: string; ink: string; wash: string }) => `
.pv-banner{background:#0B1A33;color:#C8CFDA;font-size:13.5px;line-height:1.5;padding:11px 20px;text-align:center}
.pv-banner strong{color:#FBB088}

.pv{background:${t.wash};color:${t.ink};font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
.pv-top{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;
  max-width:1100px;margin:0 auto;padding:20px 24px;border-bottom:1px solid rgba(0,0,0,0.08)}
.pv-logo{font-size:20px;font-weight:800;letter-spacing:-0.02em;color:${t.ink}}
.pv-nav{display:flex;align-items:center;gap:20px;font-size:14.5px;color:${t.ink};opacity:0.75;flex-wrap:wrap}
.pv-call{background:${t.accent};color:#fff;padding:9px 16px;border-radius:8px;font-weight:700;text-decoration:none;opacity:1}

.pv-hero{max-width:1100px;margin:0 auto;padding:clamp(44px,7vw,86px) 24px clamp(30px,4vw,50px)}
.pv-kicker{font-size:12.5px;letter-spacing:0.18em;text-transform:uppercase;color:${t.accent};font-weight:700;margin:0}
.pv-h1{font-size:clamp(34px,6.4vw,62px);line-height:1.03;letter-spacing:-0.03em;font-weight:800;margin:12px 0 0;
  color:${t.ink};text-wrap:balance;max-width:16ch}
.pv-lede{font-size:clamp(16.5px,1.9vw,20px);line-height:1.55;margin:18px 0 0;max-width:56ch;opacity:0.78}
.pv-cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}
.pv-btn{display:inline-block;background:${t.accent};color:#fff;font-size:16px;font-weight:700;
  padding:14px 26px;border-radius:10px;text-decoration:none}
.pv-btn.ghost{background:none;color:${t.ink};border:2px solid rgba(0,0,0,0.16)}
.pv-rating{display:flex;align-items:center;gap:10px;margin:22px 0 0;font-size:15px;flex-wrap:wrap}
.pv-stars{color:#E8A317;letter-spacing:2px;font-size:17px}

.pv-services{max-width:1100px;margin:0 auto;padding:clamp(26px,4vw,44px) 24px}
.pv-h2{font-size:clamp(24px,3.4vw,34px);font-weight:800;letter-spacing:-0.02em;margin:0 0 22px;color:${t.ink}}
.pv-grid{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:620px){.pv-grid{grid-template-columns:1fr 1fr}}
.pv-card{background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:12px;padding:20px 22px;
  border-top:3px solid ${t.accent}}
.pv-card h3{font-size:18px;font-weight:700;margin:0 0 6px;color:${t.ink}}
.pv-card p{font-size:15px;line-height:1.55;margin:0;opacity:0.72}

.pv-band{max-width:1100px;margin:0 auto;padding:26px 24px;display:grid;grid-template-columns:1fr;gap:18px;
  border-top:1px solid rgba(0,0,0,0.08)}
@media(min-width:700px){.pv-band{grid-template-columns:repeat(3,1fr)}}
.pv-band-k{font-size:11.5px;letter-spacing:0.16em;text-transform:uppercase;color:${t.accent};font-weight:700;margin:0}
.pv-band-v{font-size:16.5px;font-weight:600;margin:6px 0 0;color:${t.ink}}

.pv-close{max-width:1100px;margin:0 auto;padding:clamp(34px,5vw,64px) 24px clamp(46px,6vw,80px);text-align:center}
.pv-close p{font-size:17px;margin:0 0 24px;opacity:0.75}

.pv-foot{background:#0B1A33;color:#C8CFDA;padding:clamp(34px,5vw,58px) 24px;text-align:center}
.pv-foot-h{font-family:'Space Grotesk',system-ui,sans-serif;font-size:clamp(21px,3vw,28px);font-weight:700;
  color:#F5F7FA;margin:0}
.pv-foot-p{font-size:16px;line-height:1.6;max-width:62ch;margin:14px auto 0}
.pv-foot-btn{display:inline-block;margin-top:22px;background:#F26B1D;color:#fff;font-weight:600;
  padding:12px 26px;border-radius:999px;text-decoration:none}
`
