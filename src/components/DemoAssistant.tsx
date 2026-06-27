import { useEffect, useRef, useState } from 'react'

// A floating "Ask the AI" chat for the demos. Suggested questions, a typing
// indicator, and smart on-brand answers, all mock-first (scripted Q&A with a
// light keyword fallback). No backend, no API key, nothing to abuse. Each demo
// passes its own accent, name, greeting, and answers. It previews the real AI
// assistants ANF builds.

export interface QA { q: string; a: string }

type Msg = { role: 'a' | 'u'; text: string }

export function DemoAssistant({ accent, name, greeting, qa }: { accent: string; name: string; greeting: string; qa: QA[] }) {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'a', text: greeting }])
  const [typing, setTyping] = useState(false)
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => () => { timers.current.forEach((t) => clearTimeout(t)) }, [])
  useEffect(() => { scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }) }, [msgs, typing, open])

  const answerFor = (q: string): string => {
    const ql = q.toLowerCase().trim()
    const exact = qa.find((x) => x.q.toLowerCase() === ql)
    if (exact) return exact.a
    const kw = qa.find((x) => x.q.toLowerCase().split(/\s+/).some((w) => w.length > 4 && ql.includes(w)))
    if (kw) return kw.a
    return "Good question. In your live build I'd answer that straight from your real data. Want to see it with your own numbers in it? Andrew can have a working version in front of you fast, just book a quick call."
  }

  const ask = (q: string) => {
    if (typing || !q.trim()) return
    setMsgs((m) => [...m, { role: 'u', text: q }])
    setInput('')
    setTyping(true)
    const t = window.setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { role: 'a', text: answerFor(q) }])
    }, 1100)
    timers.current.push(t)
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask the AI assistant"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2.5 shadow-2xl text-white font-semibold text-sm transition-transform hover:scale-105"
        style={{ background: accent, boxShadow: `0 10px 30px -8px ${accent}aa` }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-white" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
        </span>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M12 2l1.6 4.9L18.5 8l-4.9 1.6L12 14l-1.6-4.4L5.5 8l4.9-1.1L12 2zM5 14l.9 2.6L8.5 18l-2.6.9L5 21.5 4.1 18.9 1.5 18l2.6-1.1L5 14z" /></svg>
        {open ? 'Close' : 'Ask the AI'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 w-[min(92vw,360px)] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col" style={{ background: '#0c1322', maxHeight: 'min(70vh, 560px)' }}>
          <div className="px-4 py-3 flex items-center justify-between gap-2 border-b border-white/10" style={{ background: `linear-gradient(120deg, ${accent}, ${accent}cc)` }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor"><path d="M12 2l1.6 4.9L18.5 8l-4.9 1.6L12 14l-1.6-4.4L5.5 8l4.9-1.1L12 2z" /></svg>
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold leading-none truncate">{name}</p>
                <p className="text-[11px] text-white/80 mt-0.5 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-300" /> AI assistant · online</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-white/80 hover:text-white text-xl leading-none">×</button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'u' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-snug"
                  style={m.role === 'u' ? { background: accent, color: '#fff', borderBottomRightRadius: 4 } : { background: '#1a2336', color: '#dbe2f0', borderBottomLeftRadius: 4 }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2.5 flex gap-1" style={{ background: '#1a2336', borderBottomLeftRadius: 4 }}>
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-3 pb-2 flex flex-wrap gap-1.5">
            {qa.map((x) => (
              <button key={x.q} onClick={() => ask(x.q)} disabled={typing} className="text-[11px] px-2.5 py-1 rounded-full border transition-colors disabled:opacity-50" style={{ borderColor: `${accent}66`, color: '#cbd5e1' }}>
                {x.q}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(input) }} className="p-2.5 border-t border-white/10 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              aria-label="Ask the assistant"
              className="flex-1 bg-[#1a2336] border border-white/10 focus:border-white/30 rounded-full px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none"
            />
            <button type="submit" aria-label="Send" disabled={typing || !input.trim()} className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 disabled:opacity-40" style={{ background: accent }}>
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M3 11l18-8-8 18-2-7-8-3z" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
