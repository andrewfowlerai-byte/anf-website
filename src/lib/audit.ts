import { submitLead } from './leads'

export interface AuditResults {
  domain: string
  platform: string
  reachable: boolean
  https: boolean
  mobileFriendly: boolean
  copyrightYear: number | null
  webNeedScore: number
  systemNeedScore: number
  findings: string[]
  summary: string | null
}

export interface AuditRequest {
  name: string
  email: string
  website: string
  business?: string
  goal?: string
  hp?: string
}

/**
 * Run the real audit through the CRM's engine: it fetches the visitor's site
 * server-side, returns findings for on-page display, emails them the full
 * copy, and lands them in the CRM with an Inbox card for Andrew. Falls back
 * to a plain lead insert so the request is never lost if the endpoint is
 * unreachable (the visitor then gets the audit by email within two days).
 */
export async function runWebsiteAudit(
  input: AuditRequest,
): Promise<{ live: true; results: AuditResults } | { live: false }> {
  try {
    const res = await fetch('https://crm.anfconsult.com/api/website-audit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (res.ok) {
      const body = (await res.json()) as { ok?: boolean; results?: AuditResults }
      if (body.ok && body.results) return { live: true, results: body.results }
    }
  } catch {
    /* fall through to the plain lead insert */
  }
  await submitLead({
    contact_name: input.name,
    business_name: input.business || undefined,
    email: input.email,
    notes: [`Website: ${input.website}`, input.goal && `Goal: ${input.goal}`].filter(Boolean).join('\n'),
    source: 'website-audit',
  })
  return { live: false }
}
