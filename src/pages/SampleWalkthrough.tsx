import { useEffect, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { walkthroughFor } from '../lib/walkthroughs'
import { useSeo } from '../lib/useSeo'

/**
 * A guided walk through one real build.
 *
 * The point is that a lead should not have to work out what they are looking at.
 * They get the screen, what to notice, and why it matters, one step at a time,
 * and only then the live app. Every image is a real capture from the running
 * build with its sample data.
 *
 * The step lives in the URL so a specific screen can be sent to someone ("look
 * at step 3"), and so a reload or a back button does not drop them at the start.
 */
export function SampleWalkthrough() {
  const { slug = '' } = useParams()
  const w = walkthroughFor(slug)
  const [i, setI] = useState(0)

  useSeo({
    title: w ? `${w.name} · A guided look` : 'Sample walkthrough',
    description: w?.intro ?? '',
    path: `/work/${slug}`,
  })

  // Arrow keys, because anyone stepping through seven screens will try them.
  useEffect(() => {
    if (!w) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, w.steps.length - 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [w])

  if (!w) return <Navigate to="/work" replace />

  const step = w.steps[i]
  const last = i === w.steps.length - 1

  return (
    <>
      <style>{CSS}</style>

      <section className="sw-head">
        <Link to="/work" className="sw-back">&larr; All work</Link>
        <p className="sw-eyebrow">A guided look</p>
        <h1 className="sw-h1">{w.name}</h1>
        <p className="sw-built">Built for {w.builtFor.toLowerCase()}</p>
        <p className="sw-intro">{w.intro}</p>
      </section>

      <section className="sw-stage">
        <div className="sw-progress" role="tablist" aria-label="Walkthrough steps">
          {w.steps.map((s, n) => (
            <button
              key={s.image}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={`Step ${n + 1}: ${s.title}`}
              onClick={() => setI(n)}
              className={`sw-dot ${n === i ? 'is-on' : ''} ${n < i ? 'is-done' : ''}`}
            />
          ))}
        </div>

        <div className="sw-grid">
          <figure className="sw-shot">
            {/* key forces a fresh element per step so the fade replays */}
            <img
              key={step.image}
              src={`/walkthrough/${w.slug}/${step.image}`}
              alt={step.title}
              loading={i === 0 ? 'eager' : 'lazy'}
              width={1440}
              height={900}
            />
          </figure>

          <div className="sw-copy">
            <p className="sw-count">Step {i + 1} of {w.steps.length}</p>
            <h2 className="sw-h2">{step.title}</h2>
            <p className="sw-body">{step.body}</p>
            {step.note && <p className="sw-note">{step.note}</p>}

            <div className="sw-controls">
              <button
                type="button"
                className="sw-btn sw-ghost"
                onClick={() => setI((n) => Math.max(n - 1, 0))}
                disabled={i === 0}
              >
                Back
              </button>
              {last ? (
                <a className="sw-btn sw-go" href={w.liveUrl} target="_blank" rel="noreferrer">
                  {w.liveLabel} <span aria-hidden>&rarr;</span>
                </a>
              ) : (
                <button type="button" className="sw-btn sw-go" onClick={() => setI((n) => n + 1)}>
                  Next <span aria-hidden>&rarr;</span>
                </button>
              )}
            </div>

            {last && <p className="sw-datanote">{w.dataNote}</p>}
          </div>
        </div>
      </section>

      <section className="sw-cta">
        <h2 className="sw-cta-h">Want one shaped around your business?</h2>
        <p className="sw-cta-p">
          Every build on this site started the same way: one conversation about how the work
          actually runs, then a system built around that rather than a template with the colours
          swapped.
        </p>
        <div className="sw-cta-row">
          <a className="sw-btn sw-go" href={w.liveUrl} target="_blank" rel="noreferrer">
            {w.liveLabel} <span aria-hidden>&rarr;</span>
          </a>
          <Link className="sw-btn sw-ghost" to="/work">See the rest of the work</Link>
        </div>
      </section>
    </>
  )
}

export default SampleWalkthrough

const CSS = `
.sw-head{max-width:1100px;margin:0 auto;padding:96px 24px 0}
.sw-back{display:inline-block;font-size:14px;color:#8493ad;text-decoration:none;margin-bottom:26px}
.sw-back:hover{color:#f26b1d}
.sw-eyebrow{font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:#f2833f;font-weight:600;margin:0 0 14px}
.sw-h1{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:800;font-size:clamp(34px,5.4vw,60px);
  line-height:1.02;letter-spacing:-0.02em;color:#f4f5f8;margin:0;text-wrap:balance}
.sw-built{font-family:ui-monospace,Consolas,monospace;font-size:13px;letter-spacing:0.06em;color:#6f7d95;margin:14px 0 0}
.sw-intro{font-size:clamp(16px,1.8vw,19px);line-height:1.62;color:#9aa6bd;max-width:60ch;margin:18px 0 0}

.sw-stage{max-width:1100px;margin:0 auto;padding:34px 24px 0}
.sw-progress{display:flex;gap:7px;margin-bottom:22px;flex-wrap:wrap}
.sw-dot{width:34px;height:5px;border-radius:99px;border:0;padding:0;cursor:pointer;
  background:rgba(244,245,248,0.14);transition:background .25s ease,transform .2s ease}
.sw-dot:hover{transform:scaleY(1.6)}
.sw-dot.is-done{background:rgba(242,107,29,0.45)}
.sw-dot.is-on{background:#f26b1d}

.sw-grid{display:grid;grid-template-columns:1.35fr 1fr;gap:clamp(24px,4vw,54px);align-items:start}
@media(max-width:900px){.sw-grid{grid-template-columns:1fr;gap:26px}}

.sw-shot{margin:0;border-radius:12px;overflow:hidden;background:#0b1526;
  border:1px solid rgba(244,245,248,0.1);box-shadow:0 40px 80px -34px rgba(0,0,0,0.75)}
.sw-shot img{display:block;width:100%;height:auto;animation:swFade .5s ease}
@keyframes swFade{from{opacity:0}to{opacity:1}}

.sw-copy{position:sticky;top:96px}
@media(max-width:900px){.sw-copy{position:static}}
.sw-count{font-family:ui-monospace,Consolas,monospace;font-size:12px;letter-spacing:0.16em;
  text-transform:uppercase;color:#f2833f;margin:0 0 10px}
.sw-h2{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;font-size:clamp(24px,2.8vw,34px);
  line-height:1.1;color:#f4f5f8;margin:0 0 14px;text-wrap:balance}
.sw-body{font-size:17px;line-height:1.62;color:#9aa6bd;margin:0}
.sw-note{font-size:15px;line-height:1.55;color:#c8cfda;margin:16px 0 0;padding:12px 15px;
  border-left:2px solid #f26b1d;background:rgba(242,107,29,0.08);border-radius:0 8px 8px 0}

.sw-controls{display:flex;gap:10px;margin-top:26px;flex-wrap:wrap}
.sw-btn{display:inline-flex;align-items:center;gap:9px;font:inherit;font-size:15px;font-weight:600;
  border-radius:999px;padding:11px 22px;cursor:pointer;text-decoration:none;border:1px solid transparent;
  transition:background .2s ease,border-color .2s ease,color .2s ease}
.sw-go{background:#f26b1d;color:#0b1526;border-color:#f26b1d}
.sw-go:hover{background:#ff7f33}
.sw-ghost{background:none;color:#9aa6bd;border-color:rgba(244,245,248,0.16)}
.sw-ghost:hover{color:#f4f5f8;border-color:rgba(242,107,29,0.55)}
.sw-btn:disabled{opacity:0.35;cursor:default}
.sw-btn:disabled:hover{color:#9aa6bd;border-color:rgba(244,245,248,0.16)}
.sw-datanote{font-size:14px;line-height:1.5;color:#6f7d95;margin:16px 0 0;max-width:44ch}

.sw-cta{max-width:760px;margin:0 auto;padding:88px 24px 110px;text-align:center}
.sw-cta-h{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;font-size:clamp(26px,3.6vw,40px);
  line-height:1.12;color:#f4f5f8;margin:0 0 16px;text-wrap:balance}
.sw-cta-p{font-size:17px;line-height:1.6;color:#9aa6bd;margin:0 auto 30px;max-width:54ch}
.sw-cta-row{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}

@media(prefers-reduced-motion:reduce){
  .sw-shot img{animation:none}
  .sw-dot:hover{transform:none}
}
`
