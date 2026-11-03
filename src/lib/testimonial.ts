// A client's personal testimonial link (/testimonial/:token). The CRM holds the
// request and writes the draft (api/testimonial); the finished testimonial goes
// through the same submit-review endpoint as every other review.

const CRM_API_BASE = 'https://crm.anfconsult.com'

export interface TestimonialLink {
  state: 'open' | 'done'
  name: string
  first: string
  business: string
  service: string
  googleReviewUrl: string | null
  testimonial?: string
  isPrivate?: boolean
}

export type LoadResult =
  | { kind: 'ok'; link: TestimonialLink }
  | { kind: 'not_found' }
  | { kind: 'closed' }
  | { kind: 'error' }

export type DraftChange = 'shorter' | 'casual' | 'again'

export interface DraftAnswers {
  before: string
  outcome: string
  advice: string
  rating: number
  current?: string
  change?: DraftChange
}

export type DraftResult = { kind: 'ok'; draft: string } | { kind: 'limit' } | { kind: 'unavailable' }

async function post(body: object, timeoutMs: number): Promise<Response> {
  const ctrl = new AbortController()
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    return await fetch(`${CRM_API_BASE}/api/testimonial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } finally {
    window.clearTimeout(timer)
  }
}

export async function loadTestimonialLink(token: string): Promise<LoadResult> {
  try {
    const res = await post({ token, action: 'load' }, 15000)
    if (res.status === 404) return { kind: 'not_found' }
    if (res.status === 410) return { kind: 'closed' }
    if (!res.ok) return { kind: 'error' }
    return { kind: 'ok', link: (await res.json()) as TestimonialLink }
  } catch {
    return { kind: 'error' }
  }
}

/** The first real tap or keystroke. Fire and forget: it never gets in the way. */
export function markTestimonialOpened(token: string): void {
  void post({ token, action: 'opened' }, 8000).catch(() => undefined)
}

export async function writeTestimonialDraft(token: string, answers: DraftAnswers): Promise<DraftResult> {
  try {
    const res = await post({ token, action: 'draft', ...answers }, 58000)
    if (res.status === 429) return { kind: 'limit' }
    if (!res.ok) return { kind: 'unavailable' }
    const data = (await res.json()) as { draft?: string }
    return data.draft ? { kind: 'ok', draft: data.draft } : { kind: 'unavailable' }
  } catch {
    return { kind: 'unavailable' }
  }
}

export interface FinishedTestimonial {
  clientName: string
  businessName: string
  rating: number
  before: string
  outcome: string
  advice: string
  testimonial: string
  allowPublic: boolean
  nameDisplay: 'full' | 'first'
  aiAssisted: boolean
}

export async function sendTestimonial(token: string, t: FinishedTestimonial): Promise<void> {
  const res = await fetch(`${CRM_API_BASE}/api/submit-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestToken: token,
      clientName: t.clientName,
      businessName: t.businessName,
      rating: t.rating,
      before: t.before,
      outcome: t.outcome,
      recommend: t.advice,
      testimonial: t.testimonial,
      allowPublic: t.allowPublic,
      nameDisplay: t.nameDisplay,
      aiAssisted: t.aiAssisted,
    }),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(data.error || 'That did not go through. Please try again.')
  }
}
