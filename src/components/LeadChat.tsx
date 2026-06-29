import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

type Msg = { role: 'user' | 'assistant'; content: string }

const ENDPOINT = 'https://crm.anfconsult.com/api/lead-chat'
const GREETING =
  "Hi, I'm ANF's assistant. Tell me what you're working on (a website, a CRM, AI in your business) and I'll point you in the right direction, and make sure Andrew follows up."

/**
 * Floating AI lead-capture chat. Talks to the CRM's /api/lead-chat endpoint,
 * which qualifies the visitor, saves them as a Prospect in the CRM, and pings
 * Andrew the moment it has a name, a contact, and what they need.
 */
export function LeadChat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'assistant', content: GREETING }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs, busy, open])

  const send = async () => {
    const text = input.trim()
    if (!text || busy) return
    const next: Msg[] = [...msgs, { role: 'user', content: text }]
    setMsgs(next)
    setInput('')
    setBusy(true)
    try {
      // Drop the client-side greeting so the API gets a conversation that starts
      // with a user message.
      const wire = next.filter((m, i) => !(i === 0 && m.role === 'assistant'))
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: wire }),
      })
      const data = (await res.json().catch(() => ({}))) as { reply?: string }
      setMsgs((m) => [...m, { role: 'assistant', content: data.reply || 'Thanks. Andrew will be in touch.' }])
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', content: 'Sorry, I hit a snag. You can reach Andrew at anfconsult.com/book.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat with ANF"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-flame-500 hover:bg-flame-600 text-white pl-4 pr-5 py-3 shadow-flame-glow transition-colors"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm font-medium hidden sm:inline">Ask ANF</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[380px]">
          <div className="flex h-[78vh] sm:h-[560px] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-white/10 bg-midnight-900 shadow-2xl shadow-black/50">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-midnight-950/60 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-flame-500 to-flame-700 text-white text-xs font-bold">AI</span>
                <div>
                  <p className="text-sm font-medium text-silver-100 leading-tight">ANF Assistant</p>
                  <p className="text-[11px] text-silver-500 inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Replies in seconds
                  </p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-1.5 text-silver-400 hover:bg-white/5 hover:text-silver-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed ${m.role === 'user' ? 'bg-flame-500 text-white' : 'bg-white/[0.06] text-silver-300'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex justify-start">
                  <div className="flex gap-1 rounded-2xl bg-white/[0.06] px-3.5 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-silver-500" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-silver-500" style={{ animationDelay: '120ms' }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-silver-500" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send() } }}
                  rows={1}
                  placeholder="Type your message..."
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-midnight-950/60 px-3.5 py-2.5 text-[14px] text-silver-100 placeholder-silver-500 focus:border-flame-500/60 focus:outline-none"
                />
                <button
                  onClick={() => void send()}
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-flame-500 text-white hover:bg-flame-600 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-center text-[10px] text-silver-700">Powered by ANF Consulting</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
