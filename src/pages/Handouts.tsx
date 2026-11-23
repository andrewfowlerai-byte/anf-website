import { PageHero } from '../components/PageHero'
/**
 * Public class handouts. Agents visit anfconsult.com/handouts to read, print, or
 * save the Class 1 quick-start sheets. Deliberately light and paper-like rather
 * than matching the dark site, because these are documents people print.
 */

interface Handout {
  key: string
  mark: string
  title: string
  whatItIs: string
  getIn: string
  moves: { lead: string; rest: string }[]
  tryThis: string
  rulesLabel: string
  rules: string[]
}

const HANDOUTS: Handout[] = [
  {
    key: 'gem',
    mark: 'G',
    title: 'Google Gemini Pro',
    whatItIs:
      "Google's AI assistant, built into Gmail, Docs, and Search. The Pro plan (Google AI Pro) adds the smartest model and puts Gemini right inside your Google tools.",
    getIn: 'gemini.google.com, the Gemini app on your phone, or the sparkle icon inside Gmail and Docs.',
    moves: [
      { lead: 'Ask, then refine.', rest: 'Get a first answer, then say shorter, warmer, add bullets. The second try is where it gets good.' },
      { lead: 'Feed it a file.', rest: 'Drop in a PDF or a photo and ask for a summary or the key points.' },
      { lead: 'In Gmail.', rest: 'Draft a reply, summarize a long thread, or change the tone. Read it before you send.' },
      { lead: 'In Docs.', rest: 'Use Help me write for a first draft, then trim it down together.' },
      { lead: 'Deep Research.', rest: 'Give it a topic and get back a written report.' },
      { lead: 'Gems.', rest: 'Save a custom assistant so you never re-explain the same task.' },
    ],
    tryThis:
      'Build one Gem for a task you do every week. A Listing Writer, a Review Responder, an Email Cleaner. Name it, give it your instructions once, and use it three times this week.',
    rulesLabel: 'Two rules',
    rules: [
      'Always read before you send.',
      'Never paste private client data (names, numbers, and records) into any AI tool.',
    ],
  },
  {
    key: 'canva',
    mark: 'C',
    title: 'Canva',
    whatItIs:
      'Drag-and-drop design that anyone can use, now with AI (Magic Studio) that does the first draft for you.',
    getIn: 'canva.com, sign in, and start from the templates on the home screen.',
    moves: [
      { lead: 'Start from a template.', rest: 'Never a blank page. Search for what you need (Instagram post, flyer, business card).' },
      { lead: 'Set your Brand Kit once.', rest: 'Logo, colors, fonts. Everything you make stays on brand. (Pro.)' },
      { lead: 'Magic Design.', rest: 'Describe what you want, or drop in a photo, and get a full design to start from.' },
      { lead: 'Magic Write.', rest: 'AI captions, headlines, and copy, right on the canvas.' },
      { lead: 'Magic Media.', rest: 'Turn text into an image or a short video.' },
      { lead: 'Background Remover and Magic Eraser.', rest: 'Clean up a product or property photo in seconds.' },
      { lead: 'Resize.', rest: 'One design, every platform, in one click. (Pro.)' },
    ],
    tryThis:
      'Make one branded template you will reuse (a post or a flyer). Save it, then remake it twice with new content this week.',
    rulesLabel: 'One rule',
    rules: ['Start from a template, let the AI write the first draft, then make it yours.'],
  },
]

