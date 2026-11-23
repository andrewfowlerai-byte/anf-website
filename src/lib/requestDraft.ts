/**
 * The request-a-call draft (the /book form). Kept here, outside the lazily loaded Book page, because the home page's
 * closing section starts the same draft: what a visitor types there is waiting in the form when they arrive.
 * A draft survives a tab switch or reload (hooks/useLocalDraft), and is cleared only when the request is sent.
 */

export interface RequestDraft {
  name: string
  business: string
  email: string
  phone: string
  bestTime: string
  message: string
}

export const REQUEST_DRAFT_KEY = 'book.requestCall'

export const EMPTY_DRAFT: RequestDraft = { name: '', business: '', email: '', phone: '', bestTime: '', message: '' }

/** The best-time choices. "" is "Any time", which sends no preference. */
export const BEST_TIMES = [
  { value: '', label: 'Any time' },
  { value: 'Mornings', label: 'Mornings' },
  { value: 'Afternoons', label: 'Afternoons' },
  { value: 'Evenings', label: 'Evenings' },
]
