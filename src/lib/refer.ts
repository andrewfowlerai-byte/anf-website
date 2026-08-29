import { submitLead } from './leads'

export interface ReferralInput {
  referrerName: string
  referrerEmail: string
  business: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  note?: string
  hp?: string
}

/**
 * Submit a referral through the CRM endpoint (ledger row + Inbox card + a
 * thank-you to the referrer). Falls back to a plain lead insert with the
 * referral context in the notes so nothing is lost if the endpoint is down.
 */
export async function submitReferral(input: ReferralInput): Promise<void> {
  try {
    const res = await fetch('https://crm.anfconsult.com/api/refer-business', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (res.ok) return
  } catch {
    /* fall through */
  }
  await submitLead({
    contact_name: input.contactName || input.business,
    business_name: input.business,
    email: input.contactEmail || undefined,
    phone: input.contactPhone || undefined,
    notes: [
      `Referred by ${input.referrerName} (${input.referrerEmail}) via anfconsult.com/refer.`,
      input.note && `Why: ${input.note}`,
    ]
      .filter(Boolean)
      .join('\n'),
    source: 'website-referral',
  })
}
