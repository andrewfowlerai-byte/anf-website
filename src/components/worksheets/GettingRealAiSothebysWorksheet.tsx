import { useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'

// "Getting Real With AI" takeaway guide, tailored for a luxury real estate
// audience (taught for a Sotheby's International Realty class). Same proven
// structure as the general CE guide, with luxury-flavored examples and a neutral
// ANF presenter line (no competing brokerage affiliation). Points to ANF services
// (AI coaching, website design, custom CRM builds) for the real work.

// ---- small presentational helpers -----------------------------------------

function Section({ n, title, lead, children }: { n: string; title: string; lead: string; children: ReactNode }) {
  return (
    <section className="break-inside-avoid">
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-extrabold text-flame-600">{n}</span>
        <h2 className="text-xl font-bold text-midnight-900">{title}</h2>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{lead}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function TieIn({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border-l-2 border-flame-500 bg-flame-50 px-4 py-2.5 text-[14px] leading-relaxed text-slate-700">
      <span className="font-semibold text-flame-600">Where ANF comes in. </span>
      {children}
    </div>
  )
}

function PromptCard({ label, prompt }: { label: string; prompt: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked, ignore */
    }
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-flame-600">{label}</p>
        <button
          onClick={copy}
          className="no-print inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-flame-400 hover:text-flame-600"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-[14px] leading-relaxed text-slate-700">{prompt}</p>
    </div>
  )
}

const PROMPTS: [string, string][] = [
  ['Estate listing description', 'Act as an expert luxury real estate copywriter. Write a listing description for [address] with [square footage, defining architecture, grounds, price] for [the discerning buyer it suits]. Three short, refined paragraphs, confident and never overwrought, ending with an invitation to arrange a private showing.'],
  ['Just-listed announcement', 'Write a polished announcement for a newly listed [property type] in [area]. Lead with [one or two defining features]. Understated and confident, three short lines, a few tasteful hashtags, and one clear way to inquire.'],
  ['Private-showing follow-up', 'Write a short, gracious follow-up note to a client after a private showing of [address]. Reference [a detail they responded to], keep it under four sentences, and offer an easy next step (a second viewing, comps, or a call).'],
  ['Market note to your sphere', 'Draft a concise market-update note to my past clients and sphere about [area]. One insight that matters to a high-net-worth owner (pricing, inventory, or timing), in plain language, ending with an open invitation to talk.'],
]

const PROMPT_PARTS: [string, string, string][] = [
  ['Role', 'Tell it who to be.', 'Act as an expert luxury listing copywriter.'],
  ['Context', 'Give it the facts.', 'The address, the architecture, and who the buyer is.'],
  ['Task', 'Ask for one thing.', 'Write the listing description.'],
  ['Format', 'Say how you want it back.', 'Three short, refined paragraphs.'],
]

const TOOLS: [string, string, string][] = [
  ['Listings & descriptions', 'ChatGPT or Claude', 'Polished drafts that sound like you, fast.'],
  ['Emails & follow-ups', 'ChatGPT or Claude', 'Gracious replies and nurture notes in seconds.'],
  ['Captions & graphics', 'Canva', 'Announcements, captions, and carousels in one place.'],
  ['Market & neighborhood research', 'Perplexity', 'Answers with sources you can verify.'],
  ['Listing video & reels', 'CapCut', 'Clean edits and walkthroughs for social.'],
  ['Video without filming', 'HeyGen', 'AI presenter videos from a script, no camera needed.'],
  ['Notes & admin', 'ChatGPT or Claude', 'Turn a voice note after a showing into a plan.'],
]

const VISIBILITY: string[] = [
  'A complete, polished Google Business Profile.',
  'Your name, market, and specialty read the same everywhere: Google, Zillow, Realtor.com, Instagram, your site.',
  'Recent reviews from clients, and a quiet habit of asking for them.',
  'A website that says, in plain words, who you serve and where.',
  'Helpful local content: neighborhood and market notes for the areas you sell.',
  'Mentions and links on local and luxury-market sites.',
]

const SERVICES: [string, string][] = [
  ['AI coaching & setup', 'Prompts, tools, and workflows built around your day.'],
  ['Custom CRM builds', 'One system for leads, follow-ups, and content, shaped around your business.'],
  ['Website design', 'A site that ranks, converts, and reads like you.'],
]

const CRM_POINTS: string[] = [
  'Your leads, clients, and follow-ups in one place, not scattered across apps and sticky notes.',
  'AI built in: it drafts your notes, reminds you who to follow up with, and keeps everything organized.',
  'Your content, listings, and calendar together, so nothing slips through.',
  'Built around how you work, not a generic one-size template.',
]

// ---- the guide -------------------------------------------------------------

export default function GettingRealAiSothebysWorksheet({ title }: { title?: string }) {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <style>{`@media print {
        .no-print { display: none !important; }
        .ws { box-shadow: none !important; margin: 0 !important; max-width: none !important; border-radius: 0 !important; }
        @page { margin: 0.6in; }
        body { background: #fff; }
      }`}</style>

      <div className="ws mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Toolbar (screen only) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-midnight-900 px-6 py-3">
          <span className="text-sm text-silver-200">Your takeaway guide from class. Keep it, and download or print a copy.</span>
          <button
            onClick={() => window.print()}
            className="rounded-md bg-flame-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-flame-600"
          >
            Download / Print
          </button>
        </div>

        {/* Header */}
        <div className="border-b-2 border-flame-500/30 px-8 pb-5 pt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-flame-600">Real Estate Continuing Education</p>
          <h1 className="mt-2 text-3xl font-bold text-midnight-900 md:text-4xl">{title || 'Getting Real With AI'}</h1>
          <p className="mt-1 text-slate-600">Presented by Andrew Fowler, ANF Consulting. Tailored for luxury real estate professionals.</p>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
            The short version of what we covered, so you can start today. Keep it as your cheat sheet. When you
            are ready to put it to work for real, that is where ANF comes in.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-10 px-8 py-7">
          <Section
            n="01"
            title="How to talk to AI"
            lead="AI gives back what you put in. The skill is the ask. A strong prompt has four parts."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {PROMPT_PARTS.map(([label, desc, ex]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-flame-600">{label}</p>
                  <p className="mt-0.5 text-[15px] text-slate-800">{desc}</p>
                  <p className="mt-1 text-[14px] italic text-slate-500">{ex}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">A lazy ask</p>
                <p className="text-[15px] text-slate-500">{`"Write a listing."`}</p>
              </div>
              <div className="rounded-lg border border-flame-500/40 bg-flame-50 px-4 py-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-flame-600">The same ask, made sharp</p>
                <p className="text-[15px] text-slate-800">
                  {`"Act as an expert luxury real estate copywriter. The home is a 5,400 sq ft contemporary on the water, with floor-to-ceiling glass, a chef's kitchen, and a private dock, listed at $3.2M for a discerning buyer who values architecture and privacy. Write the description in three short paragraphs, refined and confident, ending with an invitation to arrange a private showing."`}
                </p>
              </div>
            </div>
            <TieIn>
              Most agents never get past a lazy ask. Briefing AI well is the whole skill, and it is the first thing
              we build with you in an AI coaching session.
            </TieIn>
          </Section>

          <Section
            n="02"
            title="Prompts worth stealing"
            lead="A few you can use today. Copy one, fill in the brackets, and paste it into ChatGPT or Claude."
          >
            <div className="space-y-3">
              {PROMPTS.map(([label, prompt]) => (
                <PromptCard key={label} label={label} prompt={prompt} />
              ))}
            </div>
            <TieIn>
              These are a starter set. The real edge is a full library tuned to your listings, your market, and your
              voice, so every draft sounds like you. That is what we build together.
            </TieIn>
          </Section>

          <Section
            n="03"
            title="Which AI tools to use"
            lead="You do not need ten apps. Pick one tool per job and actually use it. Here is a simple starting map."
          >
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-[1.1fr_1fr_1.3fr] bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <div className="px-3 py-2">The job</div>
                <div className="px-3 py-2">A tool to try</div>
                <div className="px-3 py-2">What it is good for</div>
              </div>
              {TOOLS.map(([job, tool, good]) => (
                <div key={job} className="grid grid-cols-[1.1fr_1fr_1.3fr] border-t border-slate-200 text-[15px]">
                  <div className="px-3 py-2 text-slate-800">{job}</div>
                  <div className="border-l border-slate-200 px-3 py-2 font-medium text-midnight-900">{tool}</div>
                  <div className="border-l border-slate-200 px-3 py-2 text-slate-600">{good}</div>
                </div>
              ))}
            </div>
            <p className="text-[15px] leading-relaxed text-slate-700">
              <span className="font-semibold text-midnight-900">Start with one.</span> If you adopt a single tool this
              month, make it ChatGPT or Claude for writing. It touches the most of your day.
            </p>
            <TieIn>
              Want these picked, set up, and connected to how you actually work, so they save real time? That is what
              AI setup and implementation handles.
            </TieIn>
          </Section>

          <Section
            n="04"
            title="How to show up in AI search"
            lead="Buyers and sellers now ask AI, who is a good agent near me? AI answers from your online footprint. Make yourself easy to find and easy to recommend."
          >
            <div className="space-y-2.5">
              {VISIBILITY.map((item) => (
                <div key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-800">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-flame-500 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="rounded-md border-l-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-[15px] text-slate-700">
              <span className="font-semibold text-slate-800">Your one liner, so AI can categorize you: </span>
              {`"I help buyers and sellers with luxury and waterfront homes in [your market]."`}
            </div>
            <TieIn>
              A clear website and helpful local content are what get you found and recommended. That
              is the core of what ANF builds for agents.
            </TieIn>
          </Section>

          <Section
            n="05"
            title="Run your business from one place"
            lead="The tools above are powerful, but they live in different tabs. The real shift is one system that runs your business, with AI built in and shaped around how you actually work."
          >
            <div className="space-y-2.5">
              {CRM_POINTS.map((item) => (
                <div key={item} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-800">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-flame-500 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <TieIn>
              This is the part most people do not know is possible. ANF builds custom CRMs around your business, for
              realtors and professionals in any field (lawyers, accountants, coaches, and more), with AI where it
              saves you time.
            </TieIn>
          </Section>

          {/* Call to action */}
          <section className="break-inside-avoid rounded-xl bg-midnight-900 px-6 py-6 text-white print:bg-slate-100 print:text-midnight-900">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-flame-400 print:text-flame-600">Your next step</p>
            <h2 className="mt-2 text-xl font-bold">Ready to put this to work?</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-silver-200 print:text-slate-600">
              This guide is the starting line. The results come from doing it consistently, set up right, and built
              around your business. That is the part we handle.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {SERVICES.map(([t, b]) => (
                <div key={t} className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 print:border-slate-300 print:bg-white">
                  <p className="text-[15px] font-semibold text-white print:text-midnight-900">{t}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-silver-300 print:text-slate-600">{b}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[15px] text-silver-200 print:text-slate-700">
              Book a free call at{' '}
              <span className="font-semibold text-flame-400 print:text-flame-600">anfconsult.com/book</span>. Mention
              this class and we will start with a quick strategy chat, no charge.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-8 py-5 text-sm text-slate-600">
          <span>Presented by Andrew Fowler · ANF Consulting</span>
          <span className="font-semibold text-flame-600">anfconsult.com</span>
        </div>
      </div>
    </div>
  )
}