export function Handouts() {
  return (
    <>
      <style>{CSS}</style>
      <PageHero
        title="Class handouts"
        subtitle="Your quick-start sheets from AI You Can Actually Use, Class 1. Read them here, or print a copy to keep. For the full workbook, go to anfconsult.com/class and enter your class code."
      >
        <button type="button" className="btn btn-ink" onClick={() => window.print()}>Print or save as PDF</button>
      </PageHero>

      <div className="ho-page">
        {HANDOUTS.map((h) => (
          <article key={h.key} className={`ho-sheet ho-${h.key}`}>
            <div className="ho-titlerow">
              <div className="ho-mark" aria-hidden="true">{h.mark}</div>
              <h2 className="ho-title">{h.title}</h2>
            </div>
            <p className="ho-sub">Quick start. AI You Can Actually Use, Class 1.</p>

            <dl className="ho-facts">
              <div className="ho-fact">
                <dt>What it is</dt>
                <dd>{h.whatItIs}</dd>
              </div>
              <div className="ho-fact">
                <dt>Get in</dt>
                <dd>{h.getIn}</dd>
              </div>
            </dl>

            <h3 className="ho-h3">The moves that matter</h3>
            <ol className="ho-moves">
              {h.moves.map((m) => (
                <li key={m.lead}><b>{m.lead}</b> {m.rest}</li>
              ))}
            </ol>

            <div className="ho-try">
              <h3 className="ho-h4">Try this at home</h3>
              <p>{h.tryThis}</p>
            </div>

            <div className="ho-rules">
              <h3 className="ho-h4">{h.rulesLabel}</h3>
              <ul>
                {h.rules.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>

            <p className="ho-foot">ANF Consulting. Clarity. Integration. Automation.</p>
          </article>
        ))}
      </div>
    </>
  )
}

// The sheets print one to a page. On screen they are plain white sheets on the paper; on paper, just the sheet.
// Redesigned 2026-11-23: the site's one typeface, no small capital labels, no rules or shadows.
const CSS = `
.ho-page{padding:clamp(2rem,5vw,4rem) var(--edge) clamp(3rem,7vw,6rem);display:grid;gap:clamp(1.5rem,3vw,2.5rem);}
.ho-sheet{max-width:7.6in;background:#fff;color:var(--ink);padding:clamp(1.5rem,4vw,2.75rem);}
.ho-gem{--accent:#2A5FBF;}
.ho-canva{--accent:#0B7F74;}
.ho-titlerow{display:flex;align-items:center;gap:0.9rem;}
.ho-mark{width:2.6rem;height:2.6rem;flex:none;display:grid;place-items:center;font-size:1.4rem;font-weight:800;color:#fff;background:var(--accent);}
.ho-title{font-size:var(--step-head);font-weight:800;letter-spacing:-0.04em;line-height:0.98;margin:0;}
.ho-sub{margin:0.6rem 0 0;color:#3A4A6B;}
.ho-facts{margin:1.6rem 0 0;display:grid;gap:0.8rem;}
.ho-fact{display:grid;grid-template-columns:6.5rem 1fr;gap:1rem;align-items:baseline;}
.ho-fact dt{font-weight:800;}
.ho-fact dd{margin:0;}
.ho-h3{font-size:var(--step-lead);font-weight:800;letter-spacing:-0.03em;margin:2rem 0 0.9rem;}
.ho-h4{font-size:1rem;font-weight:800;margin:0 0 0.35rem;}
.ho-moves{margin:0;padding-left:1.5em;display:grid;gap:0.6rem;}
.ho-moves li::marker{font-weight:800;color:var(--accent);}
.ho-try{margin:1.6rem 0 0;padding:1.1rem 1.3rem;background:var(--mist);}
.ho-try p{margin:0;}
.ho-rules{margin:0.75rem 0 0;padding:1.1rem 1.3rem;background:#E6EAF0;}
.ho-rules ul{margin:0;padding-left:1.2em;}
.ho-rules li{margin:0.25rem 0;}
.ho-foot{margin:1.75rem 0 0;font-size:var(--step-small);font-weight:600;color:#3A4A6B;}
@media print{
  header,footer,.page-hero,[aria-label="Chat with ANF"],.anf-pop{display:none !important;}
  main.on-paper{background:#fff;font-size:10.5pt;line-height:1.45;}
  .ho-page{padding:0;display:block;}
  .ho-sheet{max-width:none;margin:0;padding:0;}
  .ho-sheet + .ho-sheet{break-before:page;}
  .ho-title{font-size:26pt;} .ho-h3{font-size:14pt;}
  .ho-mark{width:26px;height:26px;font-size:14pt;}
  .ho-try,.ho-rules,.ho-fact,.ho-moves li{break-inside:avoid;}
  @page{size:letter;margin:.5in;}
}
`
