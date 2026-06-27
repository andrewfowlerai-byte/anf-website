import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { WatchItWork } from '../components/WatchItWork'
import { CountUp } from '../components/CountUp'

// Bespoke coaching demo (CoachFlow). Its own teal identity and a real multi-view
// app (Dashboard, Clients, Schedule, Programs), built around one coach's week.
// Not the shared engine; this niche gets its own world.

const TEAL = '#0f766e'
const DEEP = '#0b3b39'
const AMBER = '#c2884d'

type View = 'today' | 'clients' | 'schedule' | 'programs'

type Status = 'On track' | 'New' | 'At risk' | 'Renewing'

interface Client {
  id: string
  name: string
  program: string
  done: number
  total: number
  next: string
  status: Status
  note: string
  fields: [string, string][]
}

const clients: Client[] = [
  { id: 'c1', name: 'Marcus Thompson', program: '12-week executive', done: 3, total: 12, next: 'Thu 10:00a', status: 'On track', note: 'Working on delegation and board presence. Last session: mapped his Q3 priorities. Action items were sent automatically right after.', fields: [['Program', '12-week executive'], ['Sessions', '3 of 12'], ['Next session', 'Thu 10:00a'], ['Investment', '$2,400'], ['Goal', 'Step into a VP role'], ['Started', '6 weeks ago']] },
  { id: 'c2', name: 'Elena Rivera', program: '8-week reset', done: 1, total: 8, next: 'Fri 1:00p', status: 'New', note: 'Just started. Intake notes flagged burnout and boundaries as the real work. Welcome sequence already went out.', fields: [['Program', '8-week reset'], ['Sessions', '1 of 8'], ['Next session', 'Fri 1:00p'], ['Investment', 'Paid in full'], ['Goal', 'Sustainable pace'], ['Source', 'Referral']] },
  { id: 'c3', name: 'Dana Whitfield', program: 'Group, 8 weeks', done: 7, total: 8, next: 'Renewal call', status: 'Renewing', note: 'Program ends in 9 days. She is a strong fit for the continuation track. Renewal offer is drafted and ready to send.', fields: [['Program', 'Group, 8 weeks'], ['Sessions', '7 of 8'], ['Ends', 'In 9 days'], ['Lifetime value', '$2,950'], ['Offer', '3-month continuation'], ['Likelihood', 'High']] },
  { id: 'c4', name: 'Priya Nair', program: 'Discovery', done: 0, total: 1, next: 'Today 3:00p', status: 'New', note: 'Discovery call today at 3. Came in from Instagram. Intake form is in, calendar hold confirmed. She walks in warm.', fields: [['Stage', 'Discovery call'], ['When', 'Today 3:00p'], ['Source', 'Instagram DM'], ['Goal', 'Career transition'], ['Package', 'To be set'], ['Notes', 'Intake completed']] },
  { id: 'c5', name: 'James Okoro', program: '12-week executive', done: 9, total: 12, next: 'Mon 9:00a', status: 'On track', note: 'Nearing the finish and thriving. Asked about bringing two of his directors into a team package. Worth a conversation.', fields: [['Program', '12-week executive'], ['Sessions', '9 of 12'], ['Next session', 'Mon 9:00a'], ['Investment', '$2,400'], ['Goal', 'Lead a 40-person org'], ['Upsell', 'Team package interest']] },
  { id: 'c6', name: 'Sofia Bianchi', program: '8-week reset', done: 4, total: 8, next: 'No session booked', status: 'At risk', note: 'Missed her last session and has not rebooked in 12 days. A warm, no-pressure check-in is drafted to reach her before momentum slips.', fields: [['Program', '8-week reset'], ['Sessions', '4 of 8'], ['Last seen', '12 days ago'], ['Status', 'Quiet'], ['Goal', 'Confidence'], ['Action', 'Check-in drafted']] },
]

const schedule: { day: string; time: string; client: string; type: string }[] = [
  { day: 'Today', time: '3:00 PM', client: 'Priya Nair', type: 'Discovery call' },
  { day: 'Thursday', time: '10:00 AM', client: 'Marcus Thompson', type: '1:1 executive' },
  { day: 'Thursday', time: '2:00 PM', client: 'Q3 Leadership cohort', type: 'Group live' },
  { day: 'Friday', time: '1:00 PM', client: 'Elena Rivera', type: '1:1 reset' },
  { day: 'Monday', time: '9:00 AM', client: 'James Okoro', type: '1:1 executive' },
  { day: 'Tuesday', time: '12:00 PM', client: 'Q3 Leadership cohort', type: 'Group live' },
]

