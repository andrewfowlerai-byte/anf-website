import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'

// Bespoke family demo (Family HQ). Deliberately NOT a CRM: a warm, calm
// household board with its own sage-and-clay identity. Its own world, its own
// layout, nothing in common with the dashboard-style demos.

const SAGE = '#5b7553'
const CLAY = '#c2683f'

const members = [
  { name: 'You', color: '#5b7553' },
  { name: 'Partner', color: '#c2683f' },
  { name: 'Mia', color: '#6b8cae' },
  { name: 'Leo', color: '#b08968' },
]

const today = [
  { time: '7:30a', who: 'Mia', what: 'School drop-off', by: 'You drive', dot: SAGE },
  { time: '9:00a', who: 'Leo', what: 'Pediatrician, annual checkup', by: 'Bring insurance card', dot: CLAY },
  { time: '3:15p', who: 'Both', what: 'School pickup', by: 'Partner drives', dot: '#6b8cae' },
  { time: '5:30p', who: 'Mia', what: 'Soccer practice, Field 3', by: 'Sarah carpools', dot: SAGE },
  { time: '6:30p', who: 'Family', what: 'Tacos for dinner', by: 'Everything is in the fridge', dot: CLAY },
]

const meals = [
  { day: 'Mon', meal: 'Tacos', note: 'tonight' },
  { day: 'Tue', meal: 'Sheet-pan chicken', note: '' },
  { day: 'Wed', meal: 'Leftovers', note: '' },
  { day: 'Thu', meal: 'Pasta night', note: '' },
  { day: 'Fri', meal: 'Homemade pizza', note: 'kids help' },
]

const kids = [
  { name: 'Mia', age: 'Grade 4', items: ['Soccer, Tue and Thu 5:30p', 'Reading log due Friday', 'Dentist next Thursday'] },
  { name: 'Leo', age: 'Grade 1', items: ['Checkup today at 9a', 'Science fair poster due Fri', 'Loves dinosaurs this week'] },
]

const appts = [
  { when: 'Today 9:00a', what: "Leo's checkup", who: 'Dr. Patel' },
  { when: 'Thu 4:00p', what: "Mia's dentist", who: 'Bright Smiles' },
  { when: 'Sat 11:00a', what: 'Family photos', who: 'Backyard' },
]

const initialErrands = [
  { id: 'e1', text: 'Grocery run (list is ready from the week of meals)', done: false },
  { id: 'e2', text: 'Renew car registration, due in 8 days', done: false },
  { id: 'e3', text: 'Replace furnace filter (16x25x1)', done: true },
  { id: 'e4', text: "Sign Mia's field trip form", done: false },
  { id: 'e5', text: 'Pick up dry cleaning', done: true },
]

function Avatar({ name, color }: { name: string; color: string }) {
  const initials = name === 'You' ? 'You' : name[0]
  return (
    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style={{ background: color }}>{initials}</div>
  )
}

