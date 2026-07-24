import { submitLead } from './leads'

export interface ClassSignupInput {
  name: string
  email: string
  business?: string
  role?: string
  /** 'in_person' | 'virtual' | 'either' */
  format?: string
  note?: string
  hp?: string
}

/**
 * Sign someone up for the free AI class through the CRM endpoint (Prospect
 * contact in the class funnel + confirmation + Inbox card + push). Falls back to
 * a plain lead insert tagged class-signup so nothing is lost if the endpoint is
 * down.
 */
export async function submitClassSignup(input: ClassSignupInput): Promise<void> {
  try {
    const res = await fetch('https://crm.anfconsult.com/api/class-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (res.ok) return
  } catch {
    /* fall through */
  }
  await submitLead({
    contact_name: input.name,
    business_name: input.business || undefined,
    email: input.email,
    notes: [
      'Signed up for a free AI class via anfconsult.com/free-class.',
      input.role && `Role: ${input.role}`,
      input.format && `Prefers: ${input.format}`,
      input.note && `Note: ${input.note}`,
    ]
      .filter(Boolean)
      .join('\n'),
    source: 'class-signup',
  })
}
