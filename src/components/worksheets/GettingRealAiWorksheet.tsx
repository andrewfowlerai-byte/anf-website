import { useEffect, useRef, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'anf-grwai-worksheet'

// ---- tiny field helpers ----------------------------------------------------

function useAnswers() {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    } catch {
      return {}
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
    } catch {
      /* ignore */
    }
  }, [answers])
  const set = (id: string, v: string) => setAnswers((a) => ({ ...a, [id]: v }))
  return { answers, set }
}

function Line({ value, onChange, placeholder, wide = false }: { value: string; onChange: (v: string) => void; placeholder?: string; wide?: boolean }) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${wide ? 'w-full' : 'min-w-[160px]'} rounded-md border border-slate-300 bg-white px-3 py-2 text-[15px] text-slate-900 placeholder-slate-400 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40`}
    />
  )
}

function Area({ value, onChange, placeholder, rows = 2 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full resize-none overflow-hidden rounded-md border border-slate-300 bg-white px-3 py-2 text-[15px] leading-relaxed text-slate-900 placeholder-slate-400 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40"
    />
  )
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed text-slate-800">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 flex-shrink-0 accent-flame-600" />
      <span>{children}</span>
    </label>
  )
}

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

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-1.5 text-sm font-semibold text-slate-700">{children}</p>
}

// ---- the worksheet ---------------------------------------------------------

export default function GettingRealAiWorksheet({ title }: { title?: string }) {
  const { answers, set } = useAnswers()
  const a = (id: string) => answers[id] || ''

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:p-0">
      <style>{`@media print {
        .no-print { display: none !important; }
        .ws { box-shadow: none !important; margin: 0 !important; max-width: none !important; border-radius: 0 !important; }
        textarea { overflow: visible !important; }
        @page { margin: 0.6in; }
        body { background: #fff; }
      }`}</style>

      <div className="ws mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Toolbar (screen only) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-midnight-900 px-6 py-3">
          <span className="text-sm text-silver-200">Fill it in, then download or print your copy. Your answers save automatically on this device.</span>
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
          <p className="mt-1 text-slate-600">A working session. Presented by Andrew Fowler, Coldwell Banker Schmidt Realty.</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              Name
              <input value={a('name')} onChange={(e) => set('name', e.target.value)} className="min-w-[180px] border-b border-slate-300 px-1 focus:border-flame-500 focus:outline-none" />
            </label>
            <label className="flex items-center gap-2">
              Date
              <input value={a('date')} onChange={(e) => set('date', e.target.value)} className="min-w-[120px] border-b border-slate-300 px-1 focus:border-flame-500 focus:outline-none" />
            </label>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-10 px-8 py-7">
          <Section
            n="01"
            title="How to talk to AI"
            lead="AI gives back what you put in. The skill is the ask. A strong prompt has four parts: a role for the AI, the context it needs, the one task you want, and the format you want it back in."
          >
            <div>
              <Label>Build a prompt to write a listing description for one of your properties.</Label>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><p className="mb-1 text-xs uppercase tracking-wider text-slate-500">Role</p><Line wide value={a('p_role')} onChange={(v) => set('p_role', v)} placeholder="e.g. an expert luxury real estate copywriter" /></div>
                <div><p className="mb-1 text-xs uppercase tracking-wider text-slate-500">Context</p><Line wide value={a('p_context')} onChange={(v) => set('p_context', v)} placeholder="the address, key features, the buyer" /></div>
                <div><p className="mb-1 text-xs uppercase tracking-wider text-slate-500">Task</p><Line wide value={a('p_task')} onChange={(v) => set('p_task', v)} placeholder="write the listing description" /></div>
                <div><p className="mb-1 text-xs uppercase tracking-wider text-slate-500">Format</p><Line wide value={a('p_format')} onChange={(v) => set('p_format', v)} placeholder="3 short paragraphs, warm tone" /></div>
              </div>
            </div>
            <div>
              <Label>Now write the full prompt in your own words.</Label>
              <Area value={a('p_full')} onChange={(v) => set('p_full', v)} rows={3} placeholder="Act as... Here is the property... Write... Give it back as..." />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>A lazy ask</Label><Area value={a('lazy')} onChange={(v) => set('lazy', v)} placeholder='e.g. "write a listing"' /></div>
              <div><Label>The same ask, made sharp</Label><Area value={a('sharp')} onChange={(v) => set('sharp', v)} /></div>
            </div>
          </Section>

          <Section
            n="02"
            title="Which AI tools to use"
            lead="You do not need ten apps. Pick one tool per job and actually use it. Match the job to a tool, then commit to one to start this week."
          >
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <div className="px-3 py-2">The job</div>
                <div className="px-3 py-2">A tool to try</div>
                <div className="px-3 py-2">When I'll use it</div>
              </div>
              {[
                ['Listings & descriptions', 'jt_listing', 'jw_listing'],
                ['Emails & follow-ups', 'jt_email', 'jw_email'],
                ['Social captions & content', 'jt_social', 'jw_social'],
                ['Market & neighborhood research', 'jt_research', 'jw_research'],
                ['Photo & video touch-ups', 'jt_media', 'jw_media'],
                ['Scheduling & admin', 'jt_admin', 'jw_admin'],
              ].map(([job, tId, wId]) => (
                <div key={tId} className="grid grid-cols-[1.1fr_1fr_1fr] border-t border-slate-200">
                  <div className="flex items-center px-3 py-2 text-[15px] text-slate-800">{job}</div>
                  <div className="border-l border-slate-200 p-1.5"><input value={a(tId)} onChange={(e) => set(tId, e.target.value)} className="w-full rounded px-2 py-1 text-[15px] text-slate-900 placeholder-slate-300 focus:bg-flame-50 focus:outline-none" placeholder="..." /></div>
                  <div className="border-l border-slate-200 p-1.5"><input value={a(wId)} onChange={(e) => set(wId, e.target.value)} className="w-full rounded px-2 py-1 text-[15px] text-slate-900 placeholder-slate-300 focus:bg-flame-50 focus:outline-none" placeholder="..." /></div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>The ONE tool I'll start using this week</Label><Line wide value={a('one_tool')} onChange={(v) => set('one_tool', v)} /></div>
              <div><Label>What I'll use it for first</Label><Line wide value={a('one_use')} onChange={(v) => set('one_use', v)} /></div>
            </div>
          </Section>

          <Section
            n="03"
            title="How to show up in AI search"
            lead="Buyers and sellers now ask AI 'who is a good agent in my area?'. AI answers from your online footprint. Make yourself easy to find and easy to recommend."
          >
            <div className="space-y-2.5">
              <Check checked={a('c_gbp') === 'yes'} onChange={(v) => set('c_gbp', v ? 'yes' : '')}>My Google Business Profile is complete and active.</Check>
              <Check checked={a('c_consistent') === 'yes'} onChange={(v) => set('c_consistent', v ? 'yes' : '')}>My name, area, and specialty read the same everywhere (Google, Zillow, Realtor, Instagram, my site).</Check>
              <Check checked={a('c_reviews') === 'yes'} onChange={(v) => set('c_reviews', v ? 'yes' : '')}>I have recent reviews and a habit of asking for them.</Check>
              <Check checked={a('c_plain') === 'yes'} onChange={(v) => set('c_plain', v ? 'yes' : '')}>My website states, in plain words, who I help and where.</Check>
              <Check checked={a('c_content') === 'yes'} onChange={(v) => set('c_content', v ? 'yes' : '')}>I publish helpful local content (neighborhood guides, market notes).</Check>
              <Check checked={a('c_cited') === 'yes'} onChange={(v) => set('c_cited', v ? 'yes' : '')}>I am mentioned or cited on local sites and partner pages.</Check>
            </div>
            <div><Label>My specialty and area in one sentence, so AI can categorize me.</Label><Area value={a('one_liner')} onChange={(v) => set('one_liner', v)} placeholder="I help people buy and sell luxury homes on Cleveland's east side." /></div>
            <div><Label>Three clients I'll ask for a review this week.</Label><Area value={a('review_list')} onChange={(v) => set('review_list', v)} rows={3} /></div>
          </Section>

          {/* Action plan */}
          <section className="break-inside-avoid rounded-xl bg-midnight-900 px-6 py-5 text-white print:bg-slate-100 print:text-midnight-900">
            <h2 className="text-lg font-bold">My next 7 days</h2>
            <p className="mt-1 text-sm text-silver-300 print:text-slate-600">Three concrete things I'll actually do.</p>
            <div className="mt-3 space-y-2">
              {['act1', 'act2', 'act3'].map((id, i) => (
                <div key={id} className="flex items-center gap-3">
                  <span className="text-flame-400 print:text-flame-600">{i + 1}.</span>
                  <input value={a(id)} onChange={(e) => set(id, e.target.value)} className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-[15px] text-white placeholder-silver-400 focus:border-flame-400 focus:outline-none print:border-slate-300 print:bg-white print:text-slate-900" />
                </div>
              ))}
            </div>
          </section>

          <div><Label>Notes</Label><Area value={a('notes')} onChange={(v) => set('notes', v)} rows={4} /></div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-8 py-5 text-sm text-slate-600">
          <span>Questions after class? Andrew Fowler</span>
          <span className="font-semibold text-flame-600">anfconsult.com</span>
        </div>
      </div>
    </div>
  )
}
