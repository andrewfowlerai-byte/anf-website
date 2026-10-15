import { useState, type ReactNode } from 'react'
import { btnPrimary, btnSecondary } from './ui'

/** Full-page states for /onboard: loading, link not found, closed, offline, error. Calm, one clear next step. */

export const FOOTER_LINE =
  'Please never type passwords, card or bank numbers, Social Security numbers, or anything about a client. Your answers are private to you and ANF Consulting.'

export function FooterLine() {
  return <p className="mx-auto max-w-[62ch] py-8 text-center text-[12px] leading-relaxed text-silver-600">{FOOTER_LINE}</p>
}

function Shell({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#07102B] px-4">
      <div className="mx-auto w-full max-w-[560px] flex-1 pt-10 md:pt-16">
        <img src="/anf-wordmark.webp" alt="ANF Consulting" width={84} height={56} className="-ml-3 h-14 w-auto mix-blend-lighten" />
        <div className="mt-14 border-t border-midnight-800 pt-8">
          <p className="font-display text-[12px] uppercase tracking-[0.16em] text-silver-500">{eyebrow}</p>
          <h1 className="mt-3 font-display text-[28px] font-semibold leading-tight text-silver-100 [text-wrap:balance] md:text-[34px]">{title}</h1>
          <div className="mt-4 text-[16px] leading-relaxed text-silver-300">{children}</div>
        </div>
      </div>
      <FooterLine />
    </div>
  )
}

export function LoadingScreen({ slow, onRetry }: { slow: boolean; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#07102B]" aria-busy="true">
      <div className="h-14 border-b border-midnight-800" />
      <div className="mx-auto flex max-w-[1440px]">
        <div className="hidden w-72 shrink-0 space-y-3 border-r border-midnight-800 p-6 lg:block">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-3 rounded bg-midnight-900" style={{ width: `${55 + ((i * 37) % 40)}%` }} />)}
        </div>
        <div className="mx-auto w-full max-w-[720px] px-4 pt-10 md:px-8">
          {slow ? (
            <div role="status">
              <h1 className="font-display text-2xl font-semibold text-silver-100">This is taking longer than usual.</h1>
              <p className="mt-2 text-silver-400">Your connection may be slow. Anything you typed before is kept on this device.</p>
              <button type="button" className={`${btnPrimary} mt-5`} onClick={onRetry}>Try again</button>
            </div>
          ) : (
            <div className="space-y-4" role="status" aria-label="Loading your form">
              <div className="h-3 w-32 rounded bg-midnight-900" />
              <div className="h-8 w-2/3 rounded bg-midnight-900" />
              <div className="h-3 w-full rounded bg-midnight-900" />
              <div className="h-3 w-5/6 rounded bg-midnight-900" />
              <div className="mt-10 h-24 w-full rounded bg-midnight-900/70" />
              <div className="h-24 w-full rounded bg-midnight-900/70" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function NotFoundScreen() {
  return (
    <Shell eyebrow="Onboarding" title="This link does not work.">
      <p>It may have been replaced with a new one. Ask Andrew at ANF Consulting for the current link.</p>
    </Shell>
  )
}

export function ClosedScreen({ unsent }: { unsent: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <Shell eyebrow="Onboarding" title="This form is closed.">
      <p>
        If you need to add something, write to Andrew at{' '}
        <a className="text-flame-300 underline underline-offset-4" href="mailto:admin@anfconsult.com">admin@anfconsult.com</a>.
      </p>
      {unsent && (
        <div className="mt-6 rounded-md border border-amber-300/40 bg-amber-300/[0.06] p-4">
          <p className="text-[15px] text-amber-100">Some answers on this device were not sent before the form closed.</p>
          <button
            type="button"
            className={`${btnSecondary} mt-3`}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(unsent)
                setCopied(true)
              } catch {
                setCopied(false)
              }
            }}
          >
            {copied ? 'Copied' : 'Copy my unsent answers'}
          </button>
          {copied && <p className="mt-2 text-[13px] text-silver-400">Paste them into an email to Andrew.</p>}
        </div>
      )}
    </Shell>
  )
}

export function OfflineScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <Shell eyebrow="Onboarding" title="You are offline.">
      <p>Open this link again when you are back online.</p>
      <button type="button" className={`${btnSecondary} mt-6`} onClick={onRetry}>Try again</button>
    </Shell>
  )
}

export function ErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <Shell eyebrow="Onboarding" title="The form did not load.">
      <p>Check your connection and try again. Anything you typed before is kept on this device.</p>
      <button type="button" className={`${btnPrimary} mt-6`} onClick={onRetry}>Try again</button>
    </Shell>
  )
}
