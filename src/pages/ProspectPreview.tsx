import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSeo } from '../lib/useSeo'
import { TRADES, tradeOf, cityOf, type TradeProfile } from '../lib/mockupTrades'

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
 * softened: a page carrying a real company's name has to say plainly who made it
 * and that they did not. For the same reason the route sits outside the
 * marketing layout, so it does not read as an ANF page either.
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
    return <div className="flex min-h-screen items-center justify-center bg-[#F5F7F9] text-slate-500">Loading the concept...</div>
  }

  if (state === 'missing' || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-midnight-900 px-6 text-center">
        <h1 className="font-display text-3xl text-silver-100">This concept is no longer available.</h1>
        <p className="mt-3 max-w-md text-silver-400">
          The link may have expired. If Andrew at ANF Consulting sent you this, reply to him and he
          will send a fresh one.
        </p>
        <a href="https://anfconsult.com/work" className="mt-6 rounded-full border border-white/25 px-6 py-2.5 text-sm text-silver-100 hover:border-flame-500 hover:text-flame-500">
          See what ANF builds
        </a>
      </div>
    )
  }

  const t = TRADES[tradeOf(data.types, data.name)]
  const city = cityOf(data.address)
  const tel = data.phone ? data.phone.replace(/[^\d+]/g, '') : null
  const stars = data.rating ? Math.round(data.rating) : 0
  const wellRated = (data.rating ?? 0) >= 4.5 && (data.total_ratings ?? 0) >= 10

  return (
    <>
      <style>{css(t)}</style>

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
            <span>Services</span><span>Why us</span><span>Questions</span>
            {tel && <a className="pv-call" href={`tel:${tel}`}>{data.phone}</a>}
          </nav>
        </header>

        <section className="pv-hero">
          <div className="pv-hero-copy">
            <p className="pv-kicker">{t.label} in {city}, Ohio</p>
            <h1 className="pv-h1">{data.name}</h1>
            <p className="pv-lede">{t.lede}</p>
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
          </div>
          <figure className="pv-hero-img">
            <img src={t.hero.url} alt={t.hero.alt} loading="eager" />
          </figure>
        </section>

        {wellRated && (
          <section className="pv-strip">
            <p>
              <strong>{data.rating?.toFixed(1)} stars from {data.total_ratings} reviews.</strong>{' '}
              {city} already knows the work. The website should say so on the way in.
            </p>
          </section>
        )}

        <section className="pv-services" id="services">
          <h2 className="pv-h2">What we do</h2>
          <div className="pv-grid">
            {t.services.map(([title, desc]) => (
              <div className="pv-card" key={title}>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pv-reasons" id="why">
          <h2 className="pv-h2">Why people call us</h2>
          <div className="pv-reason-grid">
            {t.reasons.map(([title, desc], i) => (
              <div className="pv-reason" key={title}>
                <span className="pv-num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pv-gallery">
          {t.gallery.map((g) => (
            <figure key={g.url}><img src={g.url} alt={g.alt} loading="lazy" /></figure>
          ))}
        </section>

        <section className="pv-band">
          <div>
            <p className="pv-band-k">Serving</p>
            <p className="pv-band-v">{city} and the surrounding area</p>
          </div>
          <div>
            <p className="pv-band-k">Credentials</p>
            <p className="pv-band-v">{t.proof}</p>
          </div>
          {tel && (
            <div>
              <p className="pv-band-k">Call directly</p>
              <p className="pv-band-v">{data.phone}</p>
            </div>
          )}
        </section>

        <section className="pv-faq" id="faq">
          <h2 className="pv-h2">Questions we get asked</h2>
          <div className="pv-faq-list">
            {t.faq.map(([q, a]) => (
              <div className="pv-q" key={q}>
                <h3>{q}</h3>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pv-close">
          <h2 className="pv-h2">Ready when you are</h2>
          <p>Tell us what is going on and we will tell you straight what it takes to fix it.</p>
          {tel && <a className="pv-btn" href={`tel:${tel}`}>Call {data.phone}</a>}
        </section>

        <footer className="pv-credits">
          Photography by {[t.hero, ...t.gallery].map((g) => g.credit).join(', ')} via Pexels. A
          finished site would use {data.name}&rsquo;s own photographs.
        </footer>
      </div>

      {/* Andrew's side of it. The prospect should know exactly what happens next. */}
      <div className="pv-foot">
        <p className="pv-foot-h">This took about an hour, and it is yours either way.</p>
        <p className="pv-foot-p">
          {data.has_website
            ? `${data.name} already has a site. This is what a rebuilt one could look like: faster, clearer, and built to turn a visitor into a phone call.`
            : `${data.name} does not have a website yet, so this is a starting point rather than a pitch deck. Your real Google rating and reviews are already in it.`}
          {' '}A finished version would carry your own photographs, your real service area, your
          actual reviews, and a form that lands in your inbox rather than nowhere.
        </p>
        <a className="pv-foot-btn" href="https://anfconsult.com/work">See what else ANF has built</a>
      </div>
    </>
  )
}

export default ProspectPreview

const css = (t: TradeProfile) => `
.pv-banner{background:#0B1A33;color:#C8CFDA;font-size:13.5px;line-height:1.5;padding:11px 20px;text-align:center}
.pv-banner strong{color:#FBB088}

.pv{background:${t.wash};color:${t.ink};font-family:system-ui,-apple-system,'Segoe UI',sans-serif}
.pv section{scroll-margin-top:20px}
.pv-top{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap;
  max-width:1150px;margin:0 auto;padding:20px 24px;border-bottom:1px solid rgba(0,0,0,0.08)}
.pv-logo{font-size:20px;font-weight:800;letter-spacing:-0.02em;color:${t.ink}}
.pv-nav{display:flex;align-items:center;gap:20px;font-size:14.5px;color:${t.ink};opacity:0.75;flex-wrap:wrap}
.pv-call{background:${t.accent};color:#fff;padding:9px 16px;border-radius:8px;font-weight:700;text-decoration:none;opacity:1}

.pv-hero{max-width:1150px;margin:0 auto;padding:clamp(36px,5vw,68px) 24px clamp(26px,3vw,40px);
  display:grid;grid-template-columns:1fr;gap:clamp(26px,4vw,48px);align-items:center}
@media(min-width:900px){.pv-hero{grid-template-columns:1.05fr 1fr}}
.pv-kicker{font-size:12.5px;letter-spacing:0.18em;text-transform:uppercase;color:${t.accent};font-weight:700;margin:0}
.pv-h1{font-size:clamp(32px,5.4vw,54px);line-height:1.04;letter-spacing:-0.03em;font-weight:800;margin:12px 0 0;
  color:${t.ink};text-wrap:balance}
.pv-lede{font-size:clamp(16.5px,1.8vw,19.5px);line-height:1.55;margin:16px 0 0;max-width:52ch;opacity:0.78}
.pv-cta-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.pv-btn{display:inline-block;background:${t.accent};color:#fff;font-size:16px;font-weight:700;
  padding:14px 26px;border-radius:10px;text-decoration:none}
.pv-btn.ghost{background:none;color:${t.ink};border:2px solid rgba(0,0,0,0.16)}
.pv-rating{display:flex;align-items:center;gap:10px;margin:20px 0 0;font-size:15px;flex-wrap:wrap}
.pv-stars{color:#E8A317;letter-spacing:2px;font-size:17px}
.pv-hero-img{margin:0;border-radius:14px;overflow:hidden;aspect-ratio:4/3;
  box-shadow:0 30px 60px -30px rgba(0,0,0,0.45)}
.pv-hero-img img{width:100%;height:100%;object-fit:cover;display:block}

.pv-strip{background:${t.accent};color:#fff}
.pv-strip p{max-width:1150px;margin:0 auto;padding:16px 24px;font-size:16px;line-height:1.5}

.pv-services,.pv-reasons,.pv-faq{max-width:1150px;margin:0 auto;padding:clamp(30px,4vw,52px) 24px}
.pv-h2{font-size:clamp(24px,3.2vw,34px);font-weight:800;letter-spacing:-0.02em;margin:0 0 22px;color:${t.ink}}
.pv-grid{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:620px){.pv-grid{grid-template-columns:1fr 1fr}}
.pv-card{background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:12px;padding:20px 22px;
  border-top:3px solid ${t.accent}}
.pv-card h3{font-size:18px;font-weight:700;margin:0 0 6px;color:${t.ink}}
.pv-card p{font-size:15px;line-height:1.55;margin:0;opacity:0.72}

.pv-reason-grid{display:grid;grid-template-columns:1fr;gap:20px}
@media(min-width:760px){.pv-reason-grid{grid-template-columns:repeat(3,1fr)}}
.pv-num{font-size:13px;font-weight:800;color:${t.accent};letter-spacing:0.1em}
.pv-reason h3{font-size:18px;font-weight:700;margin:6px 0 5px;color:${t.ink}}
.pv-reason p{font-size:15px;line-height:1.55;margin:0;opacity:0.72}

.pv-gallery{max-width:1150px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:700px){.pv-gallery{grid-template-columns:repeat(3,1fr)}}
.pv-gallery figure{margin:0;border-radius:12px;overflow:hidden;aspect-ratio:4/3}
.pv-gallery img{width:100%;height:100%;object-fit:cover;display:block}

.pv-band{max-width:1150px;margin:0 auto;padding:clamp(30px,4vw,44px) 24px;display:grid;
  grid-template-columns:1fr;gap:18px}
@media(min-width:700px){.pv-band{grid-template-columns:repeat(3,1fr)}}
.pv-band-k{font-size:11.5px;letter-spacing:0.16em;text-transform:uppercase;color:${t.accent};font-weight:700;margin:0}
.pv-band-v{font-size:16.5px;font-weight:600;margin:6px 0 0;color:${t.ink}}

.pv-faq-list{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:760px){.pv-faq-list{grid-template-columns:1fr 1fr}}
.pv-q{background:#fff;border:1px solid rgba(0,0,0,0.07);border-radius:12px;padding:18px 20px}
.pv-q h3{font-size:16.5px;font-weight:700;margin:0 0 6px;color:${t.ink}}
.pv-q p{font-size:15px;line-height:1.55;margin:0;opacity:0.72}

.pv-close{max-width:1150px;margin:0 auto;padding:clamp(30px,4vw,58px) 24px clamp(34px,4vw,58px);text-align:center}
.pv-close p{font-size:17px;margin:0 0 24px;opacity:0.75}
.pv-credits{max-width:1150px;margin:0 auto;padding:0 24px clamp(30px,4vw,50px);font-size:12.5px;
  opacity:0.5;text-align:center}

.pv-foot{background:#0B1A33;color:#C8CFDA;padding:clamp(34px,5vw,58px) 24px;text-align:center}
.pv-foot-h{font-family:'Space Grotesk',system-ui,sans-serif;font-size:clamp(21px,3vw,28px);font-weight:700;
  color:#F5F7FA;margin:0}
.pv-foot-p{font-size:16px;line-height:1.6;max-width:62ch;margin:14px auto 0}
.pv-foot-btn{display:inline-block;margin-top:22px;background:#F26B1D;color:#fff;font-weight:600;
  padding:12px 26px;border-radius:999px;text-decoration:none}
`
