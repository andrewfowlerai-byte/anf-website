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

/** Capture an event RSVP. Public events use a direct anon insert (RLS allows
 *  public upcoming events). Private events go through the rsvp_to_event
 *  security-definer function with the unlock code, since anon can't see them
 *  directly. The honeypot is checked before we ever hit the DB. */
export async function createRsvp(
  eventId: string,
  input: EventRsvpInput,
  code?: string,
): Promise<void> {
  if (input.website && input.website.trim()) return // honeypot: silently drop bots
  const name = input.name.trim()
  const email = input.email?.trim() || null
  const guests = input.guests && input.guests > 0 ? input.guests : 1

  if (code) {
    // Private event: validated server-side against the event's code.
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
