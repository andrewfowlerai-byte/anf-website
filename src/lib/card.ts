import { submitLead } from './leads'

export interface CardSwapInput {
  name: string
  email?: string
  phone?: string
  company?: string
  note?: string
  /** Honeypot. A person never sees or fills it. */
  hp?: string
}

/**
 * Send a visitor's details back to Andrew from the digital card (/andrew).
 *
 * Goes to the CRM's card-exchange endpoint, which matches or creates the
 * contact, logs the swap, and drafts the follow-up in Andrew's Inbox. It never
 * emails the visitor anything.
 *
 * A validation problem comes back as an Error with a message to show. If the
 * endpoint cannot be reached at all, the details still land as a contact
 * through the direct insert (source "website-card"), where the CRM's daily
 * new-lead pass picks them up. A person who took the time to share their
 * number is never lost to an outage.
 */
export async function submitCardSwap(input: CardSwapInput): Promise<void> {
  let res: Response | null
  try {
    res = await fetch('https://crm.anfconsult.com/api/card-exchange', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    res = null
  }

  if (res && res.ok) return
  if (res && res.status >= 400 && res.status < 500) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error || 'Something in the form needs a look.')
  }

  // Unreachable or a server error: keep the person anyway.
  await submitLead({
    contact_name: input.name,
    business_name: input.company || undefined,
    email: input.email || undefined,
    phone: input.phone || undefined,
    notes: [
      'Swapped contacts on the digital card (anfconsult.com/andrew).',
      input.note ? `They asked about: ${input.note}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    source: 'website-card',
  })
}
