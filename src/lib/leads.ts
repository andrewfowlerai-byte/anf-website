import { supabase } from './supabase'

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
  const { error } = await supabase.from('contacts').insert({
    contact_name: input.contact_name,
    business_name: input.business_name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    notes: input.notes ?? null,
    stage: 'Prospect',
    source: input.source ?? 'website-contact-form',
  })
  if (error) throw error
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
      }),
    })
    if (res.ok) return
  } catch {
    /* fall through to the direct insert */
  }
  await submitLead(input)
}
