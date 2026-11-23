import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Lock, Ticket, Loader2, BookOpen, Check } from 'lucide-react'
import { listUpcomingPublicEvents, lookupPrivateEvent, createRsvp, type AnfEvent } from '../lib/events'
import { PageHero } from '../components/PageHero'
import { JsonLd } from '../components/JsonLd'

/** focusCode: a short-link matcher (an event's private_code) used by routes like
 *  /lunch to open that specific public event with its RSVP form ready. */
export function Events({ focusCode }: { focusCode?: string } = {}) {
  const [publicEvents, setPublicEvents] = useState<AnfEvent[]>([])
  const [loadingPublic, setLoadingPublic] = useState(true)
  const [autoOpenId, setAutoOpenId] = useState<string | null>(null)

  const [code, setCode] = useState('')
  const [unlockedEvent, setUnlockedEvent] = useState<AnfEvent | null>(null)
  const [unlocking, setUnlocking] = useState(false)
  const [codeError, setCodeError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listUpcomingPublicEvents()
      .then((data) => {
        if (cancelled) return
        setPublicEvents(data)
        // Short-link deep open: find the event this link points at and mark it
        // to auto-open its RSVP. Matches on the private_code slug we set.
        if (focusCode) {
          const target = focusCode.trim().toLowerCase()
          const match = data.find((e) => (e.private_code ?? '').trim().toLowerCase() === target)
          if (match) setAutoOpenId(match.id)
        }
      })
      .finally(() => { if (!cancelled) setLoadingPublic(false) })
    return () => { cancelled = true }
  }, [focusCode])

  // Deep link: /events?code=XXXX auto-unlocks the private event, so a shared
  // invite link opens straight to the event details and RSVP.
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('code')
    if (!c || !c.trim()) return
    const trimmed = c.trim().toUpperCase()
    setCode(trimmed)
    setUnlocking(true)
    setCodeError(null)
    lookupPrivateEvent(trimmed)
      .then((ev) => {
        if (ev) setUnlockedEvent(ev)
        else setCodeError("That code doesn't match a current private event. Double-check it with whoever invited you.")
      })
      .finally(() => setUnlocking(false))
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
      <PageHero
        title="Workshops, classes, and gatherings."
        subtitle="Open sessions, invite-only roundtables, and the occasional dinner. Public events are listed below. If you have a private code, unlock yours next."
      />

      {/* Public events */}
      <section className="px-[var(--edge)] pb-16">
        <h2 className="t-head font-extrabold tracking-[-0.03em] mb-8">
          Upcoming public events
        </h2>

        {loadingPublic ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-flame-700 animate-spin" />
          </div>
        ) : publicEvents.length === 0 ? (
          <div className="border-dashed px-8 py-12 bg-silver-200">
            <Calendar className="w-6 h-6 text-flame-700 mb-3" />
            <p className="font-extrabold tracking-[-0.03em] t-lead">No public events right now.</p>
            <p className="mt-2 max-w-md leading-relaxed">
              Check back soon, or use the code from your invitation below to unlock a private event.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6">
            {publicEvents.map((ev) => (
              <div key={ev.id} className="w-full md:w-[calc(50%-0.75rem)] max-w-xl">
                <EventCard event={ev} autoOpen={autoOpenId === ev.id} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Private code unlock */}
      <section className="max-w-2xl px-[var(--edge)] pb-24">
        <div className="slab">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-flame-700" />
          </div>
          <h2 className="t-head font-extrabold tracking-[-0.03em] mb-3">
            Have a private event code?
          </h2>
          <p className="leading-relaxed mb-5">
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
              className="field flex-1"
            />
            <button
              type="submit"
              disabled={unlocking || !code.trim()}
              className="bg-flame-500 hover:bg-flame-400 disabled:opacity-60 font-medium px-6 py-3 transition-all inline-flex items-center justify-center gap-1.5"
            >
              {unlocking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Unlock event
            </button>
          </form>
          {codeError && <p className="text-flame-700 mt-3">{codeError}</p>}
        </div>

        {unlockedEvent && (
          <div className="mt-8">
            <EventCard event={unlockedEvent} highlight code={code} />
          </div>
        )}
      </section>
    </>
  )
}

// ─── Event Card ──────────────────────────────────────────────────────────

function EventCard({ event, highlight = false, code, autoOpen = false }: { event: AnfEvent; highlight?: boolean; code?: string; autoOpen?: boolean }) {
  const cardRef = useRef<HTMLElement>(null)
  const start = new Date(event.starts_at)
  // Events happen in Northeast Ohio, so they are always shown in Eastern.
  // `undefined` here would format in the visitor's own timezone, which told a
  // reader in California that a 6pm ET class started at 3pm. timeZoneName
  // prints EDT/EST so the hour is never ambiguous.
  const dateLine = start.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    timeZone: 'America/New_York',
  })
  const timeLine = start.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    timeZone: 'America/New_York',
  })

  const isFree = event.price_cents === 0
  const ctaLabel = isFree ? 'RSVP' : 'Get tickets'
  const ctaUrl = !isFree && event.payment_link_url
    ? event.payment_link_url
    : event.rsvp_url
    ? event.rsvp_url
    : 'mailto:admin@anfconsult.com?subject=Event RSVP'

  // Native RSVP capture for free events. Public events RSVP openly; an unlocked
  // private event RSVPs with its code. Paid events keep their Stripe checkout.
  const nativeRsvp = isFree && (event.visibility === 'public' || (event.visibility === 'private' && !!code))
  const [rsvpOpen, setRsvpOpen] = useState(false)
  const [rsvpName, setRsvpName] = useState('')
  const [rsvpEmail, setRsvpEmail] = useState('')
  const [rsvpHoneypot, setRsvpHoneypot] = useState('')
  const [rsvpBusy, setRsvpBusy] = useState(false)
  const [rsvpDone, setRsvpDone] = useState(false)
  const [rsvpError, setRsvpError] = useState<string | null>(null)

  // Short-link deep open: reveal this card's RSVP form and scroll it into view.
  useEffect(() => {
    if (autoOpen && nativeRsvp) {
      setRsvpOpen(true)
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, nativeRsvp])

  const submitRsvp = async (e: FormEvent) => {
    e.preventDefault()
    setRsvpError(null)
    if (rsvpName.trim().length < 1) {
      setRsvpError('Please add your name.')
      return
    }
    setRsvpBusy(true)
    try {
      await createRsvp(event.id, { name: rsvpName, email: rsvpEmail, website: rsvpHoneypot }, code)
      setRsvpDone(true)
    } catch {
      setRsvpError('Could not RSVP. Please try again.')
      setRsvpBusy(false)
    }
  }

  return (
    <article
      ref={cardRef}
      className={`relative overflow-hidden bg-silver-200 transition-colors ${
 highlight
 ? ' shadow-[0_0_40px_-10px_rgba(242,107,29,0.45)]'
 : ' '
 }`}
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          startDate: event.starts_at,
          ...(event.ends_at ? { endDate: event.ends_at } : {}),
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          ...(event.description ? { description: event.description } : {}),
          ...(event.location ? { location: { '@type': 'Place', name: event.location } } : {}),
          organizer: { '@type': 'Organization', name: 'ANF Consulting', url: 'https://anfconsult.com' },
          offers: {
            '@type': 'Offer',
            price: (event.price_cents / 100).toFixed(2),
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            url: 'https://anfconsult.com/events',
          },
        }}
      />
      {event.cover_image_url && (
        <div className="aspect-[16/9] w-full overflow-hidden bg-silver-200">
          <img
            src={event.cover_image_url}
            alt={event.title || 'Event'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-6 md:p-7">
        {event.visibility === 'private' && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border-violet-400/40 bg-violet-500/10 text-violet-300 text-[13px] font-semibold mb-3">
            <Lock className="w-2.5 h-2.5" />
            Private invitation
          </div>
        )}

        <h3 className="font-extrabold tracking-[-0.03em] t-head leading-tight mb-3">
          {event.title}
        </h3>

        <div className="space-y-1 mb-4">
          <p className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-flame-700" />
            {dateLine} <span className="text-midnight-500">·</span> {timeLine}
          </p>
          {event.location && (
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-flame-700" />
              {event.location}
            </p>
          )}
        </div>

        {event.description && (
          <p className="leading-relaxed mb-5 whitespace-pre-line">
            {event.description}
          </p>
        )}

        {/* Show location details only on unlocked private events
            so the public listing doesn't leak street addresses */}
        {highlight && event.location_details && (
          <div className="mb-5 p-3 bg-silver-200 text-[13px] leading-relaxed">
            <p className="text-[13px] text-flame-700 mb-1">
              Details
            </p>
            <p className="whitespace-pre-line">{event.location_details}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap pt-2">
          <div>
            {isFree ? (
              <span className="text-emerald-400 font-medium">Free</span>
            ) : (
              <span className="t-lead font-extrabold tracking-[-0.03em]">
                ${(event.price_cents / 100).toLocaleString()}
                <span className="text-[13px] ml-1">per seat</span>
              </span>
            )}
            {event.capacity != null && (
              <span className="text-midnight-500 text-[13px] ml-2">· {event.capacity} seats</span>
            )}
          </div>
          {nativeRsvp ? (
            <button
              type="button"
              onClick={() => { setRsvpOpen((o) => !o); setRsvpError(null) }}
              className="inline-flex items-center gap-1.5 bg-flame-500 hover:bg-flame-400 font-medium px-5 py-2.5 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              {rsvpDone ? "You're in" : 'RSVP'}
            </button>
          ) : (
            <a
              href={ctaUrl}
              target={ctaUrl.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-flame-500 hover:bg-flame-400 font-medium px-5 py-2.5 transition-colors"
            >
              <Ticket className="w-4 h-4" />
              {ctaLabel}
            </a>
          )}
        </div>

        {nativeRsvp && rsvpDone && (
          <div className="mt-4 flex items-center gap-2 border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-emerald-300">
            <Check className="h-4 w-4 flex-shrink-0" />
            You're on the list. We'll be in touch with the details.
          </div>
        )}

        {nativeRsvp && rsvpOpen && !rsvpDone && (
          <form onSubmit={submitRsvp} className="mt-4 space-y-2 slab">
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={rsvpHoneypot}
              onChange={(e) => setRsvpHoneypot(e.target.value)}
              className="hidden"
            />
            <input
              type="text"
              value={rsvpName}
              onChange={(e) => setRsvpName(e.target.value)}
              placeholder="Your name"
              className='field'
            />
            <input
              type="email"
              value={rsvpEmail}
              onChange={(e) => setRsvpEmail(e.target.value)}
              placeholder="Email (so we can send you details)"
              className='field'
            />
            <button
              type="submit"
              disabled={rsvpBusy}
              className="inline-flex w-full items-center justify-center gap-1.5 bg-flame-500 hover:bg-flame-400 disabled:opacity-60 px-4 py-2 font-medium transition-colors"
            >
              {rsvpBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Confirm RSVP
            </button>
            {rsvpError && <p className="text-[13px] text-flame-700">{rsvpError}</p>}
          </form>
        )}

        {event.has_class_workbook && (
          <Link
            to="/class"
            className="mt-4 flex items-center justify-center gap-2 bg-midnight-100 px-5 py-2.5 font-medium text-flame-700 transition-colors hover:bg-midnight-100"
          >
            <BookOpen className="h-4 w-4" />
            Access class workbook
          </Link>
        )}
      </div>
    </article>
  )
}
