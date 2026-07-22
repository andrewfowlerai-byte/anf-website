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
      <div className="ho-page">
        <div className="ho-intro">
          <p className="ho-eyebrow">ANF Consulting</p>
          <h1 className="ho-h1">Class handouts</h1>
          <p className="ho-lede">
            Your quick-start sheets from AI You Can Actually Use, Class 1. Read them here, or print a copy to keep.
            For the full workbook, go to anfconsult.com/class and enter your class code.
          </p>
          <button type="button" className="ho-print" onClick={() => window.print()}>Print or save as PDF</button>
        </div>

        {HANDOUTS.map((h) => (
          <div key={h.key} className={`ho-sheet ho-${h.key}`}>
            <p className="ho-kicker">AI You Can Actually Use · Class 1</p>
            <div className="ho-titlerow">
              <div className="ho-mark">{h.mark}</div>
              <h2 className="ho-title">{h.title}</h2>
            </div>
            <p className="ho-sub">Quick start</p>

            <div className="ho-facts">
              <div className="ho-fact">
                <div className="ho-k">What it is</div>
                <div className="ho-v">{h.whatItIs}</div>
              </div>
              <div className="ho-fact">
                <div className="ho-k">Get in</div>
                <div className="ho-v">{h.getIn}</div>
              </div>
            </div>

            <hr className="ho-rule" />

            <h3 className="ho-h3">The moves that matter</h3>
            <ol className="ho-moves">
              {h.moves.map((m) => (
                <li key={m.lead}>
                  <span><b>{m.lead}</b> {m.rest}</span>
                </li>
              ))}
            </ol>

            <div className="ho-try">
              <p className="ho-k2">Try this at home</p>
              <p>{h.tryThis}</p>
            </div>

            <div className="ho-rules">
              <p className="ho-k3">{h.rulesLabel}</p>
              <ul>
                {h.rules.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>

            <div className="ho-foot">
              <span className="ho-brand">ANF Consulting</span>
              <span className="ho-tag">Clarity. Integration. Automation.</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

const CSS = `
.ho-page{--paper:#F2F4F7;--card:#FFF;--ink:#151D30;--body:#3D4658;--muted:#6B7488;
  --hair:#E2E6EC;--flame:#C4470F;--flame-soft:#FCEDE4;--gem:#2A5FBF;--canva:#0B7F74;
  --serif:'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;
  --mono:ui-monospace,'SF Mono',Consolas,monospace;
  background:var(--paper);color:var(--body);min-height:100vh;padding:34px 16px 60px;
  font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  font-size:15px;line-height:1.55;}
.ho-intro{max-width:7.6in;margin:0 auto 26px;}
.ho-eyebrow{font-family:var(--mono);font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);margin:0 0 8px;}
.ho-h1{font-family:var(--serif);font-size:34px;font-weight:600;color:var(--ink);margin:0;letter-spacing:-.015em;}
.ho-lede{color:var(--muted);margin:10px 0 16px;max-width:60ch;}
.ho-print{background:var(--flame);color:#fff;border:0;border-radius:9px;padding:10px 18px;
  font-size:14px;font-weight:600;cursor:pointer;}
.ho-print:hover{filter:brightness(1.08);}
.ho-sheet{max-width:7.6in;margin:0 auto 26px;background:var(--card);padding:40px 46px 34px;
  box-shadow:0 4px 22px rgba(15,25,45,.09);}
.ho-gem{--accent:var(--gem);}
.ho-canva{--accent:var(--canva);}
.ho-kicker{font-family:var(--mono);font-size:10.5px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);margin:0 0 14px;}
.ho-titlerow{display:flex;align-items:center;gap:14px;}
.ho-mark{width:34px;height:34px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;
  font-family:var(--serif);font-size:19px;font-weight:700;color:#fff;background:var(--accent);}
.ho-title{font-family:var(--serif);font-size:36px;font-weight:600;letter-spacing:-.015em;margin:0;color:var(--ink);line-height:1.08;}
.ho-sub{font-size:14px;color:var(--muted);margin:7px 0 0;}
.ho-facts{margin:24px 0 0;display:grid;gap:13px;}
.ho-fact{display:grid;grid-template-columns:74px 1fr;gap:14px;align-items:baseline;}
.ho-k{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding-top:2px;}
.ho-v{color:var(--body);}
.ho-rule{height:1px;background:var(--hair);margin:24px 0 20px;border:0;}
.ho-h3{font-family:var(--serif);font-size:20px;font-weight:600;color:var(--ink);margin:0 0 14px;letter-spacing:-.01em;}
.ho-moves{list-style:none;margin:0;padding:0;counter-reset:m;}
.ho-moves li{counter-increment:m;display:grid;grid-template-columns:30px 1fr;gap:14px;padding:8px 0;align-items:baseline;}
.ho-moves li::before{content:counter(m);font-family:var(--serif);font-size:19px;font-weight:700;line-height:1;color:var(--accent);text-align:right;}
.ho-moves b{color:var(--ink);font-weight:700;}
.ho-try{margin:22px 0 0;padding:17px 21px;border-radius:12px;background:var(--flame-soft);}
.ho-k2{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--flame);margin:0 0 5px;font-weight:700;}
.ho-try p:last-child{margin:0;color:var(--ink);}
.ho-rules{margin:17px 0 0;padding:15px 21px;border:1px solid var(--hair);border-radius:12px;}
.ho-k3{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:0 0 6px;font-weight:700;}
.ho-rules ul{margin:0;padding-left:17px;}
.ho-rules li{margin:4px 0;}
.ho-foot{margin:28px 0 0;padding-top:14px;border-top:1px solid var(--hair);display:flex;
  justify-content:space-between;align-items:baseline;gap:14px;flex-wrap:wrap;}
.ho-brand{font-family:var(--serif);font-size:14px;color:var(--ink);}
.ho-tag{font-family:var(--mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);}
@media print{
  .ho-page{background:#fff;padding:0;font-size:10.5pt;line-height:1.45;}
  .ho-intro{display:none;}
  .ho-sheet{max-width:none;margin:0;padding:0;box-shadow:none;}
  .ho-sheet + .ho-sheet{break-before:page;}
  .ho-title{font-size:26pt;} .ho-h3{font-size:14pt;}
  .ho-mark{width:26px;height:26px;font-size:14pt;}
  .ho-try,.ho-rules,.ho-fact,.ho-moves li{break-inside:avoid;}
  @page{size:letter;margin:.5in;}
}
`
