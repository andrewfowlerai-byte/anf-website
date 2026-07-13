import { supabase } from './supabase'

export type EventVisibility = 'public' | 'private'
export type EventStatus = 'draft' | 'upcoming' | 'completed' | 'cancelled'

export interface AnfEvent {
  id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  location: string | null
  location_details: string | null
  cover_image_url: string | null
  visibility: EventVisibility
  private_code: string | null
  capacity: number | null
  price_cents: number
  payment_link_url: string | null
  rsvp_url: string | null
  status: EventStatus
  has_class_workbook: boolean
  created_at: string
  updated_at: string
}

/** Public events shown on the marketing site. RLS keeps drafts +
 *  private events out of this query automatically. */
export async function listUpcomingPublicEvents(): Promise<AnfEvent[]> {
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('visibility', 'public')
    .eq('status', 'upcoming')
    .gte('starts_at', nowIso)
    .order('starts_at', { ascending: true })
  if (error) {
    console.error('[events] public list failed', error)
    return []
  }
  return (data ?? []) as AnfEvent[]
}

/** Private event lookup via the security-definer RPC. The anon key
 *  can't read private events directly; this function is the only
 *  legitimate way to surface one when the visitor types its code. */
export async function lookupPrivateEvent(code: string): Promise<AnfEvent | null> {
  const trimmed = code.trim()
  if (!trimmed) return null
  const { data, error } = await supabase.rpc('event_by_code', { p_code: trimmed })
  if (error) {
    console.error('[events] private lookup failed', error)
    return null
  }
  if (Array.isArray(data) && data.length > 0) return data[0] as AnfEvent
  return null
}

export interface EventRsvpInput {
  name: string
  email?: string
  guests?: number
  website?: string // honeypot, must stay empty
}

const RSVP_ENDPOINT = 'https://crm.anfconsult.com/api/event-rsvp'

/** Capture an event RSVP. Preferred path is the CRM endpoint, which records the
 *  RSVP, emails the guest a confirmation, and alerts Andrew. If that endpoint is
 *  unreachable, we fall back to the direct DB path so the RSVP is never lost
 *  (public events insert openly; private events use the coded security-definer
 *  function). The honeypot is checked before anything. */
export async function createRsvp(
  eventId: string,
  input: EventRsvpInput,
  code?: string,
): Promise<void> {
  if (input.website && input.website.trim()) return // honeypot: silently drop bots
  const name = input.name.trim()
  const email = input.email?.trim() || null
  const guests = input.guests && input.guests > 0 ? input.guests : 1

  // Preferred: the CRM endpoint (adds the confirmation email + Andrew alert).
  try {
    const res = await fetch(RSVP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, name, email, guests, code, website: input.website ?? '' }),
    })
    if (res.ok) return
    // A 4xx (bad code, full, closed) is a real answer, not a reason to fall back.
    if (res.status >= 400 && res.status < 500) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(data.error || 'Could not RSVP.')
    }
    // 5xx / unexpected: fall through to the direct DB path below.
  } catch (err) {
    if (err instanceof Error && err.message && err.message !== 'Failed to fetch') throw err
    // network error: fall through to the direct DB path.
  }

  // Fallback: write straight to the database so the RSVP still records.
  if (code) {
    const { error } = await supabase.rpc('rsvp_to_event', {
      p_event_id: eventId,
      p_name: name,
      p_email: email,
      p_guests: guests,
      p_code: code,
    })
    if (error) throw error
    return
  }
  const { error } = await supabase.from('event_rsvps').insert({
    event_id: eventId,
    name,
    email,
    guests,
  })
  if (error) throw error
}
