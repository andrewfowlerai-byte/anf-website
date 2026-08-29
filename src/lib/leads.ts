import { supabase } from './supabase'
import { referralFields, currentReferral } from './referralAttribution'

export interface LeadInput {
  contact_name: string
  business_name?: string
  email?: string
  phone?: string
  notes?: string
  /** Where the lead came from; defaults to the contact form. */
  source?: string
}

export async function submitLead(input: LeadInput): Promise<void> {
  const base = {
    contact_name: input.contact_name,
    business_name: input.business_name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    notes: input.notes ?? null,
    stage: 'Prospect',
    // The anon insert policy requires a source starting with "website-". A
    // source that does not match is rejected by RLS, which turns a fallback
    // meant to save a lead into the thing that loses it.
    source: input.source ?? 'website-contact-form',
  }
  // Empty object when nobody referred them, so this spreads unconditionally.
  const attribution = referralFields()

  const { error } = await supabase.from('contacts').insert({ ...base, ...attribution })
  if (!error) return

  // This is the last-resort path: whatever happens, the lead must land. If the
  // attribution columns are not there yet (the site deployed ahead of migration
  // 0172), retry without them rather than losing a real person's enquiry over a
  // tracking field. 42703 is "undefined column"; PGRST204 is PostgREST's own
  // schema-cache version of the same thing.
  const missingColumn = error.code === '42703' || error.code === 'PGRST204'
  if (!missingColumn || Object.keys(attribution).length === 0) throw error

  const note = [base.notes, `Referred with code ${attribution.referral_code}.`]
    .filter(Boolean)
    .join('\n')
  const { error: retryError } = await supabase.from('contacts').insert({ ...base, notes: note })
  if (retryError) throw retryError
}

/**
 * Full speed-to-lead intake: posts to the CRM's inbound-lead endpoint, which
 * creates the contact, fires an instant AI acknowledgement to the lead, drops an
 * Inbox card, and pushes Andrew's phone. Falls back to a direct Prospect insert
 * so a lead is never lost if the endpoint is unreachable.
 */
export async function submitRequest(input: LeadInput): Promise<void> {
  try {
    const res = await fetch('https://crm.anfconsult.com/api/inbound-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.contact_name,
        email: input.email,
        phone: input.phone,
        business: input.business_name,
        message: input.notes,
        source: input.source ?? 'website-experience',
        // Sent as the raw code as well as the resolved id: the endpoint can
        // re-resolve server-side, and an unrecognised code stays visible.
        referralCode: currentReferral()?.code ?? undefined,
        referralPartnerId: currentReferral()?.partnerId ?? undefined,
      }),
    })
    if (res.ok) return
  } catch {
    /* fall through to the direct insert */
  }
  await submitLead(input)
}
