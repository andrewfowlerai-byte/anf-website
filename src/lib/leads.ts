import { supabase } from './supabase'

export interface LeadInput {
  contact_name: string
  business_name?: string
  email?: string
  phone?: string
  notes?: string
}

export async function submitLead(input: LeadInput): Promise<void> {
  const { error } = await supabase.from('contacts').insert({
    contact_name: input.contact_name,
    business_name: input.business_name ?? null,
    email: input.email ?? null,
    phone: input.phone ?? null,
    notes: input.notes ?? null,
    stage: 'Prospect',
    source: 'website-contact-form',
  })
  if (error) throw error
}