const programs: { name: string; members: number; week: number; weeks: number; revenue: string; next: string }[] = [
  { name: 'Q3 Leadership cohort', members: 8, week: 4, weeks: 8, revenue: '$6,400', next: 'Tue 12:00p' },
  { name: 'Confidence bootcamp', members: 12, week: 1, weeks: 6, revenue: '$4,200', next: 'Wed 6:00p' },
  { name: 'Founder circle', members: 6, week: 6, weeks: 12, revenue: '$9,000', next: 'Thu 5:00p' },
]

const kpis = [
  { label: 'Active clients', value: '24' },
  { label: 'Monthly recurring', value: '$9,800' },
  { label: 'Sessions this week', value: '17' },
  { label: 'Retention', value: '94%' },
]

const priorities = [
  { tag: 'Prep', color: TEAL, title: '3:00 PM discovery call with a new inquiry', sub: 'Intake is in. Their goal and notes are pulled up and ready.' },
  { tag: 'Renew', color: AMBER, title: 'A group client wraps in 9 days', sub: 'Continuation offer is drafted. One click to send when you are ready.' },
  { tag: 'Win back', color: '#b45309', title: 'A reset client has gone quiet for 12 days', sub: 'A warm check-in is written and waiting, before momentum slips.' },
  { tag: 'Upsell', color: '#15803d', title: 'An executive client asked about a team package', sub: 'He wants to bring two directors in. Worth a quick proposal.' },
]

const sources = [
  { label: 'Referral', pct: 38 },
  { label: 'Instagram', pct: 24 },
  { label: 'Podcast', pct: 18 },
  { label: 'Website', pct: 12 },
  { label: 'Webinar', pct: 8 },
]

const activity: { text: string; when: string; color: string }[] = [
  { text: 'Action items from the Marcus session sent automatically', when: '1h', color: TEAL },
  { text: 'Renewal offer drafted for the group client wrapping up', when: '2h', color: AMBER },
  { text: 'Intake form completed by the 3pm discovery call', when: '4h', color: '#15803d' },
  { text: 'Welcome sequence delivered to the new 8-week client', when: '1d', color: TEAL },
  { text: 'Check-in drafted for the quiet reset client', when: '1d', color: '#b45309' },
]

const statusColor: Record<Status, { bg: string; text: string }> = {
  'On track': { bg: '#ccfbf1', text: '#0f766e' },
  New: { bg: '#dbeafe', text: '#1d4ed8' },
  'At risk': { bg: '#fee2e2', text: '#b91c1c' },
  Renewing: { bg: '#fef3c7', text: '#b45309' },
}

const features = [
  { h: 'Every client, ready before the call', b: 'Goals, history, and last session notes surface the moment you open a client, so you walk into every session already prepared instead of scrambling to remember where you left off.' },
  { h: 'Notes that follow up for you', b: 'Log what you covered and what is next. The client gets their action items and a reminder before the next session, sent automatically, so the work continues between sessions.' },
  { h: 'Packages and payments at a glance', b: 'See which session they are on and what they have paid without digging through email. Renewal time and unpaid balances never sneak up on you.' },
  { h: 'Run group programs without the chaos', b: 'Cohorts, rosters, weekly content, and revenue per group in one view, so a twelve-person program feels as calm and organized as a single client.' },
  { h: 'No-shows quietly disappear', b: 'Friendly reminders go out before every session on their own. Fewer empty slots, less awkward chasing, more sessions that actually happen.' },
  { h: 'Renewals drafted before they end', b: 'When a program is wrapping up, the continuation offer is already written and waiting for your okay, so no client quietly lapses because the moment passed.' },
]

function Avatar({ name }: { name: string }) {
  const initials = name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ background: TEAL }}>{initials}</div>
  )
}

