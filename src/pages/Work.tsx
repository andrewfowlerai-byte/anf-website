import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { listShowcaseProjects, type ShowcaseProject } from '../lib/showcase'

type Project = {
  name: string
  category: string
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
    image: p.image_url ?? undefined,
    domain: domainOf(p.live_url ?? undefined),
    accessCode: p.access_code ?? undefined,
    accessNote: p.access_note ?? undefined,
  }
}

/** Adds `data-inview` when the element scrolls into view (once), for CSS reveals. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.setAttribute('data-inview', 'true')
      return
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { el.setAttribute('data-inview', 'true'); io.unobserve(el) } }),
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return ref
}

function BrowserFrame({ p }: { p: Project }) {
  const frameRef = useRef<HTMLDivElement>(null)

  // Cursor-follow 3D tilt (desktop only). Applied straight to the node so we
  // never re-render on mouse move.
  const onMove = (e: React.MouseEvent) => {
    const el = frameRef.current
    if (!el || window.matchMedia('(pointer: coarse)').matches) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`)
  }
  const onLeave = () => {
    const el = frameRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div className="wk-frame" ref={frameRef} onMouseMove={onMove} onMouseLeave={onLeave}>
      <div className="wk-chrome">
        <span className="wk-dot" /><span className="wk-dot" /><span className="wk-dot" />
        <span className="wk-url">{p.domain ?? 'anfconsult.com'}</span>
        <span className="wk-bar" />
      </div>
      <div className="wk-shot">
        {p.image ? (
          <img src={p.image} alt={`${p.name} preview`} loading="lazy" />
        ) : (
          <div className="wk-placeholder">
            <span className="wk-ph-tags">{p.tags.join('  ·  ')}</span>
            <span className="wk-ph-name">{p.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function FeatureRow({ p, i }: { p: Project; i: number }) {
  const ref = useReveal<HTMLDivElement>()
  const isLive = p.link && !p.link.startsWith('/')
  const [copied, setCopied] = useState(false)
  const copyCode = () => {
    if (!p.accessCode) return
    navigator.clipboard?.writeText(p.accessCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    }).catch(() => {})
  }
  return (
    <div className={`wk-row ${i % 2 ? 'wk-rev' : ''}`} ref={ref}>
      <div className="wk-media">
        {p.link ? (
          <a href={p.link} target={isLive ? '_blank' : undefined} rel="noreferrer" aria-label={`Open ${p.name}`}>
            <BrowserFrame p={p} />
          </a>
        ) : (
          <BrowserFrame p={p} />
        )}
      </div>
      <div className="wk-meta">
        <span className="wk-num">{String(i + 1).padStart(2, '0')}</span>
        {p.category && <p className="wk-cat">{p.category}</p>}
        <h2 className="wk-title">{p.name}</h2>
        {p.summary && <p className="wk-sum">{p.summary}</p>}
        {p.tags.length > 0 && <p className="wk-tags">{p.tags.join('  ·  ')}</p>}
        {p.accessCode ? (
          <div className="wk-access">
            <span className="wk-access-k">Password to explore</span>
            <button type="button" className="wk-access-code" onClick={copyCode} title="Copy the demo password">
              <span>{p.accessCode}</span>
              <span className="wk-access-copy">{copied ? 'copied' : 'copy'}</span>
            </button>
          </div>
        ) : p.accessNote ? (
          <p className="wk-access-note">{p.accessNote}</p>
        ) : null}
        {p.link && (
          isLive ? (
            <a className="wk-go" href={p.link} target="_blank" rel="noreferrer">{p.linkLabel ?? 'See it live'} <span aria-hidden>&rarr;</span></a>
          ) : (
            <Link className="wk-go" to={p.link}>{p.linkLabel ?? 'View project'} <span aria-hidden>&rarr;</span></Link>
          )
        )}
      </div>
    </div>
  )
}

export function Work() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK)
  const heroRef = useReveal<HTMLDivElement>()

  useEffect(() => {
    let cancelled = false
    listShowcaseProjects()
      .then((rows) => { if (!cancelled && rows.length) setProjects(rows.map(toProject)) })
      .catch(() => { /* keep fallback */ })
    return () => { cancelled = true }
  }, [])

  return (
    <>
      <style>{WK_CSS}</style>

      <section className="wk-hero" ref={heroRef}>
        <div className="wk-hero-glow" />
        <p className="wk-eyebrow">Selected Work</p>
        <h1 className="wk-h1"><span>Things</span> <span>we&rsquo;ve</span> <span className="wk-flame">built.</span></h1>
        <p className="wk-lede">
          Every one was built around a specific business, not pulled from a template. Real projects
          we designed, built, and run, most live with sample data and the password to walk in right
          on the card. Click straight in and look around.
        </p>
      </section>

      <section className="wk-list">
        {projects.map((p, i) => <FeatureRow key={p.name} p={p} i={i} />)}
      </section>

      <section className="wk-cta">
        <p className="wk-eyebrow">Your project next</p>
        <h2 className="wk-cta-h">Have something you&rsquo;d like built or grown?</h2>
        <p className="wk-cta-p">
          Whether it is a website, a custom CRM, an AI workflow, or a system to tie it all
          together, the right first step is a short conversation. No pitch, no pressure.
        </p>
        <BookCallButton />
      </section>
    </>
  )
}

