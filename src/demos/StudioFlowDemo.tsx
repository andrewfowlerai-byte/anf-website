import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { WatchItWork } from '../components/WatchItWork'
import { CountUp } from '../components/CountUp'
import { DemoAssistant } from '../components/DemoAssistant'

// Bespoke fitness demo (StudioFlow). A dark "studio display" with a class
// timetable as the hero and live capacity bars. Its own energetic identity,
// a different layout from every other demo. Its own world.

const LIME = '#22c55e'
const INK = '#0b1220'

interface Klass {
  id: string
  time: string
  name: string
  coach: string
  booked: number
  cap: number
  roster: string[]
  waitlist: number
}

const classes: Klass[] = [
  { id: 'cl1', time: '6:00a', name: 'Sunrise HIIT', coach: 'Jordan', booked: 12, cap: 16, roster: ['Bree K.', 'Chris D.', 'Alex M.', '+9 more'], waitlist: 0 },
  { id: 'cl2', time: '7:00a', name: 'Vinyasa Flow', coach: 'Maya', booked: 16, cap: 16, roster: ['Sofia B.', 'Tom R.', 'Dana W.', '+13 more'], waitlist: 3 },
  { id: 'cl3', time: '12:00p', name: 'Express Strength', coach: 'Andre', booked: 9, cap: 14, roster: ['James O.', 'Priya N.', 'Marcus T.', '+6 more'], waitlist: 0 },
  { id: 'cl4', time: '5:30p', name: 'Spin 45', coach: 'Riley', booked: 18, cap: 20, roster: ['Elena R.', 'Leo F.', 'Mia G.', '+15 more'], waitlist: 0 },
  { id: 'cl5', time: '6:00p', name: 'HIIT', coach: 'Jordan', booked: 14, cap: 16, roster: ['Sam P.', 'Dev R.', 'Kai L.', '+11 more'], waitlist: 0 },
  { id: 'cl6', time: '7:00p', name: 'Restore Yoga', coach: 'Maya', booked: 8, cap: 16, roster: ['Nia W.', 'Cole T.', 'Ari S.', '+5 more'], waitlist: 0 },
]

const stats = [
  { label: 'Active members', value: '142' },
  { label: 'Retention', value: '91%' },
  { label: 'Trials running', value: '7' },
  { label: 'Classes today', value: '6' },
]

const memberCards = [
  { tag: 'Converting', color: LIME, name: 'Jordan P.', detail: 'Trial day 5 of 7, 3 visits', note: 'Strong signal. The membership offer is timed to go out today while motivation is high.' },
  { tag: 'New member', color: '#38bdf8', name: 'Bree K.', detail: 'Joined Monday, Unlimited', note: 'First-month check-in is scheduled so she feels looked after before the early drop-off window.' },
  { tag: 'Win back', color: '#f59e0b', name: 'Tom R.', detail: 'No visit in 18 days', note: 'A friendly check-in text is drafted to reach him before the membership lapses.' },
]