export function CoachFlowDemo() {
  const [view, setView] = useState<View>('today')
  const [clientId, setClientId] = useState<string | null>(null)
  const [coachName, setCoachName] = useState(() => { try { return localStorage.getItem('anf_coach_name') || '' } catch { return '' } })
  const [coachFocus, setCoachFocus] = useState(() => { try { return localStorage.getItem('anf_coach_focus') || '' } catch { return '' } })
  const fullName = coachName.trim() || 'Taylor Brooks'
  const firstName = fullName.split(/\s+/)[0]
  const focus = coachFocus.trim() || 'Executive coaching'
  const initials = fullName.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()
  const saveName = (v: string) => { setCoachName(v); try { localStorage.setItem('anf_coach_name', v) } catch { /* ignore */ } }
  const saveFocus = (v: string) => { setCoachFocus(v); try { localStorage.setItem('anf_coach_focus', v) } catch { /* ignore */ } }

  const client = clients.find((c) => c.id === clientId) || null

  const navItems: { id: View; label: string }[] = [
    { id: 'today', label: 'Dashboard' },
    { id: 'clients', label: 'Clients' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'programs', label: 'Programs' },
  ]

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 md:py-12">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/demos" className="text-silver-400 hover:text-silver-100 text-sm">← All demos</Link>
        <span className="text-xs tracking-[0.2em] uppercase text-silver-500">Coaches and consultants · interactive demo</span>
      </div>

      <div className="mb-4 rounded-xl border border-midnight-700/40 bg-midnight-900/40 p-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-silver-300 font-medium">See it as yours:</span>
        <input
          value={coachName}
          onChange={(e) => saveName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none w-40"
        />
        <input
          value={coachFocus}
          onChange={(e) => saveFocus(e.target.value)}
          placeholder="Your focus (e.g. life coaching)"
          aria-label="Your focus"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none flex-1 min-w-[180px]"
        />
        <span className="text-xs text-silver-500">Updates live, and stays on your device.</span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-midnight-700/40 shadow-2xl flex flex-col md:flex-row bg-white text-slate-800 min-h-[580px]">
        <aside className="md:w-56 shrink-0 flex md:flex-col gap-1 p-3 md:p-4" style={{ background: DEEP }}>
          <div className="flex items-center gap-2.5 px-1 md:mb-5 mr-3 md:mr-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-white shrink-0" style={{ background: TEAL }}>{initials}</div>
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-semibold text-white leading-none truncate">{fullName}</p>
              <p className="text-[11px] mt-1 truncate" style={{ color: '#5eead4' }}>Coach · {focus}</p>
            </div>
          </div>
          <nav className="flex md:flex-col gap-1 flex-1">
            {navItems.map((n) => {
              const on = view === n.id
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  className="text-left px-3 py-2 rounded-lg text-sm transition-colors"
                  style={on ? { background: 'rgba(94,234,212,0.16)', color: '#fff' } : { color: '#9fc7c2' }}
                >
                  {n.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col bg-[#f6f8f7]">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-white">
            <p className="font-semibold text-slate-800 capitalize">{view === 'today' ? `Good morning, ${firstName}` : view}</p>
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full text-white shrink-0" style={{ background: TEAL }}>Live demo</span>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {view === 'today' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {kpis.map((k) => (
                    <div key={k.label} className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">{k.label}</p>
                      <p className="text-2xl font-semibold mt-1" style={{ color: TEAL }}><CountUp value={k.value} /></p>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Needs you today</p>
                    <div className="space-y-2">
                      {priorities.map((p, i) => (
                        <div key={i} className="rounded-lg bg-[#f6f8f7] p-3" style={{ borderLeftColor: p.color, borderLeftWidth: 3 }}>
                          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: p.color }}>{p.tag}</span>
                          <p className="text-sm font-medium text-slate-800 leading-tight mt-0.5">{p.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{p.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Revenue this month</p>
                    <p className="text-2xl font-semibold" style={{ color: TEAL }}>$9,800</p>
                    <p className="text-xs text-slate-400 mb-3">of $12,000 goal</p>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: '82%', background: AMBER }} /></div>
                    <p className="text-xs text-slate-500 mt-2">82% to goal, with three renewals still due.</p>
                  </div>

                  <button onClick={() => setView('clients')} className="text-left rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-400 transition-colors">
                    <div className="flex items-center justify-between mb-3"><p className="text-xs uppercase tracking-wider text-slate-400">Clients</p><span className="text-xs" style={{ color: AMBER }}>Open →</span></div>
                    <div className="space-y-1.5">
                      {(['On track', 'New', 'Renewing', 'At risk'] as Status[]).map((s) => {
                        const n = clients.filter((c) => c.status === s).length
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 w-20 shrink-0 truncate">{s}</span>
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(12, n * 22)}%`, background: TEAL }} /></div>
                            <span className="text-xs text-slate-600 w-4 text-right">{n}</span>
                          </div>
                        )
                      })}
                    </div>
                  </button>

                  <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Where clients come from</p>
                    <div className="space-y-1.5">
                      {sources.map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-20 shrink-0">{s.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.pct * 2.6}%`, background: AMBER }} /></div>
                          <span className="text-xs text-slate-600 w-7 text-right">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button onClick={() => setView('schedule')} className="text-left rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-400 transition-colors">
                    <div className="flex items-center justify-between mb-3"><p className="text-xs uppercase tracking-wider text-slate-400">This week</p><span className="text-xs" style={{ color: AMBER }}>Open →</span></div>
                    <div className="space-y-1.5">
                      {schedule.slice(0, 4).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400 w-14 shrink-0 text-xs">{s.day === 'Today' ? s.time.replace(':00', '') : s.day.slice(0, 3)}</span>
                          <span className="text-slate-700 truncate">{s.client}</span>
                        </div>
                      ))}
                    </div>
                  </button>

                  <div className="sm:col-span-2 lg:col-span-3 rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Recent activity</p>
                    <div className="space-y-2.5">
                      {activity.map((a, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color }} />
                          <p className="text-sm text-slate-600 leading-snug flex-1">{a.text}</p>
                          <span className="text-[11px] text-slate-400 shrink-0">{a.when}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'clients' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {clients.map((c) => {
                  const sc = statusColor[c.status]
                  return (
                    <button key={c.id} onClick={() => setClientId(c.id)} className="text-left rounded-xl bg-white border border-slate-200 p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 leading-tight truncate">{c.name}</p>
                          <p className="text-xs text-slate-500 truncate">{c.program}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: sc.bg, color: sc.text }}>{c.status}</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                          <span>{c.done} of {c.total} sessions</span>
                          <span>Next: {c.next}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.round((c.done / c.total) * 100)}%`, background: TEAL }} /></div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {view === 'schedule' && (
              <div className="space-y-4">
                {['Today', 'Thursday', 'Friday', 'Monday', 'Tuesday'].map((day) => {
                  const items = schedule.filter((s) => s.day === day)
                  if (items.length === 0) return null
                  return (
                    <div key={day}>
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">{day}</p>
                      <div className="space-y-1.5">
                        {items.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-sm">
                            <span className="font-medium w-20 shrink-0" style={{ color: TEAL }}>{s.time}</span>
                            <span className="text-slate-700 truncate">{s.client}</span>
                            <span className="text-slate-400 ml-auto truncate">{s.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {view === 'programs' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {programs.map((p) => (
                  <div key={p.name} className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="font-semibold text-slate-800 leading-tight">{p.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.members} members · {p.revenue}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span>Week {p.week} of {p.weeks}</span>
                        <span>Next live: {p.next}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.round((p.week / p.weeks) * 100)}%`, background: AMBER }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-silver-400 text-sm">
          {coachName.trim() ? `That is your name on it, ${firstName}. ` : ''}This is one coach's setup. Yours would be built around how you actually run your practice.
        </p>
      </div>

      <WatchItWork
        accent="#0f766e"
        label="Watch an inquiry become a booked client, on its own"
        steps={[
          { t: 'An inquiry comes in from Instagram', s: '9:02 AM' },
          { t: 'The intake form auto-sends and the calendar hold is confirmed', s: 'seconds later' },
          { t: 'A discovery call lands on your calendar for 3 PM', s: 'they pick the time' },
          { t: 'They arrive warm, with their goals and notes pulled up', s: 'you just show up' },
        ]}
      />

      {/* What's included */}
      <div className="mt-12 md:mt-16">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What's included</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Built around how coaching actually works</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {features.map((f) => (
            <div key={f.h} className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40">
              <h3 className="text-lg font-display text-silver-100 mb-2">{f.h}</h3>
              <p className="text-silver-400 leading-relaxed text-sm">{f.b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-silver-300 mb-4">Want this, built around your clients and your words?</p>
        <BookCallButton size="lg" />
      </div>

      {client && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setClientId(null)}>
          <div className="flex-1 bg-black/50" />
          <div className="w-full max-w-sm bg-white text-slate-800 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 text-white" style={{ background: DEEP }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0" style={{ background: TEAL }}>{client.name.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()}</div>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold leading-tight truncate">{client.name}</p>
                    <p className="text-sm truncate" style={{ color: '#5eead4' }}>{client.program}</p>
                  </div>
                </div>
                <button onClick={() => setClientId(null)} aria-label="Close" className="text-white/70 hover:text-white text-2xl leading-none">×</button>
              </div>
            </div>
            <div className="p-6">
              <span className="inline-block mb-4 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: statusColor[client.status].bg, color: statusColor[client.status].text }}>{client.status}</span>
              <p className="text-sm text-slate-600 bg-[#f6f8f7] rounded-lg p-3 leading-relaxed">{client.note}</p>
              <dl className="mt-4 space-y-0">
                {client.fields.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-slate-100 py-2.5">
                    <dt className="text-sm text-slate-400">{label}</dt>
                    <dd className="text-sm text-slate-700 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 w-full py-2.5 rounded-lg text-white text-sm font-medium text-center" style={{ background: TEAL }}>Sample client · demo only</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
