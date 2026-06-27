import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { WatchItWork } from '../components/WatchItWork'

// Bespoke real estate demo. Its own navy-and-gold identity and a real
// multi-view app (Today, Listings, Pipeline, Showings), designed around one
// working agent's day. Not the shared engine; this niche gets its own world.

const NAVY = '#0f2447'
const GOLD = '#b4884d'

type View = 'today' | 'listings' | 'pipeline' | 'showings'

interface Listing {
  id: string
  address: string
  city: string
  price: string
  beds: number
  baths: number
  sqft: string
  status: 'Active' | 'Pending' | 'Coming soon' | 'Closed'
  dom: number
  showings: number
  photo: string
  blurb: string
  interested: string[]
}

interface Lead {
  id: string
  name: string
  role: 'Buyer' | 'Seller'
  detail: string
  source: string
  tag?: string
  note: string
  fields: [string, string][]
}

const PHOTO = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`

const listings: Listing[] = [
  { id: 'l1', address: '88 Lakeview Dr', city: 'Solon', price: '$675,000', beds: 4, baths: 3, sqft: '3,200', status: 'Active', dom: 11, showings: 3, photo: PHOTO('photo-1568605114967-8130f3a36994'), blurb: 'Updated colonial backing to woods. Showings strong, first weekend.', interested: ['The Hartleys', 'D. Chen'] },
  { id: 'l2', address: '142 Maple Ave', city: 'Pepper Pike', price: '$1,240,000', beds: 5, baths: 5, sqft: '5,400', status: 'Coming soon', dom: 0, photo: PHOTO('photo-1600596542815-ffad4c1539a9'), showings: 0, blurb: 'Luxury listing going live Friday. Pre-marketing to your buyer list now.', interested: ['2 pre-list inquiries'] },
  { id: 'l3', address: '27 Birch Run', city: 'Hudson', price: '$398,000', beds: 3, baths: 2, sqft: '1,850', status: 'Active', dom: 18, showings: 1, photo: PHOTO('photo-1570129477492-45c003edd2be'), blurb: '18 days on market and only one showing. A small price move would re-trigger alerts.', interested: ['R. Okafor'] },
  { id: 'l4', address: '510 Foxboro Ln', city: 'Twinsburg', price: '$312,000', beds: 3, baths: 2, sqft: '1,640', status: 'Pending', dom: 6, showings: 9, photo: PHOTO('photo-1605276374104-dee2a0ed3cd6'), blurb: 'Accepted offer in 6 days, 9 showings. Inspection scheduled.', interested: ['Under contract'] },
  { id: 'l5', address: '9 Quail Hollow', city: 'Chagrin Falls', price: '$835,000', beds: 4, baths: 4, sqft: '4,100', status: 'Active', dom: 4, showings: 5, photo: PHOTO('photo-1512917774080-9991f1c4c750'), blurb: 'Fresh to market and already five showings. Open house Sunday.', interested: ['The Reyes family', 'S. Patel'] },
  { id: 'l6', address: '331 Riverside', city: 'Rocky River', price: '$529,000', beds: 4, baths: 3, sqft: '2,750', status: 'Closed', dom: 0, showings: 14, photo: PHOTO('photo-1600585154340-be6161a56a0c'), blurb: 'Closed last week at 2% over ask. Review request sent automatically.', interested: ['Closed, $540,000'] },
]

const pipeline: { stage: string; leads: Lead[] }[] = [
  { stage: 'New leads', leads: [
    { id: 'p1', name: 'The Reyes family', role: 'Buyer', detail: 'Pre-approved, $450k', source: 'Zillow', tag: 'Hot', note: 'Auto-text replied in 2 minutes and booked a Saturday tour. Walked in already warm.', fields: [['Type', 'Buyer'], ['Budget', '$450,000'], ['Area', 'Solon, Twinsburg'], ['Pre-approved', 'Yes'], ['Source', 'Zillow'], ['Response', '2 minutes']] },
    { id: 'p2', name: 'D. Chen', role: 'Buyer', detail: 'First-time buyer', source: 'Website', note: 'Filled out the home-finder form. Needs a lender intro before touring.', fields: [['Type', 'Buyer'], ['Budget', '$300,000'], ['Area', 'Beachwood'], ['Source', 'Website'], ['Stage', 'Needs lender']] },
  ] },
  { stage: 'Touring', leads: [
    { id: 'p3', name: 'The Hartleys', role: 'Buyer', detail: 'Seen 4 homes', source: 'Referral', tag: 'Active', note: 'Loved 88 Lakeview. Comparing against one more before an offer.', fields: [['Type', 'Buyer'], ['Budget', '$700,000'], ['Seen', '4 homes'], ['Favorite', '88 Lakeview'], ['Source', 'Referral']] },
  ] },
  { stage: 'Offer in', leads: [
    { id: 'p4', name: 'S. Patel', role: 'Buyer', detail: 'Offer on 9 Quail Hollow', source: 'Open house', tag: '$820k', note: 'Offer submitted at $820k. Awaiting seller response by 6pm.', fields: [['Type', 'Buyer'], ['Offer', '$820,000'], ['On', '9 Quail Hollow'], ['Status', 'Awaiting response'], ['Source', 'Open house']] },
  ] },
  { stage: 'Under contract', leads: [
    { id: 'p5', name: 'R. Okafor', role: 'Buyer', detail: '510 Foxboro, closing soon', source: 'Past client', tag: 'Pending', note: 'Inspection done, appraisal ordered. Clear to close on track.', fields: [['Type', 'Buyer'], ['Home', '510 Foxboro'], ['Price', '$312,000'], ['Closes', 'In 19 days'], ['Source', 'Past client']] },
    { id: 'p6', name: '142 Maple sellers', role: 'Seller', detail: 'Listing agreement signed', source: 'Sphere', tag: 'Luxury', note: 'Signed to list at $1.24M. Photos Thursday, live Friday.', fields: [['Type', 'Seller'], ['Home', '142 Maple Ave'], ['List price', '$1,240,000'], ['Goes live', 'Friday'], ['Source', 'Sphere']] },
  ] },
]

const showings: { day: string; time: string; address: string; party: string }[] = [
  { day: 'Today', time: '2:00 PM', address: '88 Lakeview Dr', party: 'The Hartleys' },
  { day: 'Today', time: '5:30 PM', address: '9 Quail Hollow', party: 'The Reyes family' },
  { day: 'Thursday', time: '11:00 AM', address: '27 Birch Run', party: 'R. Okafor' },
  { day: 'Friday', time: '4:00 PM', address: '142 Maple Ave', party: 'Pre-list preview' },
  { day: 'Saturday', time: '10:00 AM', address: '9 Quail Hollow', party: 'Open house' },
  { day: 'Saturday', time: '1:00 PM', address: '88 Lakeview Dr', party: 'D. Chen' },
]

const kpis = [
  { label: 'Active listings', value: '7' },
  { label: 'Pipeline value', value: '$6.4M' },
  { label: 'Showings this week', value: '9' },
  { label: 'Avg lead response', value: '4 min' },
]

const priorities = [
  { tag: 'Call now', color: '#15803d', title: 'The Reyes family replied 2 minutes ago', sub: 'Pre-approved at $450k. Strike while it is warm.' },
  { tag: 'Showing', color: NAVY, title: '2:00 PM at 88 Lakeview with the Hartleys', sub: 'Their favorite so far. Bring the comps you pulled.' },
  { tag: 'Price check', color: '#b45309', title: '27 Birch Run has sat 18 days', sub: 'One showing. A $10k move would re-trigger buyer alerts.' },
  { tag: 'Follow up', color: GOLD, title: 'CMA promised to the 510 Maple seller today', sub: 'Draft is ready in your templates. One click to send.' },
]

const leadSources = [
  { label: 'Zillow', pct: 34 },
  { label: 'Website', pct: 22 },
  { label: 'Referral', pct: 18 },
  { label: 'Sphere', pct: 14 },
  { label: 'Open house', pct: 12 },
]

const activity: { text: string; when: string; color: string }[] = [
  { text: 'Auto-text replied to the Reyes family in 2 minutes', when: '2m', color: '#15803d' },
  { text: 'Review request sent after the Riverside closing', when: '1h', color: GOLD },
  { text: 'CMA delivered to the 142 Maple sellers', when: '3h', color: NAVY },
  { text: 'New Zillow lead captured and routed to you', when: '5h', color: '#15803d' },
  { text: 'Price-drop alert sent to 14 saved buyers on 27 Birch', when: '1d', color: '#b45309' },
]

const statusColor: Record<Listing['status'], { bg: string; text: string }> = {
  Active: { bg: '#dcfce7', text: '#15803d' },
  Pending: { bg: '#fef3c7', text: '#b45309' },
  'Coming soon': { bg: '#e7e0d3', text: '#8a6d3b' },
  Closed: { bg: '#e2e8f0', text: '#475569' },
}

export function RealEstateDemo() {
  const [view, setView] = useState<View>('today')
  const [listingId, setListingId] = useState<string | null>(null)
  const [leadId, setLeadId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState(() => { try { return localStorage.getItem('anf_demo_agent') || '' } catch { return '' } })
  const [agentMarket, setAgentMarket] = useState(() => { try { return localStorage.getItem('anf_demo_market') || '' } catch { return '' } })
  const fullName = agentName.trim() || 'Jordan Avery'
  const firstName = fullName.split(/\s+/)[0]
  const market = agentMarket.trim() || 'Cleveland East Side'
  const initials = fullName.split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase()
  const saveName = (v: string) => { setAgentName(v); try { localStorage.setItem('anf_demo_agent', v) } catch { /* ignore */ } }
  const saveMarket = (v: string) => { setAgentMarket(v); try { localStorage.setItem('anf_demo_market', v) } catch { /* ignore */ } }

  const listing = listings.find((l) => l.id === listingId) || null
  const lead = pipeline.flatMap((c) => c.leads).find((l) => l.id === leadId) || null
  const pipeMax = Math.max(...pipeline.map((c) => c.leads.length))
  const listingStatusCounts = (['Active', 'Pending', 'Coming soon', 'Closed'] as Listing['status'][]).map((label) => ({ label, n: listings.filter((l) => l.status === label).length }))

  const navItems: { id: View; label: string }[] = [
    { id: 'today', label: 'Dashboard' },
    { id: 'listings', label: 'Listings' },
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'showings', label: 'Showings' },
  ]

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 md:py-12">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/demos" className="text-silver-400 hover:text-silver-100 text-sm">← All demos</Link>
        <span className="text-xs tracking-[0.2em] uppercase text-silver-500">Real estate · interactive demo</span>
      </div>

      <div className="mb-4 rounded-xl border border-midnight-700/40 bg-midnight-900/40 p-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-silver-300 font-medium">See it as yours:</span>
        <input
          value={agentName}
          onChange={(e) => saveName(e.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none w-40"
        />
        <input
          value={agentMarket}
          onChange={(e) => saveMarket(e.target.value)}
          placeholder="Your market (e.g. Highland Heights)"
          aria-label="Your market"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none flex-1 min-w-[180px]"
        />
        <span className="text-xs text-silver-500">Updates live, and stays on your device.</span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-midnight-700/40 shadow-2xl flex flex-col md:flex-row bg-white text-slate-800 min-h-[580px]">
        <aside className="md:w-56 shrink-0 flex md:flex-col gap-1 p-3 md:p-4" style={{ background: NAVY }}>
          <div className="flex items-center gap-2.5 px-1 md:mb-5 mr-3 md:mr-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-semibold text-white shrink-0" style={{ background: GOLD }}>{initials}</div>
            <div className="hidden md:block min-w-0">
              <p className="text-sm font-semibold text-white leading-none truncate">{fullName}</p>
              <p className="text-[11px] mt-1 truncate" style={{ color: GOLD }}>Realtor · {market}</p>
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
                  style={on ? { background: 'rgba(180,136,77,0.18)', color: '#fff' } : { color: '#aab6cc' }}
                >
                  {n.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col bg-[#faf8f4]">
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-white">
            <p className="font-semibold text-slate-800 capitalize">{view === 'today' ? `Good morning, ${firstName}` : view}</p>
            <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full text-white shrink-0" style={{ background: GOLD }}>Live demo</span>
          </div>

          <div className="p-5 overflow-y-auto flex-1">
            {view === 'today' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {kpis.map((k) => (
                    <div key={k.label} className="rounded-xl bg-white border border-slate-200 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-400">{k.label}</p>
                      <p className="text-2xl font-semibold mt-1" style={{ color: NAVY }}>{k.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Needs you today</p>
                    <div className="space-y-2">
                      {priorities.map((p, i) => (
                        <div key={i} className="rounded-lg bg-[#faf8f4] p-3" style={{ borderLeftColor: p.color, borderLeftWidth: 3 }}>
                          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: p.color }}>{p.tag}</span>
                          <p className="text-sm font-medium text-slate-800 leading-tight mt-0.5">{p.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{p.sub}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">Commission this year</p>
                    <p className="text-2xl font-semibold" style={{ color: NAVY }}>$142k</p>
                    <p className="text-xs text-slate-400 mb-3">of $250k goal</p>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: '57%', background: GOLD }} /></div>
                    <p className="text-xs text-slate-500 mt-2">57% to goal, ahead of last year's pace.</p>
                  </div>

                  <button onClick={() => setView('pipeline')} className="text-left rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-400 transition-colors">
                    <div className="flex items-center justify-between mb-3"><p className="text-xs uppercase tracking-wider text-slate-400">Pipeline</p><span className="text-xs" style={{ color: GOLD }}>Open →</span></div>
                    <div className="space-y-1.5">
                      {pipeline.map((c) => (
                        <div key={c.stage} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-24 shrink-0 truncate">{c.stage}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.max(14, (c.leads.length / pipeMax) * 100)}%`, background: NAVY }} /></div>
                          <span className="text-xs text-slate-600 w-4 text-right">{c.leads.length}</span>
                        </div>
                      ))}
                    </div>
                  </button>

                  <button onClick={() => setView('listings')} className="text-left rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-400 transition-colors">
                    <div className="flex items-center justify-between mb-3"><p className="text-xs uppercase tracking-wider text-slate-400">Listings</p><span className="text-xs" style={{ color: GOLD }}>Open →</span></div>
                    <div className="grid grid-cols-2 gap-2">
                      {listingStatusCounts.map((s) => (
                        <div key={s.label} className="rounded-lg bg-[#faf8f4] px-3 py-2"><p className="text-lg font-semibold text-slate-800">{s.n}</p><p className="text-[11px] text-slate-500">{s.label}</p></div>
                      ))}
                    </div>
                  </button>

                  <div className="rounded-xl bg-white border border-slate-200 p-4">
                    <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">Where leads come from</p>
                    <div className="space-y-1.5">
                      {leadSources.map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-20 shrink-0">{s.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${s.pct * 2.6}%`, background: GOLD }} /></div>
                          <span className="text-xs text-slate-600 w-7 text-right">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 rounded-xl bg-white border border-slate-200 p-4">
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

                  <button onClick={() => setView('showings')} className="text-left rounded-xl bg-white border border-slate-200 p-4 hover:border-slate-400 transition-colors">
                    <div className="flex items-center justify-between mb-3"><p className="text-xs uppercase tracking-wider text-slate-400">This week</p><span className="text-xs" style={{ color: GOLD }}>Open →</span></div>
                    <div className="space-y-1.5">
                      {showings.slice(0, 4).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400 w-12 shrink-0 text-xs">{s.day === 'Today' ? s.time.replace(':00', '') : s.day.slice(0, 3)}</span>
                          <span className="text-slate-700 truncate">{s.address}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                </div>
              </div>
            )}

            {view === 'listings' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((l) => {
                  const sc = statusColor[l.status]
                  return (
                    <button key={l.id} onClick={() => setListingId(l.id)} className="text-left rounded-xl bg-white border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-32 bg-slate-200" style={{ background: `linear-gradient(135deg, ${NAVY}, #2b4a7a)` }}>
                        <img src={l.photo} alt="" className="w-full h-full object-cover" loading="lazy" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-800">{l.price}</p>
                          <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>{l.status}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-0.5">{l.address}</p>
                        <p className="text-xs text-slate-400">{l.city} · {l.beds} bd · {l.baths} ba · {l.sqft} sqft</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {view === 'pipeline' && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {pipeline.map((col) => (
                  <div key={col.stage} className="rounded-xl bg-white border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-xs font-semibold text-slate-600">{col.stage}</span>
                      <span className="text-[11px] text-slate-400">{col.leads.length}</span>
                    </div>
                    <div className="space-y-2">
                      {col.leads.map((ld) => (
                        <button key={ld.id} onClick={() => setLeadId(ld.id)} className="w-full text-left rounded-lg bg-[#faf8f4] border border-slate-200 hover:border-slate-400 p-3 transition-colors">
                          <p className="text-sm font-medium text-slate-800 leading-tight">{ld.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{ld.detail}</p>
                          {ld.tag && <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${GOLD}22`, color: '#8a6d3b' }}>{ld.tag}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === 'showings' && (
              <div className="space-y-4">
                {['Today', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                  const items = showings.filter((s) => s.day === day)
                  if (items.length === 0) return null
                  return (
                    <div key={day}>
                      <p className="text-xs uppercase tracking-wider text-slate-400 mb-2">{day}</p>
                      <div className="space-y-1.5">
                        {items.map((s, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-lg bg-white border border-slate-200 px-3 py-2.5 text-sm">
                            <span className="font-medium w-20 shrink-0" style={{ color: NAVY }}>{s.time}</span>
                            <span className="text-slate-700">{s.address}</span>
                            <span className="text-slate-400 ml-auto truncate">{s.party}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-silver-400 text-sm">
          {agentName.trim() ? `That is your name on it, ${firstName}. ` : ''}This is one agent's setup. Yours would be built around how you actually work.
        </p>
      </div>

      <WatchItWork
        accent="#b4884d"
        label="Watch a new lead turn into a booked tour"
        steps={[
          { t: 'A new Zillow lead lands: a pre-approved buyer', s: '9:14 AM' },
          { t: 'An auto-text replies and qualifies them in 2 minutes', s: 'while you slept' },
          { t: 'A Saturday tour books onto your calendar', s: 'they pick the time' },
          { t: 'The lead is in your pipeline, already warm', s: 'you never lifted a finger' },
        ]}
      />

      <div className="mt-12">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Why agents choose ANF</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Built around how you actually sell</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {[
            { h: 'Never let a lead go cold', b: 'An assistant answers and qualifies new leads in seconds, day or night, then hands you the ones worth a call. Slow response is where most agents quietly lose deals. Here it is handled.' },
            { h: 'One place, not five tabs', b: 'Leads, listings, showings, closings, and past clients in one system shaped to your day, instead of a CRM, a dialer, a scheduler, and a spreadsheet that never talk to each other.' },
            { h: 'You own it, you do not rent it', b: 'No per-seat fee that climbs as your team grows. ANF builds the system for you and it is yours, so the tool fits the agent instead of the agent fitting the tool.' },
            { h: 'One partner for the whole thing', b: 'Website, CRM, lead response, listing content and reels, and CE-credit AI training, from one team that knows real estate and your market. Not five vendors and a help desk.' },
          ].map((c) => (
            <div key={c.h} className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40">
              <h3 className="text-lg font-display text-silver-100 mb-2">{c.h}</h3>
              <p className="text-silver-400 leading-relaxed text-sm">{c.b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-silver-300 mb-4">Want to see it with your listings and your market in it? Let's build it.</p>
        <BookCallButton size="lg" />
      </div>

      {(listing || lead) && (
        <div className="fixed inset-0 z-50 flex" onClick={() => { setListingId(null); setLeadId(null) }}>
          <div className="flex-1 bg-black/50" />
          <div className="w-full max-w-sm bg-white text-slate-800 h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {listing && (
              <>
                <div className="h-44 bg-slate-200" style={{ background: `linear-gradient(135deg, ${NAVY}, #2b4a7a)` }}>
                  <img src={listing.photo} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }} />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xl font-semibold" style={{ color: NAVY }}>{listing.price}</p>
                      <p className="text-sm text-slate-600">{listing.address}, {listing.city}</p>
                    </div>
                    <button onClick={() => setListingId(null)} aria-label="Close" className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{listing.beds} bd · {listing.baths} ba · {listing.sqft} sqft</p>
                  <p className="mt-4 text-sm text-slate-600 bg-[#faf8f4] rounded-lg p-3 leading-relaxed">{listing.blurb}</p>
                  <dl className="mt-4 space-y-0">
                    <div className="flex justify-between border-b border-slate-100 py-2.5 text-sm"><dt className="text-slate-400">Status</dt><dd className="text-slate-700">{listing.status}</dd></div>
                    <div className="flex justify-between border-b border-slate-100 py-2.5 text-sm"><dt className="text-slate-400">Days on market</dt><dd className="text-slate-700">{listing.dom}</dd></div>
                    <div className="flex justify-between border-b border-slate-100 py-2.5 text-sm"><dt className="text-slate-400">Showings</dt><dd className="text-slate-700">{listing.showings}</dd></div>
                    <div className="flex justify-between py-2.5 text-sm"><dt className="text-slate-400">Interested</dt><dd className="text-slate-700 text-right">{listing.interested.join(', ')}</dd></div>
                  </dl>
                </div>
              </>
            )}
            {lead && (
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-800 leading-tight">{lead.name}</p>
                    <p className="text-sm text-slate-500">{lead.role} · {lead.detail}</p>
                  </div>
                  <button onClick={() => setLeadId(null)} aria-label="Close" className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
                </div>
                {lead.tag && <span className="inline-block mb-4 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${GOLD}22`, color: '#8a6d3b' }}>{lead.tag}</span>}
                <dl className="space-y-0">
                  {lead.fields.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm"><dt className="text-slate-400">{k}</dt><dd className="text-slate-700 text-right">{v}</dd></div>
                  ))}
                </dl>
                <p className="mt-4 text-sm text-slate-600 bg-[#faf8f4] rounded-lg p-3 leading-relaxed">{lead.note}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
