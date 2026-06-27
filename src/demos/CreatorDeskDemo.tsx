import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { WatchItWork } from '../components/WatchItWork'
import { CountUp } from '../components/CountUp'
import { DemoAssistant } from '../components/DemoAssistant'
import { useDemoToast, DemoToast } from '../components/DemoToast'

// Bespoke creator demo (CreatorDesk). A vibrant plum-and-magenta content desk:
// a post calendar across platforms plus a brand-deal money pipeline. Its own
// look, its own layout. Nothing in common with the other demos.

const PINK = '#ec4899'
const PLUM = '#160e20'

const platformColor: Record<string, string> = {
  Instagram: '#e1306c',
  TikTok: '#22d3ee',
  YouTube: '#ef4444',
  X: '#94a3b8',
}

interface Post {
  id: string
  platform: keyof typeof platformColor | string
  when: string
  caption: string
  status: 'Scheduled' | 'Draft' | 'Posted'
  grad: string
}

const posts: Post[] = [
  { id: 'p1', platform: 'Instagram', when: 'Today 6:00p', caption: 'Launch reel: 3 things I wish I knew at 25', status: 'Scheduled', grad: 'linear-gradient(135deg,#f472b6,#a855f7)' },
  { id: 'p2', platform: 'TikTok', when: 'Tomorrow 12p', caption: 'Behind the scenes of the coffee shoot', status: 'Draft', grad: 'linear-gradient(135deg,#22d3ee,#6366f1)' },
  { id: 'p3', platform: 'YouTube', when: 'Thu 9:00a', caption: 'My full content workflow, start to finish', status: 'Scheduled', grad: 'linear-gradient(135deg,#fb7185,#ef4444)' },
  { id: 'p4', platform: 'Instagram', when: 'Fri 5:30p', caption: 'Skincare partner reel, take 2', status: 'Draft', grad: 'linear-gradient(135deg,#f59e0b,#ec4899)' },
  { id: 'p5', platform: 'X', when: 'Posted 2h ago', caption: 'Thread: how I price brand deals', status: 'Posted', grad: 'linear-gradient(135deg,#64748b,#334155)' },
]

interface Deal {
  id: string
  brand: string
  fee: string
  stage: 'Pitched' | 'Negotiating' | 'Booked'
  detail: string
  note: string
  fields: [string, string][]
}

const deals: Deal[] = [
  { id: 'd1', brand: 'Skincare co.', fee: '$2,500', stage: 'Negotiating', detail: '3 reels, counter sent', note: 'Your rate card and last campaign’s numbers auto-attached to the reply, so you countered with proof.', fields: [['Scope', '3 reels'], ['Their offer', '$2,000'], ['Your counter', '$2,500'], ['Usage', '60 days'], ['Status', 'Awaiting reply']] },
  { id: 'd2', brand: 'Coffee brand', fee: '$1,800', stage: 'Booked', detail: 'Due Friday', note: 'Deliverables, due date, and the paid usage window are tracked so nothing runs longer than you agreed.', fields: [['Deliverable', '1 reel, 2 stories'], ['Fee', '$1,800'], ['Due', 'Friday'], ['Usage', '30 days paid'], ['Status', 'In production']] },
  { id: 'd3', brand: 'Meal-kit co.', fee: '$2,800', stage: 'Pitched', detail: 'Cold pitch, media kit sent', note: 'Pitched with your media kit and best posts built in. A nudge is queued for day 4 if they go quiet.', fields: [['Deliverable', '2 reels'], ['Ask', '$2,800'], ['Sent', 'Yesterday'], ['Follow-up', 'Day 4 queued'], ['Status', 'Pitched']] },
  { id: 'd4', brand: 'Fitness app', fee: '$3,400', stage: 'Booked', detail: 'Due next week', note: 'Biggest deal of the month. Script approved, shoot booked, invoice scheduled for delivery.', fields: [['Deliverable', '3 reels'], ['Fee', '$3,400'], ['Due', 'Next Wed'], ['Usage', '90 days paid'], ['Status', 'Booked']] },
]

const stageColor: Record<Deal['stage'], string> = { Pitched: '#a855f7', Negotiating: '#f59e0b', Booked: '#22c55e' }