export function FamilyHqDemo() {
  const [familyName, setFamilyName] = useState(() => { try { return localStorage.getItem('anf_family_name') || '' } catch { return '' } })
  const [errands, setErrands] = useState(initialErrands)
  const name = familyName.trim() || 'Brooks'
  const saveName = (v: string) => { setFamilyName(v); try { localStorage.setItem('anf_family_name', v) } catch { /* ignore */ } }
  const toggle = (id: string) => setErrands((prev) => prev.map((e) => (e.id === id ? { ...e, done: !e.done } : e)))
  const left = errands.filter((e) => !e.done).length

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 md:py-12">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/demos" className="text-silver-400 hover:text-silver-100 text-sm">← All demos</Link>
        <span className="text-xs tracking-[0.2em] uppercase text-silver-500">Parents and family · interactive demo</span>
      </div>

      <div className="mb-4 rounded-xl border border-midnight-700/40 bg-midnight-900/40 p-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-silver-300 font-medium">See it as yours:</span>
        <input
          value={familyName}
          onChange={(e) => saveName(e.target.value)}
          placeholder="Your family name (e.g. Garcia)"
          aria-label="Your family name"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none flex-1 min-w-[180px]"
        />
        <span className="text-xs text-silver-500">Updates live, and stays on your device.</span>
      </div>

      {/* The board: warm, rounded, calm. Nothing corporate. */}
      <div className="rounded-[28px] border border-[#e6dfcf] shadow-2xl p-5 md:p-7" style={{ background: '#f6f2e9' }}>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-display" style={{ color: '#3f3a2f' }}>The {name} Family HQ</h2>
            <p className="text-sm mt-0.5" style={{ color: '#8a8064' }}>Thursday · everyone is where they need to be</p>
          </div>
          <div className="flex -space-x-2">
            {members.map((m) => (
              <div key={m.name} className="ring-2 ring-[#f6f2e9] rounded-full"><Avatar name={m.name} color={m.color} /></div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-4">
          {/* Today timeline */}
          <div className="md:col-span-3 rounded-2xl bg-[#fffdf8] border border-[#ece4d2] p-5">
            <p className="text-xs uppercase tracking-[0.2em] mb-4" style={{ color: CLAY }}>Today</p>
            <div className="space-y-0">
              {today.map((t, i) => (
                <div key={i} className="flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: t.dot }} />
                    {i < today.length - 1 && <span className="w-px flex-1 bg-[#ece4d2] mt-1" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-semibold" style={{ color: '#3f3a2f' }}>{t.time}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#efe9da', color: '#8a8064' }}>{t.who}</span>
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: '#544e3f' }}>{t.what}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#a39a7e' }}>{t.by}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: errands + appointments */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-2xl bg-[#fffdf8] border border-[#ece4d2] p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs uppercase tracking-[0.2em]" style={{ color: SAGE }}>Errands</p>
                <span className="text-xs" style={{ color: '#a39a7e' }}>{left} left</span>
              </div>
              <div className="space-y-2">
                {errands.map((e) => (
                  <button key={e.id} onClick={() => toggle(e.id)} className="w-full flex items-start gap-2.5 text-left group">
                    <span className="mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors" style={{ borderColor: e.done ? SAGE : '#d6cdb6', background: e.done ? SAGE : 'transparent' }}>
                      {e.done && <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </span>
                    <span className="text-sm leading-snug" style={{ color: e.done ? '#b3aa8e' : '#544e3f', textDecoration: e.done ? 'line-through' : 'none' }}>{e.text}</span>
                  </button>
                ))}
              </div>
              <p className="text-[11px] mt-3" style={{ color: '#a39a7e' }}>Tap to check one off.</p>
            </div>

            <div className="rounded-2xl bg-[#fffdf8] border border-[#ece4d2] p-5">
              <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: '#6b8cae' }}>Coming up</p>
              <div className="space-y-2.5">
                {appts.map((a, i) => (
                  <div key={i} className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold w-20 shrink-0" style={{ color: '#6b8cae' }}>{a.when}</span>
                    <div className="min-w-0">
                      <p className="text-sm leading-tight" style={{ color: '#544e3f' }}>{a.what}</p>
                      <p className="text-xs" style={{ color: '#a39a7e' }}>{a.who}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Meals row */}
          <div className="md:col-span-3 rounded-2xl bg-[#fffdf8] border border-[#ece4d2] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.2em]" style={{ color: CLAY }}>This week's dinners</p>
              <span className="text-[11px]" style={{ color: '#a39a7e' }}>Grocery list builds itself</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {meals.map((m) => (
                <div key={m.day} className="rounded-xl p-3 text-center" style={{ background: m.note === 'tonight' ? '#f4e3d3' : '#f6f2e9' }}>
                  <p className="text-[11px] font-semibold" style={{ color: '#a39a7e' }}>{m.day}</p>
                  <p className="text-sm mt-1 leading-tight" style={{ color: '#3f3a2f' }}>{m.meal}</p>
                  {m.note && <p className="text-[10px] mt-1" style={{ color: CLAY }}>{m.note}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Kids */}
          <div className="md:col-span-2 rounded-2xl bg-[#fffdf8] border border-[#ece4d2] p-5">
            <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: SAGE }}>The kids</p>
            <div className="space-y-4">
              {kids.map((k) => (
                <div key={k.name}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Avatar name={k.name} color={k.name === 'Mia' ? '#6b8cae' : '#b08968'} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#3f3a2f' }}>{k.name}</p>
                      <p className="text-[11px]" style={{ color: '#a39a7e' }}>{k.age}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 ml-1">
                    {k.items.map((it) => (
                      <li key={it} className="text-xs flex items-start gap-1.5" style={{ color: '#544e3f' }}>
                        <span className="mt-1 w-1 h-1 rounded-full shrink-0" style={{ background: CLAY }} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-silver-400 text-sm">
          {familyName.trim() ? `That is your family on it, the ${name}s. ` : ''}A calm command center for the whole household, not another chore app.
        </p>
      </div>

      {/* What's included */}
      <div className="mt-12 md:mt-16">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What's included</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">The whole household, finally on one calm board</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {[
            { h: "Everyone's week in one place", b: "Kids, work, appointments, and activities on a single shared board, so the whole week stops living only in one parent's head." },
            { h: 'Carpool and handoffs, sorted', b: 'Who drives, who picks up, where to be and when, all written down instead of texted at the last minute.' },
            { h: 'Meals plan the grocery list for you', b: 'Set the week of dinners once and the shopping list builds itself. Less "what is for dinner" every single night.' },
            { h: 'Nothing important slips', b: 'Appointments, renewals, and school forms get a reminder the night before with everything you need to bring.' },
            { h: 'The recurring stuff remembers itself', b: 'Registrations, filters, and seasonal tasks resurface on time, so they never pile up into a stressful weekend.' },
            { h: 'Calm, not another chore app', b: 'Built to lower the mental load on the household, not add one more thing to manage.' },
          ].map((f) => (
            <div key={f.h} className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40">
              <h3 className="text-lg font-display text-silver-100 mb-2">{f.h}</h3>
              <p className="text-silver-400 leading-relaxed text-sm">{f.b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-silver-300 mb-4">Want this, built around your household and your week?</p>
        <BookCallButton size="lg" />
      </div>
    </section>
  )
}
