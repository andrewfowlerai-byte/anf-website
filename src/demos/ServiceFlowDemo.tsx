import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { WatchItWork } from '../components/WatchItWork'
import { CountUp } from '../components/CountUp'
import { DemoAssistant } from '../components/DemoAssistant'
import { useDemoToast, DemoToast } from '../components/DemoToast'

// Bespoke home-services demo (ServiceFlow). A bold dispatch board: today's route
// as a timeline with crew status, plus an incoming-requests queue. Its own
// orange identity and a layout shaped like a dispatcher's screen.

const ORANGE = '#ea580c'

type JobStatus = 'Done' | 'En route' | 'Scheduled'

interface Job {
  id: string
  time: string
  customer: string
  service: string
  crew: string
  value: string
  status: JobStatus
  address: string
  note: string
  fields: [string, string][]
}

const jobs: Job[] = [
  { id: 'j1', time: '8:00a', customer: 'S. Patel', service: 'Deck power-wash', crew: 'Dave', value: '$240', status: 'Done', address: 'Hudson', note: 'Wrapped on time. Invoice sent from the truck the second it was done, and the review request fired automatically at payment.', fields: [['Service', 'Exterior'], ['Crew', 'Dave'], ['Invoice', '#1043, paid'], ['Value', '$240'], ['Review', '5 stars, auto-sent']] },
  { id: 'j2', time: '9:30a', customer: 'R. Okafor', service: 'Water heater install', crew: 'Mike & Tony', value: '$1,950', status: 'En route', address: 'Twinsburg', note: 'Crew is on the way. The customer just got an on-my-way text with the crew names and an arrival window.', fields: [['Service', 'Plumbing'], ['Crew', 'Mike & Tony'], ['Window', '9:30 to 11:00a'], ['Value', '$1,950'], ['Status', 'En route']] },
  { id: 'j3', time: '1:00p', customer: 'L. Brooks', service: 'AC diagnostic', crew: 'Mike & Tony', value: '$450', status: 'Scheduled', address: 'Solon', note: 'Booked this morning off a missed call. The auto-text gave her a same-day slot before the office even opened.', fields: [['Service', 'HVAC'], ['Crew', 'Mike & Tony'], ['When', '1:00p today'], ['Value', '$450 est.'], ['Source', 'Missed call']] },
  { id: 'j4', time: '3:30p', customer: 'J. Nguyen', service: 'Gutter repair', crew: 'Dave', value: '$680', status: 'Scheduled', address: 'Aurora', note: 'Afternoon job. Materials are confirmed and on the truck. Customer reminder goes out an hour before.', fields: [['Service', 'Gutters'], ['Crew', 'Dave'], ['When', '3:30p today'], ['Value', '$680'], ['Status', 'Confirmed']] },
]

const requests = [
  { customer: 'M. Alvarez', service: 'Kitchen faucet replacement', when: '8:14a', note: 'Auto-text with a booking link sent in 40 seconds.' },
  { customer: 'D. Chen', service: 'Gutter cleaning', when: '7:02a', note: 'Replied and offered two open slots this week.' },
]

const quotes = [
  { customer: 'The Hartleys', service: 'Bathroom remodel', amount: '$8,400', status: 'Opened 3x' },
  { customer: 'R. Patel', service: 'Driveway resurfacing', amount: '$3,200', status: 'Follow-up due' },
]

const stats = [
  { label: 'Jobs today', value: '4' },
  { label: 'Quotes out', value: '$11.6k' },
  { label: 'Avg response', value: '11 min' },
  { label: '5-star reviews', value: '142' },
]

const statusStyle: Record<JobStatus, { dot: string; bg: string; text: string }> = {
  Done: { dot: '#16a34a', bg: '#dcfce7', text: '#15803d' },
  'En route': { dot: ORANGE, bg: '#ffedd5', text: '#c2410c' },
  Scheduled: { dot: '#64748b', bg: '#e2e8f0', text: '#475569' },
}