const WK_CSS = `
.wk-hero{position:relative;max-width:1200px;margin:0 auto;padding:110px 24px 40px;overflow:hidden}
.wk-hero-glow{position:absolute;top:-160px;left:-120px;width:620px;height:620px;border-radius:50%;
  background:radial-gradient(circle,rgba(242,107,29,0.22),rgba(242,107,29,0) 70%);pointer-events:none;
  opacity:0;transform:scale(.8);transition:opacity 1.2s ease,transform 1.6s ease}
.wk-hero[data-inview] .wk-hero-glow{opacity:1;transform:scale(1)}
.wk-eyebrow{font-size:12px;letter-spacing:0.34em;text-transform:uppercase;color:#f2833f;font-weight:600;margin:0 0 18px}
.wk-h1{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:800;
  font-size:clamp(48px,8vw,104px);line-height:0.96;letter-spacing:-0.02em;color:#f4f5f8;margin:0}
.wk-h1 span{display:inline-block;opacity:0;transform:translateY(26px);
  animation:wkUp .9s cubic-bezier(.2,.7,.2,1) forwards}
.wk-h1 span:nth-child(2){animation-delay:.09s}
.wk-h1 span:nth-child(3){animation-delay:.18s}
.wk-flame{color:#f26b1d}
.wk-lede{font-size:clamp(17px,2vw,21px);line-height:1.6;color:#9aa6bd;max-width:56ch;margin:26px 0 0;
  opacity:0;animation:wkFade 1s ease .35s forwards}

.wk-list{max-width:1200px;margin:0 auto;padding:20px 24px 40px}
.wk-row{display:grid;grid-template-columns:1.1fr 1fr;gap:clamp(32px,5vw,72px);align-items:center;
  padding:clamp(48px,7vw,88px) 0;border-top:1px solid rgba(244,245,248,0.08)}
.wk-row:first-child{border-top:0}
.wk-rev{direction:rtl}
.wk-rev>*{direction:ltr}
@media(max-width:820px){.wk-row{grid-template-columns:1fr;gap:28px}.wk-rev{direction:ltr}}

/* Media reveal: swing in from a 3D angle as it enters view */
.wk-media{opacity:0;transform:perspective(1400px) rotateY(14deg) translateY(40px);
  transition:opacity .9s ease,transform 1.1s cubic-bezier(.2,.7,.2,1)}
.wk-rev .wk-media{transform:perspective(1400px) rotateY(-14deg) translateY(40px)}
.wk-row[data-inview] .wk-media{opacity:1;transform:perspective(1400px) rotateY(0) translateY(0)}

.wk-media a{display:block;text-decoration:none}
.wk-frame{border-radius:12px;overflow:hidden;background:#0b1526;
  border:1px solid rgba(244,245,248,0.1);
  box-shadow:0 40px 80px -34px rgba(0,0,0,0.75), 0 0 0 1px rgba(242,107,29,0) ;
  transform:perspective(1200px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
  transition:box-shadow .4s ease, transform .3s ease}
.wk-media a:hover .wk-frame{box-shadow:0 54px 90px -30px rgba(0,0,0,0.8), 0 0 34px -6px rgba(242,107,29,0.45);
  border-color:rgba(242,107,29,0.4)}
.wk-chrome{display:flex;align-items:center;gap:7px;padding:11px 14px;background:#13233c;
  border-bottom:1px solid rgba(244,245,248,0.07);position:relative}
.wk-dot{width:10px;height:10px;border-radius:50%;background:#2b3d59}
.wk-url{margin-left:12px;font-family:ui-monospace,Consolas,monospace;font-size:12.5px;color:#8493ad;
  background:#0b1526;border-radius:6px;padding:5px 14px;max-width:60%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.wk-bar{position:absolute;left:0;bottom:-1px;height:2px;width:0;background:linear-gradient(90deg,#f26b1d,#ffb648)}
.wk-row[data-inview] .wk-bar{width:100%;transition:width 1.1s ease .3s}
.wk-shot{position:relative;aspect-ratio:16/10;overflow:hidden;background:#0b1526}
.wk-shot img{width:100%;height:100%;object-fit:cover;object-position:50% 0%;display:block;
  transition:object-position 5s ease, transform .5s ease}
.wk-media a:hover .wk-shot img{object-position:50% 100%;transform:scale(1.015)}
.wk-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;gap:12px;
  padding:0 34px;background:radial-gradient(120% 140% at 0% 0%,rgba(242,107,29,0.18),rgba(11,21,38,0) 55%),#0d1a30}
.wk-ph-tags{font-family:ui-monospace,Consolas,monospace;font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#f2833f}
.wk-ph-name{font-family:'Space Grotesk',system-ui,sans-serif;font-size:34px;line-height:1.05;color:#eef1f6;font-weight:700}

.wk-meta{opacity:0;transform:translateY(22px);transition:opacity .9s ease .12s,transform 1s cubic-bezier(.2,.7,.2,1) .12s}
.wk-row[data-inview] .wk-meta{opacity:1;transform:translateY(0)}
.wk-num{font-family:ui-monospace,Consolas,monospace;font-size:15px;font-weight:700;color:#f26b1d;letter-spacing:0.1em}
.wk-cat{font-family:ui-monospace,Consolas,monospace;font-size:13px;letter-spacing:0.2em;text-transform:uppercase;color:#8493ad;margin:8px 0 14px}
.wk-title{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;
  font-size:clamp(30px,3.6vw,46px);line-height:1.04;color:#f4f5f8;margin:0 0 16px;text-wrap:balance}
.wk-sum{font-size:clamp(16px,1.5vw,18px);line-height:1.62;color:#9aa6bd;margin:0 0 18px;max-width:44ch}
.wk-tags{font-family:ui-monospace,Consolas,monospace;font-size:13px;letter-spacing:0.06em;color:#6f7d95;margin:0 0 22px}
.wk-go{display:inline-flex;align-items:center;gap:9px;font-size:16px;font-weight:700;color:#f26b1d;
  text-decoration:none;text-transform:uppercase;letter-spacing:0.03em}
.wk-go span{transition:transform .25s ease}
.wk-go:hover span{transform:translateX(5px)}

.wk-access{display:flex;align-items:center;gap:12px;margin:0 0 18px;flex-wrap:wrap}
.wk-access-k{font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8493ad}
.wk-access-code{display:inline-flex;align-items:center;gap:12px;font-family:ui-monospace,Consolas,monospace;font-size:14px;font-weight:600;
  color:#f4f5f8;background:#13233c;border:1px solid rgba(242,107,29,0.35);border-radius:8px;padding:7px 12px;cursor:pointer;
  transition:border-color .2s ease,background .2s ease}
.wk-access-code:hover{border-color:rgba(242,107,29,0.75);background:#182b48}
.wk-access-copy{font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#f2833f}
.wk-access-note{font-family:ui-monospace,Consolas,monospace;font-size:12.5px;letter-spacing:0.06em;color:#8493ad;margin:0 0 18px;
  display:inline-flex;align-items:center;gap:9px}
.wk-access-note::before{content:'';width:7px;height:7px;border-radius:50%;background:#3a4a6b;flex:none}

.wk-cta{max-width:760px;margin:0 auto;padding:80px 24px 110px;text-align:center}
.wk-cta-h{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;font-size:clamp(30px,4vw,44px);
  line-height:1.1;color:#f4f5f8;margin:14px 0 18px;text-wrap:balance}
.wk-cta-p{font-size:18px;line-height:1.6;color:#9aa6bd;margin:0 auto 32px;max-width:52ch}

@keyframes wkUp{to{opacity:1;transform:translateY(0)}}
@keyframes wkFade{to{opacity:1}}
@media(prefers-reduced-motion:reduce){
  .wk-h1 span,.wk-lede{opacity:1;transform:none;animation:none}
  .wk-media,.wk-meta{opacity:1;transform:none;transition:none}
  .wk-shot img{transition:none}
  .wk-bar{width:100%}
}
`