export function StudioFlowDemo() {
  const [studio, setStudio] = useState(() => { try { return localStorage.getItem('anf_studio_name') || '' } catch { return '' } })
  const [openId, setOpenId] = useState<string | null>(null)
  const name = studio.trim() || 'Forge'
  const save = (v: string) => { setStudio(v); try { localStorage.setItem('anf_studio_name', v) } catch { /* ignore */ } }
  const open = classes.find((c) => c.id === openId) || null

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 md:py-12">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/demos" className="text-silver-400 hover:text-silver-100 text-sm">← All demos</Link>
        <span className="text-xs tracking-[0.2em] uppercase text-silver-500">Fitness and wellness · interactive demo</span>
      </div>

      <div className="mb-4 rounded-xl border border-midnight-700/40 bg-midnight-900/40 p-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-silver-300 font-medium">See it as yours:</span>
        <input
          value={studio}
          onChange={(e) => save(e.target.value)}
          placeholder="Your studio name (e.g. Iron Oak)"
          aria-label="Your studio name"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none flex-1 min-w-[180px]"
        />
        <span className="text-xs text-silver-500">Updates live, and stays on your device.</span>
      </div>

      <DemoAssistant
        accent="#22c55e"
        name="StudioFlow AI"
        greeting="Hey, I'm your StudioFlow assistant. Ask me about classes, members, or retention."
        qa={[
          { q: "Who's about to cancel?", a: "Tom R. No visit in 18 days on a 3x-per-week plan, the classic lapse pattern. I drafted a friendly check-in to reach him before he cancels, ready to send." },
          { q: "Which trials should I convert?", a: "Jordan P. Day 5 of 7 with three visits already, a strong buyer signal. The membership offer is timed to go out today while motivation is high." },
          { q: "How full is tonight?", a: "The 6pm HIIT has 14 of 16 booked, two spots left. Tomorrow's 7am yoga is full with 3 on the waitlist, and they get auto-texted the moment a spot opens." },
        ]}
      />

      {/* The studio display: dark, bold, energetic */}
      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: INK }}>
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-black text-lg" style={{ background: LIME }}>{name[0]?.toUpperCase()}</div>
            <div>
              <p className="text-white font-bold text-lg leading-none">{name} Studio</p>
              <p className="text-[11px] mt-1" style={{ color: '#7c8aa5' }}>Today · the floor at a glance</p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5" style={{ background: 'rgba(34,197,94,0.15)', color: LIME }}><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: LIME }} />Live</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5 border-b border-white/10">
          {stats.map((s) => (
            <div key={s.label} className="px-5 py-4">
              <p className="text-3xl font-black text-white tracking-tight"><CountUp value={s.value} /></p>
              <p className="text-[11px] uppercase tracking-wide mt-1" style={{ color: '#7c8aa5' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: LIME }}>Today's classes</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {classes.map((c) => {
              const pct = Math.round((c.booked / c.cap) * 100)
              const full = c.booked >= c.cap
              return (
                <button key={c.id} onClick={() => setOpenId(c.id)} className="text-left rounded-2xl p-4 border border-white/10 hover:border-white/25 transition-colors" style={{ background: '#111a2e' }}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold leading-tight">{c.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#7c8aa5' }}>{c.time} · {c.coach}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full shrink-0" style={full ? { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' } : { background: 'rgba(34,197,94,0.12)', color: LIME }}>{full ? `Waitlist ${c.waitlist}` : `${c.cap - c.booked} spots`}</span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: '#1f2a42' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: full ? '#fbbf24' : LIME }} />
                    </div>
                    <span className="text-xs tabular-nums" style={{ color: '#9fb0cc' }}>{c.booked}/{c.cap}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-xs uppercase tracking-[0.2em] mt-7 mb-3" style={{ color: LIME }}>Members the system is watching</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {memberCards.map((m) => (
              <div key={m.name} className="rounded-2xl p-4 border border-white/10" style={{ background: '#111a2e' }}>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: m.color }}>{m.tag}</span>
                <p className="text-white font-semibold mt-1 leading-tight">{m.name}</p>
                <p className="text-xs" style={{ color: '#7c8aa5' }}>{m.detail}</p>
                <p className="text-xs mt-2 leading-snug" style={{ color: '#9fb0cc' }}>{m.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-silver-400 text-sm">
          {studio.trim() ? `That is your studio on it, ${name}. ` : ''}The whole floor, your classes, and the members worth a nudge, on one screen.
        </p>
      </div>

      <WatchItWork
        accent="#22c55e"
        label="Watch a free trial turn into a member"
        steps={[
          { t: 'A trial member hits day 5, three visits in', s: 'a strong signal' },
          { t: 'A convert offer auto-sends at the perfect moment', s: 'while motivation is high' },
          { t: 'They upgrade to Unlimited from their phone', s: '$129 a month' },
          { t: 'New member, and you never had to chase', s: 'retention you can see' },
        ]}
      />

      {/* What's included */}
      <div className="mt-12 md:mt-16">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What's included</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Built around members, classes, and keeping people coming back</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {[
            { h: 'Turn trials into members', b: 'Every trial gets a welcome and a convert offer timed to the right day, so more of them stick around past week one instead of quietly disappearing.' },
            { h: 'Classes and bookings in one view', b: "See tonight's roster, open spots, and who is teaching at a glance. Waitlists and the spot-just-opened texts run themselves." },
            { h: 'Catch a member before they quit', b: 'When someone goes quiet, a friendly check-in is drafted automatically, so you win them back before they cancel.' },
            { h: 'Memberships and billing handled', b: 'Plans, renewals, and payments tracked in one place, with the awkward "your card failed" follow-ups handled for you.' },
            { h: 'Retention you can actually see', b: 'Know your real retention number and exactly who is at risk this week, instead of finding out when revenue dips.' },
            { h: 'Built for a studio, not a calendar', b: 'Assign coaches, manage the timetable, and fill classes from one screen made for how a studio actually runs.' },
          ].map((f) => (
            <div key={f.h} className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40">
              <h3 className="text-lg font-display text-silver-100 mb-2">{f.h}</h3>
              <p className="text-silver-400 leading-relaxed text-sm">{f.b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-silver-300 mb-4">Want this, built around your classes and your members?</p>
        <BookCallButton size="lg" />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpenId(null)}>
          <div className="flex-1 bg-black/50" />
          <div className="w-full max-w-sm h-full overflow-y-auto" style={{ background: INK }} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-lg font-bold leading-tight">{open.name}</p>
                <p className="text-sm" style={{ color: '#7c8aa5' }}>{open.time} · {open.coach}</p>
              </div>
              <button onClick={() => setOpenId(null)} aria-label="Close" className="text-white/60 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#1f2a42' }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.round((open.booked / open.cap) * 100)}%`, background: open.booked >= open.cap ? '#fbbf24' : LIME }} />
                </div>
                <span className="text-sm font-semibold text-white tabular-nums">{open.booked}/{open.cap}</span>
              </div>
              {open.waitlist > 0 && <p className="text-xs mb-4" style={{ color: '#fbbf24' }}>Full, with {open.waitlist} on the waitlist. When a spot opens, the first in line gets an auto-text.</p>}
              <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: '#7c8aa5' }}>Booked in</p>
              <div className="space-y-1.5">
                {open.roster.map((r) => (
                  <div key={r} className="text-sm text-white/90 rounded-lg px-3 py-2" style={{ background: '#111a2e' }}>{r}</div>
                ))}
              </div>
              <div className="mt-6 w-full py-2.5 rounded-lg text-black text-sm font-semibold text-center" style={{ background: LIME }}>Sample class · demo only</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
