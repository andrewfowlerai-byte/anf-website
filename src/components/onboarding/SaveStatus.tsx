import type { SaveStatus as Status } from '../../lib/onboarding/outbox'
import { CheckIcon, Spinner } from './ui'

/** The save pill in the top bar. Polite live region: it announces, never interrupts. */

function saveStatusText(s: Status): string {
  switch (s.kind) {
    case 'saved': return 'All changes saved'
    case 'saving': return `Saving ${s.count === 1 ? '1 change' : `${s.count} changes`}`
    case 'retrying': return 'Not saved yet. Trying again.'
    case 'offline': return 'Offline. Your answers are kept on this device and will send when you are back online.'
    case 'held': return 'Not sent yet. Your answers are kept on this device and will save when the form opens again.'
    case 'refused': return s.count === 1 ? '1 answer was not saved. See the note on it.' : `${s.count} answers were not saved. See the notes on them.`
    case 'preview': return 'Preview. Nothing is saved.'
  }
}

function shortText(s: Status): string {
  switch (s.kind) {
    case 'saved': return 'Saved'
    case 'saving': return 'Saving'
    case 'retrying': return 'Retrying'
    case 'offline': return 'Offline'
    case 'held': return 'Kept here'
    case 'refused': return 'Not saved'
    case 'preview': return 'Preview'
  }
}

export function SaveStatusPill({ status }: { status: Status }) {
  const tone =
    status.kind === 'saved' ? 'text-emerald-300 border-emerald-400/30'
      : status.kind === 'saving' || status.kind === 'preview' ? 'text-silver-300 border-midnight-500'
        : status.kind === 'refused' ? 'text-rose-300 border-rose-400/40'
          : 'text-amber-200 border-amber-300/40'
  const full = saveStatusText(status)
  return (
    <span role="status" aria-live="polite" title={full} className={`inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium ${tone}`}>
      {status.kind === 'saved' && <CheckIcon className="h-3 w-3 shrink-0" />}
      {status.kind === 'saving' && <Spinner className="h-3 w-3 shrink-0" />}
      {(status.kind === 'retrying' || status.kind === 'offline' || status.kind === 'held' || status.kind === 'refused') && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />}
      {status.kind === 'offline' || status.kind === 'held' ? (
        <>
          {/* A banner under the bar says the long version. */}
          <span className="truncate">{shortText(status)}</span>
          <span className="sr-only">{full}</span>
        </>
      ) : (
        <>
          <span className="hidden truncate xl:inline">{full}</span>
          <span className="truncate xl:hidden">{shortText(status)}</span>
          <span className="sr-only xl:hidden">{full}</span>
        </>
      )}
    </span>
  )
}
