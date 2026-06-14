import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Lock, Ticket, Loader2, BookOpen } from 'lucide-react'
import { listUpcomingPublicEvents, lookupPrivateEvent, type AnfEvent } from '../lib/events'

export function Events() {
  const [publicEvents, setPublicEvents] = useState<AnfEvent[]>([])
  const [loadingPublic, setLoadingPublic] = useState(true)

  const [code, setCode] = useState('')
  const [unlockedEvent, setUnlockedEvent] = useState<AnfEvent | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listUpcomingPublicEvents()
      .then((data) => { if (!cancelled) setPublicEvents(data) })
      .finally(() => { if (!cancelled) setLoadingPublic(false) })
    return () => { cancelled = true }
  }, [])

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setUnlocking(true)
    setCodeError(null)
    setUnlockedEvent(null)
    try {
      const ev = await lookupPrivateEvent(code)
      if (!ev) {
        setCodeError("That code doesn't match a current private event. Double-check it with whoever invited you.")
      } else {
        setUnlockedEvent(ev)
      }
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 md:pt-24 pb-12 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Events</p>
        <h1 className="text-4xl md:text-6xl font-display text-silver-100 leading-tight">
          Workshops, classes, and gatherings.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-silver-400 max-w-2xl mx-auto leading-relaxed">
          Open sessions, invite-only roundtables, and the occasional dinner. Public events are listed below. If you have a private code, unlock yours next.
        </p>
      </section>

      {/* Public events */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl md:text-3xl font-display text-silver-100 mb-8 text-center">
          Upcoming public events
        </h2>

        {loadingPublic ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-flame-400 animate-spin" />
          </div>
        ) : publicEvents.length === 0 ? (
          <div className="border border-dashed border-midnight-700/60 rounded-2xl px-8 py-12 text-center bg-midnight-900/40">
            <Calendar className="w-6 h-6 text-flame-400/60 mx-auto mb-3" />
            <p className="text-silver-300 font-display text-lg">No public events right now.</p>
            <p className="text-silver-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              Check back soon, or use the code from your invitation below to unlock a private event.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {publicEvents.map((ev) => (
              <div key={ev.id} className="w-full md:w-[calc(50%-0.75rem)] max-w-xl">
                <EventCard event={ev} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Private code unlock */}
      <section className="max-w-2xl mx-auto px-6 pb-24">
        <div className="rounded-2xl border border-flame-500/30 bg-midnight-900/40 p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-flame-400" />
            <p className="text-xs tracking-[0.3em] uppercase text-flame-500">Private invitation</p>
          </div>
          <h2 className="text-2xl md:text-3xl font-display text-silver-100 mb-3">
            Have a private event code?
          </h2>
          <p className="text-silver-400 text-sm md:text-base leading-relaxed mb-5">
            Type the code from your invitation to unlock event details and grab your seat.
          </p>
          <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ENTER CODE"
              maxLength={32}
              autoComplete="off"
              className="flex-1 bg-midnight-950/60 border border-midnight-700 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40 rounded-md px-4 py-3 text-silver-100 placeholder-silver-500 font-mono uppercase tracking-wider transition-colors"
            />
            <button
              type="submit"
              disabled={unlocking || !code.trim()}
              className="bg-flame-500 hover:bg-flame-600 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-md shadow-flame-glow transition-all inline-flex items-center justify-center gap-1.5"
            >
              {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Unlock event
            </button>
          </form>
          {codeError && <p className="text-sm text-flame-400 mt-3">{codeError}</p>}
        </div>

        {unlockedEvent && (
          <div className="mt-8">
            <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3 text-center">Your private event</p>
            <EventCard event={unlockedEvent} highlight />
          </div>
        )}
      </section>
    </>
  )
}

// ─── Event Card ──────────────────────────────────────────────────────────

function EventCard({ event, highlight = false }: { event: AnfEvent; highlight?: boolean }) {
  const start = new Date(event.starts_at)
  const dateLine = start.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  const timeLine = start.toLocaleTimeString(undefined, {
    hour: 'numeric', minute: '2-digit',
  })

  const isFree = event.price_cents === 0
  const ctaLabel = isFree ? 'RSVP' : 'Get tickets'
  const ctaUrl = !isFree && event.payment_link_url
    ? event.payment_link_url
    : event.rsvp_url
    ? event.rsvp_url
    : 'mailto:anfaiconsulting@gmail.com?subject=Event RSVP'

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-midnight-900/40 transition-colors ${
        highlight
          ? 'border-flame-500/60 shadow-[0_0_40px_-10px_rgba(242,107,29,0.45)]'
          : 'border-midnight-700/50 hover:border-flame-500/40'
      }`}
    >
      {event.cover_image_url && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-midnight-950">
          <img
            src={event.cover_image_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6 md:p-7">
        {event.visibility === 'private' && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-violet-400/40 bg-violet-500/10 text-violet-300 text-[10px] uppercase tracking-widest font-semibold mb-3">
            <Lock className="w-2.5 h-2.5" />
            Private invitation
          </div>
        )}

        <h3 className="font-display text-2xl md:text-3xl text-silver-100 leading-tight mb-3">
          {event.title}
        </h3>

        <div className="space-y-1 mb-4">
          <p className="flex items-center gap-2 text-sm text-silver-300">
            <Calendar className="w-3.5 h-3.5 text-flame-400" />
            {dateLine} <span className="text-silver-500">·</span> {timeLine}
          </p>
          {event.location && (
            <p className="flex items-center gap-2 text-sm text-silver-300">
              <MapPin className="w-3.5 h-3.5 text-flame-400" />
              {event.location}
            </p>
          )}
        </div>

        {event.description && (
          <p className="text-silver-300 text-sm leading-relaxed mb-5 whitespace-pre-line">
            {event.description}
          </p>
        )}

        {/* Show location details only on unlocked private events
            so the public listing doesn't leak street addresses */}
        {highlight && event.location_details && (
          <div className="mb-5 p-3 bg-midnight-950/60 border border-midnight-700/60 rounded-lg text-xs text-silver-300 leading-relaxed">
            <p className="font-mono text-[10px] uppercase tracking-widest text-flame-400 mb-1">
              Details
            </p>
            <p className="whitespace-pre-line">{event.location_details}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-midnight-700/40">
          <div>
            {isFree ? (
              <span className="text-emerald-400 font-medium text-sm">Free</span>
            ) : (
              <span className="text-silver-100 text-lg font-display">
                ${(event.price_cents / 100).toLocaleString()}
                <span className="text-silver-400 text-xs ml-1">per seat</span>
              </span>
            )}
            {event.capacity != null && (
              <span className="text-silver-500 text-xs ml-2">· {event.capacity} seats</span>
            )}
          </div>
          <a
            href={ctaUrl}
            target={ctaUrl.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-flame-500 hover:bg-flame-600 text-white text-sm font-medium px-5 py-2.5 rounded-md transition-colors"
          >
            <Ticket className="w-4 h-4" />
            {ctaLabel}
          </a>
        </div>

        {event.has_class_workbook && (
          <Link
            to="/class"
            className="mt-4 flex items-center justify-center gap-2 rounded-md border border-flame-500/40 bg-flame-500/10 px-5 py-2.5 text-sm font-medium text-flame-300 transition-colors hover:bg-flame-500/20"
          >
            <BookOpen className="h-4 w-4" />
            Access class workbook
          </Link>
        )}
      </div>
    </article>
  )
}
