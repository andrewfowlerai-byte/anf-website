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

/** Capture a public-event RSVP. RLS allows the anon insert only for public,
 *  upcoming events. The honeypot is checked here before we ever hit the DB. */
export async function createRsvp(eventId: string, input: EventRsvpInput): Promise<void> {
  if (input.website && input.website.trim()) return // honeypot: silently drop bots
  const { error } = await supabase.from('event_rsvps').insert({
    event_id: eventId,
    name: input.name.trim(),
    email: input.email?.trim() || null,
    guests: input.guests && input.guests > 0 ? input.guests : 1,
  })
  if (error) throw error
}
