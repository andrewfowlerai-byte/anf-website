/* eslint-disable react-refresh/only-export-components -- context, hooks and formatters live beside the small components that use them */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { OnboardController } from '../../lib/onboarding/useOnboard'

/**
 * Small shared pieces for the onboarding form: the controller context, time and
 * size formatting (Eastern time, always), chips and button styles.
 */

export const OnboardContext = createContext<OnboardController | null>(null)

export function useOnboardCtx(): OnboardController {
  const c = useContext(OnboardContext)
  if (!c) throw new Error('OnboardContext missing')
  return c
}

const TZ = 'America/New_York'

function easternDay(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

/** "2:14 PM EDT" today, "Oct 16, 2:14 PM EDT" on another day. Eastern time. */
export function formatWhen(at: string | null | undefined): string {
  if (!at) return ''
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return ''
  const time = d.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })
  if (easternDay(d) === easternDay(new Date())) return time
  const day = d.toLocaleDateString('en-US', { timeZone: TZ, month: 'short', day: 'numeric' })
  return `${day}, ${time}`
}

/** "Oct 16" in Eastern time. */
export function formatDay(at: string | null | undefined): string {
  if (!at) return ''
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { timeZone: TZ, month: 'short', day: 'numeric' })
}

export function formatBytes(n: number): string {
  if (!n || n < 1) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`
  const mb = n / (1024 * 1024)
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`
}

export function plural(n: number, one: string, many: string): string {
  return `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`
}

export const inputBase =
  'w-full rounded-md border border-midnight-700 bg-midnight-900 px-3 py-2.5 text-base text-silver-100 placeholder:text-silver-600 ' +
  'focus:border-flame-500/70 focus:outline-none focus:ring-1 focus:ring-flame-500/40 disabled:opacity-60 transition-colors'

export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-md bg-flame-500 px-4 py-2.5 text-sm font-semibold text-midnight-950 ' +
  'hover:bg-flame-400 disabled:opacity-50 disabled:pointer-events-none transition-colors'

export const btnSecondary =
  'inline-flex items-center justify-center gap-2 rounded-md border border-midnight-500 px-4 py-2.5 text-sm font-medium text-silver-100 ' +
  'hover:border-silver-500 hover:bg-midnight-900 disabled:opacity-50 disabled:pointer-events-none transition-colors'

export const btnQuiet =
  'inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-sm text-silver-400 underline-offset-4 hover:text-silver-100 hover:underline disabled:opacity-50'

export function Chip({ tone = 'muted', children }: { tone?: 'needed' | 'owner' | 'ok' | 'muted' | 'warn'; children: ReactNode }) {
  const tones: Record<string, string> = {
    needed: 'border-flame-500/45 text-flame-300',
    owner: 'border-silver-500/50 text-silver-300',
    ok: 'border-emerald-400/40 text-emerald-300',
    warn: 'border-amber-300/40 text-amber-200',
    muted: 'border-midnight-500 text-silver-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-sm border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.06em] ${tones[tone]}`}>
      {children}
    </span>
  )
}

/** Re-renders the caller every `ms` while `active`, for "just now" and timed notes. */
export function useTick(ms: number, active = true): number {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setN((x) => x + 1), ms)
    return () => clearInterval(t)
  }, [ms, active])
  return n
}

/** True while the viewport is at least `px` wide. */
export function useMinWidth(px: number): boolean {
  const query = `(min-width: ${px}px)`
  const [ok, setOk] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setOk(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return ok
}

export function Spinner({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} animate-spin`} fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function CheckIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

/**
 * Intro text: lines that start with "- " become a bulleted list, other lines
 * paragraphs. Templates use it to keep long intros short and scannable.
 */
export function IntroText({ text, className = '' }: { text: string; className?: string }) {
  const blocks: ({ kind: 'p'; text: string } | { kind: 'ul'; items: string[] })[] = []
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith('- ')) {
      const last = blocks[blocks.length - 1]
      if (last && last.kind === 'ul') last.items.push(line.slice(2))
      else blocks.push({ kind: 'ul', items: [line.slice(2)] })
    } else blocks.push({ kind: 'p', text: line })
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((b, i) =>
        b.kind === 'p' ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="space-y-1.5">
            {b.items.map((item, j) => (
              <li key={j} className="flex gap-2.5">
                <span className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-flame-400" aria-hidden="true" />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}

/** The team link's full address on this site. */
export function teamLinkUrl(token: string): string {
  return `${window.location.origin}/onboard/${token}`
}

/** Copies text; `copied` is true for 2.5 s after a copy that worked. */
export function useCopy(): { copy: (text: string) => Promise<boolean>; copied: boolean } {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 2500)
    return () => clearTimeout(t)
  }, [copied])
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      return true
    } catch {
      return false
    }
  }
  return { copy, copied }
}