export function ServiceFlowDemo() {
  const [company, setCompany] = useState(() => { try { return localStorage.getItem('anf_service_co') || '' } catch { return '' } })
  const [openId, setOpenId] = useState<string | null>(null)
  const name = company.trim() || 'Summit Home Services'
  const save = (v: string) => { setCompany(v); try { localStorage.setItem('anf_service_co', v) } catch { /* ignore */ } }
  const open = jobs.find((j) => j.id === openId) || null
  const [toast, fireToast] = useDemoToast()
  const [extra, setExtra] = useState<{ id: string; customer: string; service: string; when: string; note: string }[]>([])
  const leadPool = [
    { customer: 'T. Walsh', service: 'Sump pump replacement', note: 'Auto-text with a booking link sent in 38 seconds.' },
    { customer: 'A. Romano', service: 'Roof leak, urgent', note: 'Replied instantly and offered a same-day slot.' },
    { customer: 'P. Singh', service: 'Water softener install', note: 'Qualified and a quote link went out automatically.' },
  ]
  const dropLead = () => {
    const p = leadPool[extra.length % leadPool.length]
    setExtra((prev) => [{ id: `x${prev.length}-${p.customer}`, when: 'Just now', ...p }, ...prev])
    fireToast('New lead answered in under a minute')
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 md:py-12">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/demos" className="text-silver-400 hover:text-silver-100 text-sm">← All demos</Link>
        <span className="text-xs tracking-[0.2em] uppercase text-silver-500">Home and service pros · interactive demo</span>
      </div>

      <div className="mb-4 rounded-xl border border-midnight-700/40 bg-midnight-900/40 p-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-silver-300 font-medium">See it as yours:</span>
        <input
          value={company}
          onChange={(e) => save(e.target.value)}
          placeholder="Your company (e.g. Patel Plumbing)"
          aria-label="Your company name"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none flex-1 min-w-[180px]"
        />
        <span className="text-xs text-silver-500">Updates live, and stays on your device.</span>
      </div>

      <DemoToast toast={toast} accent={ORANGE} />

      <DemoAssistant
        accent="#ea580c"
        name="ServiceFlow AI"
        greeting="Hey, I'm your ServiceFlow assistant. Ask about today's jobs, quotes, or leads."
        qa={[
          { q: "What's my day look like?", a: "Four jobs. The deck wash is done and paid. Mike and Tony are en route to the water heater install, then the 1pm AC diagnostic, and Dave has the gutter repair at 3:30. On-my-way texts are queued." },
          { q: "Any quotes to chase?", a: "The Hartleys' bathroom remodel, $8,400. They have opened it three times, a strong signal. Worth a call today, and a 5pm follow-up nudge is already queued." },
          { q: "Did I miss any leads?", a: "None. A missed call at 6:41 this morning got an auto-text with a same-day slot in 40 seconds, and she booked the 1pm before the office even opened." },
        ]}
      />

      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
        <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ background: '#1e293b' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white shrink-0" style={{ background: ORANGE }}>{name[0]?.toUpperCase()}</div>
            <div className="min-w-0">
              <p className="text-white font-bold leading-none truncate">{name}</p>
              <p className="text-[11px] mt-1 text-slate-400">Dispatch board · Thursday</p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold text-white shrink-0" style={{ background: ORANGE }}>Live</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 bg-white border-b border-slate-200">
          {stats.map((s) => (
            <div key={s.label} className="px-5 py-3.5">
              <p className="text-2xl font-bold text-slate-800"><CountUp value={s.value} /></p>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-5 gap-4 p-5">
          {/* Today's route */}
          <div className="md:col-span-3 rounded-xl bg-white border border-slate-200 p-5">
            <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: ORANGE }}>Today's route</p>
            <div className="space-y-0">
              {jobs.map((j, i) => {
                const st = statusStyle[j.status]
                return (
                  <button key={j.id} onClick={() => setOpenId(j.id)} className="w-full text-left flex gap-3 pb-4 last:pb-0 group">
                    <div className="flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full mt-1 shrink-0 ring-4 ring-white" style={{ background: st.dot }} />
                      {i < jobs.length - 1 && <span className="w-px flex-1 bg-slate-200 mt-1" />}
                    </div>
                    <div className="min-w-0 flex-1 rounded-lg border border-slate-200 group-hover:border-slate-400 p-3 transition-colors -mt-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800 leading-tight">{j.time} · {j.customer}</p>
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: st.bg, color: st.text }}>{j.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{j.service} · {j.address}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{j.crew} · {j.value}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right column: new requests + quotes */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: '#16a34a' }}>New requests</p>
                <button onClick={dropLead} className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white transition-transform hover:scale-105" style={{ background: ORANGE }}>+ Simulate a lead</button>
              </div>
              <div className="space-y-3">
                {extra.map((r) => (
                  <div key={r.id} className="rounded-lg border p-3" style={{ background: '#fff7ed', borderColor: '#fed7aa' }}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{r.service}</p>
                      <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ background: ORANGE }}>New</span>
                    </div>
                    <p className="text-xs text-slate-500">{r.customer} · {r.when}</p>
                    <p className="text-[11px] mt-1 leading-snug" style={{ color: '#c2410c' }}>{r.note}</p>
                  </div>
                ))}
                {requests.map((r) => (
                  <div key={r.customer} className="rounded-lg bg-green-50 border border-green-100 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{r.service}</p>
                      <span className="text-[11px] text-slate-400 shrink-0">{r.when}</span>
                    </div>
                    <p className="text-xs text-slate-500">{r.customer}</p>
                    <p className="text-[11px] mt-1 leading-snug" style={{ color: '#15803d' }}>{r.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-white border border-slate-200 p-5">
              <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: ORANGE }}>Quotes out</p>
              <div className="space-y-2.5">
                {quotes.map((q) => (
                  <div key={q.customer} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 leading-tight truncate">{q.service}</p>
                      <p className="text-[11px] text-slate-400">{q.customer} · {q.status}</p>
                    </div>
                    <span className="text-sm font-bold shrink-0" style={{ color: ORANGE }}>{q.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-silver-400 text-sm">
          {company.trim() ? `That is your company on it, ${name}. ` : ''}Your whole day, your crews, and every new lead answered in seconds, on one board.
        </p>
      </div>

      <WatchItWork
        accent="#ea580c"
        label="Watch a missed call become a booked job"
        steps={[
          { t: 'A missed call comes in at 6:41 AM', s: 'before the office opens' },
          { t: 'An auto-text offers a same-day slot in 40 seconds', s: 'the fast reply wins' },
          { t: "She books herself onto today's route", s: 'no phone tag' },
          { t: 'The job is on your board, crew assigned', s: 'you just show up' },
        ]}
      />

      {/* What's included */}
      <div className="mt-12 md:mt-16">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What's included</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Built around how the work actually gets done</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {[
            { h: 'Answer every lead in seconds', b: 'A new request from your site, Google, or a missed call gets an instant text back with a booking link, so the fast reply wins the job.' },
            { h: 'Quotes that follow up on their own', b: 'Build a quote with options, send it in a tap, and get pinged when they open it. A nudge is queued automatically if they go quiet.' },
            { h: 'The whole week on one board', b: 'See today\'s route, assign your crews, and know who is where at a glance. No more double-booking or the 7am "where am I" text.' },
            { h: 'Get paid before you leave the driveway', b: 'Send the invoice the second the job is done and take a card or ACH on the spot. No chasing checks, no net-30 limbo.' },
            { h: 'Reviews on autopilot', b: 'A review request fires automatically when payment lands, while the work is fresh. Your reputation compounds without you asking.' },
            { h: 'Every customer remembered', b: 'Property details, past jobs, and notes are right there when a repeat customer calls, so you pick up where you left off.' },
          ].map((f) => (
            <div key={f.h} className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40">
              <h3 className="text-lg font-display text-silver-100 mb-2">{f.h}</h3>
              <p className="text-silver-400 leading-relaxed text-sm">{f.b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-silver-300 mb-4">Want this, built around your crews and your jobs?</p>
        <BookCallButton size="lg" />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpenId(null)}>
          <div className="flex-1 bg-black/50" />
          <div className="w-full max-w-sm bg-white h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 text-white flex items-start justify-between gap-3" style={{ background: '#1e293b' }}>
              <div>
                <p className="text-lg font-bold leading-tight">{open.customer}</p>
                <p className="text-sm text-slate-300">{open.time} · {open.service}</p>
              </div>
              <button onClick={() => setOpenId(null)} aria-label="Close" className="text-white/60 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <span className="inline-block mb-4 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: statusStyle[open.status].bg, color: statusStyle[open.status].text }}>{open.status}</span>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{open.note}</p>
              <dl className="mt-4 space-y-0">
                {open.fields.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-slate-100 py-2.5">
                    <dt className="text-sm text-slate-400">{label}</dt>
                    <dd className="text-sm text-slate-700 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 w-full py-2.5 rounded-lg text-white text-sm font-semibold text-center" style={{ background: ORANGE }}>Sample job · demo only</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