export function CreatorDeskDemo() {
  const [handle, setHandle] = useState(() => { try { return localStorage.getItem('anf_creator_handle') || '' } catch { return '' } })
  const [openId, setOpenId] = useState<string | null>(null)
  const tag = (handle.trim() || 'yourhandle').replace(/^@/, '')
  const save = (v: string) => { setHandle(v); try { localStorage.setItem('anf_creator_handle', v) } catch { /* ignore */ } }
  const open = deals.find((d) => d.id === openId) || null
  const [toast, fireToast] = useDemoToast()
  const [extra, setExtra] = useState<{ id: string; brand: string; fee: string; detail: string }[]>([])
  const dealPool = [
    { brand: 'Athleisure brand', fee: '$3,900', detail: 'Inbound, wants a 3-video series' },
    { brand: 'Travel app', fee: '$2,200', detail: 'DM inquiry, replied with your kit' },
    { brand: 'Local roaster', fee: '$1,500', detail: 'Repeat partner, easy yes' },
  ]
  const dropDeal = () => {
    const p = dealPool[extra.length % dealPool.length]
    setExtra((prev) => [{ id: `x${prev.length}-${p.brand}`, ...p }, ...prev])
    fireToast('New brand deal landed in your pipeline')
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-10 md:py-12">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/demos" className="text-silver-400 hover:text-silver-100 text-sm">← All demos</Link>
        <span className="text-xs tracking-[0.2em] uppercase text-silver-500">Creators and solopreneurs · interactive demo</span>
      </div>

      <div className="mb-4 rounded-xl border border-midnight-700/40 bg-midnight-900/40 p-3 flex flex-wrap items-center gap-3">
        <span className="text-sm text-silver-300 font-medium">See it as yours:</span>
        <input
          value={handle}
          onChange={(e) => save(e.target.value)}
          placeholder="Your handle (e.g. @maya.makes)"
          aria-label="Your handle"
          className="bg-midnight-950/60 border border-midnight-700/50 focus:border-flame-500 rounded-lg px-3 py-1.5 text-sm text-silver-100 placeholder:text-silver-500 outline-none flex-1 min-w-[180px]"
        />
        <span className="text-xs text-silver-500">Updates live, and stays on your device.</span>
      </div>

      <DemoToast toast={toast} accent={PINK} />

      <DemoAssistant
        accent="#ec4899"
        name="CreatorDesk AI"
        greeting="Hey, I'm your CreatorDesk assistant. Ask me about deals, pricing, or content."
        qa={[
          { q: "What's a fair price for this deal?", a: "For the skincare co.'s 3 reels with 60-day usage, your $2,500 counter is right. Your last campaign in that category performed well, so you have the proof to hold the number. It is attached to your reply." },
          { q: "What's due this week?", a: "Your launch reel goes out today at 6pm, script ready and caption drafted. Tomorrow's TikTok is still a draft, want the outline?" },
          { q: "Which deal is biggest?", a: "The fitness app at $3,400, due next Wednesday with 90-day paid usage. Script approved, shoot booked, invoice scheduled." },
        ]}
      />

      <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl" style={{ background: PLUM }}>
        <div className="px-6 py-5 flex items-center justify-between gap-3 border-b border-white/10" style={{ background: 'linear-gradient(120deg, rgba(236,72,153,0.18), rgba(168,85,247,0.10))' }}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black shrink-0" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>{tag[0]?.toUpperCase()}</div>
            <div className="min-w-0">
              <p className="text-white font-bold leading-none truncate">@{tag}</p>
              <p className="text-[11px] mt-1" style={{ color: '#c4b5d4' }}>84.2k followers · creator desk</p>
            </div>
          </div>
          <div className="hidden sm:flex gap-5 text-right">
            <div><p className="text-lg font-black text-white leading-none"><CountUp value="$18.2k" /></p><p className="text-[10px] uppercase tracking-wide mt-1" style={{ color: '#c4b5d4' }}>Active deals</p></div>
            <div><p className="text-lg font-black text-white leading-none"><CountUp value="5" /></p><p className="text-[10px] uppercase tracking-wide mt-1" style={{ color: '#c4b5d4' }}>Open pitches</p></div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: PINK }}>Content this week</p>
            <span className="text-[11px]" style={{ color: '#9b8aac' }}>Captions and hashtags drafted</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {posts.map((p) => (
              <div key={p.id} className="shrink-0 w-40 rounded-2xl overflow-hidden border border-white/10" style={{ background: '#1f1530' }}>
                <div className="h-24 relative" style={{ background: p.grad }}>
                  <span className="absolute top-2 left-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'rgba(0,0,0,0.35)' }}>{p.platform}</span>
                  <span className="absolute bottom-2 right-2 text-[9px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-full" style={{ background: p.status === 'Posted' ? 'rgba(34,197,94,0.9)' : p.status === 'Draft' ? 'rgba(245,158,11,0.9)' : 'rgba(0,0,0,0.45)', color: '#fff' }}>{p.status}</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-white/90 leading-snug line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.caption}</p>
                  <p className="text-[10px] mt-1.5" style={{ color: '#9b8aac' }}>{p.when}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-7 mb-3">
            <p className="text-xs uppercase tracking-[0.2em]" style={{ color: PINK }}>Brand deal pipeline</p>
            <button onClick={dropDeal} className="text-[11px] font-semibold px-2.5 py-1 rounded-full text-white transition-transform hover:scale-105" style={{ background: PINK }}>+ Simulate a deal</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {extra.map((d) => (
              <div key={d.id} className="rounded-2xl p-4 border" style={{ background: 'rgba(236,72,153,0.10)', borderColor: 'rgba(236,72,153,0.45)' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-semibold leading-tight">{d.brand}</p>
                  <span className="text-base font-black" style={{ color: '#f9a8d4' }}>{d.fee}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#c4b5d4' }}>{d.detail}</p>
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: PINK }}>New pitch</span>
              </div>
            ))}
            {deals.map((d) => (
              <button key={d.id} onClick={() => setOpenId(d.id)} className="text-left rounded-2xl p-4 border border-white/10 hover:border-white/25 transition-colors" style={{ background: '#1f1530' }}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-white font-semibold leading-tight">{d.brand}</p>
                  <span className="text-base font-black" style={{ color: '#f9a8d4' }}>{d.fee}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#9b8aac' }}>{d.detail}</p>
                <span className="inline-block mt-2 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full" style={{ background: `${stageColor[d.stage]}22`, color: stageColor[d.stage] }}>{d.stage}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-silver-400 text-sm">
          {handle.trim() ? `That is your handle on it, @${tag}. ` : ''}Your posts and your paid deals on one desk, so the creative actually pays.
        </p>
      </div>

      <WatchItWork
        accent="#ec4899"
        label="Watch a cold pitch turn into a paid deal"
        steps={[
          { t: 'You send a brand a pitch', s: 'one tap' },
          { t: 'Your media kit and best posts attach automatically', s: 'you look pro' },
          { t: 'A follow-up nudge queues for day 4', s: 'no inbox-refreshing' },
          { t: 'They reply, and the deal lands in your pipeline', s: '$2,800 booked' },
        ]}
      />

      {/* What's included */}
      <div className="mt-12 md:mt-16">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">What's included</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">Built around the deals and the content, not the busywork</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {[
            { h: 'Never lose track of a deal', b: 'Every brand pitch, negotiation, and booking on one pipeline, so you always know what is owed, due, and worth chasing today.' },
            { h: 'Negotiate from strength', b: 'Your rate card and past performance attach to every reply, so you counter with proof and book at your real rate instead of guessing.' },
            { h: 'A content calendar that ships', b: 'Plan posts, drafts, and due dates in one place. Captions and hashtags are drafted ahead of time, so posting day is calm.' },
            { h: 'Pitches that get answered', b: 'Send pitches with your media kit built in and a nudge queued if a brand goes quiet, so you get more replies, less inbox-refreshing.' },
            { h: 'Know what a deal is really worth', b: 'Fees, usage windows, and deliverables tracked per deal, so you never under-charge or forget what you agreed to.' },
            { h: 'The business behind the content', b: 'Followers and posts are the fun part. This runs the money and the deadlines so the creative work turns into a living.' },
          ].map((f) => (
            <div key={f.h} className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40">
              <h3 className="text-lg font-display text-silver-100 mb-2">{f.h}</h3>
              <p className="text-silver-400 leading-relaxed text-sm">{f.b}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-silver-300 mb-4">Want this, built around your content and your brand deals?</p>
        <BookCallButton size="lg" />
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setOpenId(null)}>
          <div className="flex-1 bg-black/50" />
          <div className="w-full max-w-sm h-full overflow-y-auto" style={{ background: PLUM }} onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-white/10 flex items-start justify-between gap-3">
              <div>
                <p className="text-white text-lg font-bold leading-tight">{open.brand}</p>
                <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full" style={{ background: `${stageColor[open.stage]}22`, color: stageColor[open.stage] }}>{open.stage}</span>
              </div>
              <button onClick={() => setOpenId(null)} aria-label="Close" className="text-white/60 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6">
              <p className="text-3xl font-black mb-3" style={{ color: '#f9a8d4' }}>{open.fee}</p>
              <p className="text-sm leading-relaxed rounded-lg p-3" style={{ background: '#1f1530', color: '#c4b5d4' }}>{open.note}</p>
              <dl className="mt-4 space-y-0">
                {open.fields.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-white/5 py-2.5">
                    <dt className="text-sm" style={{ color: '#9b8aac' }}>{label}</dt>
                    <dd className="text-sm text-white/90 text-right">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 w-full py-2.5 rounded-lg text-white text-sm font-semibold text-center" style={{ background: 'linear-gradient(135deg,#ec4899,#a855f7)' }}>Sample deal · demo only</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
