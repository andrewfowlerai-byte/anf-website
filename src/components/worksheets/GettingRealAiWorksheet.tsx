import { type ReactNode } from 'react'
import { Check } from 'lucide-react'

// Pre-filled takeaway guide for the "Getting Real With AI" CE class.
// Light on detail by design: it is a teaser that points to ANF services
// (AI coaching, website design, social media management) for the real work.

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

const PROMPT_PARTS: [string, string, string][] = [
  ['Role', 'Tell it who to be.', 'Act as an expert listing copywriter.'],
  ['Context', 'Give it the facts.', 'The address, the features, and who the buyer is.'],
  ['Task', 'Ask for one thing.', 'Write the listing description.'],
  ['Format', 'Say how you want it back.', 'Three short paragraphs, warm and confident.'],
]

const TOOLS: [string, string, string][] = [
  ['Listings & descriptions', 'ChatGPT or Claude', 'Drafts that sound like you, fast.'],
  ['Emails & follow-ups', 'ChatGPT or Claude', 'Replies and nurture notes in seconds.'],
  ['Social captions & graphics', 'Canva', 'Posts, captions, and carousels in one place.'],
  ['Daily social media content', 'Everlee', 'Daily AI posts and a streak to keep you consistent.'],
  ['Market & neighborhood research', 'Perplexity', 'Answers with sources you can check.'],
  ['Listing photos & video', 'CapCut', 'Quick reels and clean edits for social.'],
  ['Video without filming', 'HeyGen', 'AI presenter videos from a script, no camera needed.'],
  ['Notes & admin', 'ChatGPT or Claude', 'Turn a voice note into a plan.'],
]

const VISIBILITY: string[] = [
  'A complete, active Google Business Profile.',
  'Your name, area, and specialty read the same everywhere: Google, Zillow, Realtor.com, Instagram, your site.',
  'Recent reviews, and a habit of asking for them.',
  'A website that says, in plain words, who you help and where.',
  'Helpful local content: neighborhood guides and market notes.',
  'Mentions and links on local sites and partner pages.',
]

const SERVICES: [string, string][] = [
  ['AI coaching & setup', 'Prompts, tools, and workflows built around your day.'],
  ['Website design', 'A site that ranks, converts, and reads like you.'],
  ['Social media management', 'Daily content that keeps you visible.'],
]

// ---- the guide -------------------------------------------------------------

export default function GettingRealAiWorksheet({ title }: { title?: string }) {
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
          <p className="mt-1 text-slate-600">Presented by Andrew Fowler, Coldwell Banker Schmidt Realty.</p>
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
                  {`"Act as an expert real estate copywriter. The home is a 4 bed colonial in Highland Heights with a renovated kitchen and a wooded lot, priced for a young family. Write the description in three short paragraphs, warm and confident, ending with an invitation to book a showing."`}
                </p>
              </div>
            </div>
            <TieIn>
              A set of prompts built around your listings, your area, and your voice is what an AI coaching session
              sets up in an hour.
            </TieIn>
          </Section>

          <Section
            n="02"
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
            n="03"
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
              {`"I help people buy and sell homes on Cleveland's east side."`}
            </div>
            <TieIn>
              A clear website, steady social, and helpful local content are what get you found and recommended. That
              is the core of what ANF builds and runs for agents.
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
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
