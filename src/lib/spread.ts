import type { PublicReview } from './reviews'

/** The home page's one large quotation (components/home/QuoteSpread.tsx). Pure, so it can be tested. */

/** A review short enough to set large on two lines. */
export const SPREAD_WORDS = 9

/** Two lines of near-equal length, broken between words. */
export function twoLines(quote: string): [string[], string[]] {
  const w = quote.trim().split(/\s+/).filter(Boolean)
  if (w.length < 2) return [w, []]
  let best = 1
  let gap = Infinity
  for (let i = 1; i < w.length; i++) {
    const d = Math.abs(w.slice(0, i).join(' ').length - w.slice(i).join(' ').length)
    if (d < gap) { gap = d; best = i }
  }
  return [w.slice(0, best), w.slice(best)]
}

/** Too few words say nothing ("It was helpful" is real, and is not worth a whole screen). */
export const SPREAD_MIN_WORDS = 5

/**
 * The review to spread: five stars and five to nine words, so it says something and still sets on two lines.
 * One that names Andrew or ANF comes first (it is about the work, not the room); then the longer one. Null when
 * none fits.
 */
export function pickSpread(reviews: PublicReview[]): PublicReview | null {
  const count = (q: string) => q.trim().split(/\s+/).filter(Boolean).length
  const named = (q: string) => (/\b(andrew|anf)\b/i.test(q) ? 1 : 0)
  const fit = reviews.filter((r) => (r.rating ?? 0) >= 5 && count(r.quote) >= SPREAD_MIN_WORDS && count(r.quote) <= SPREAD_WORDS)
  fit.sort((a, b) => named(b.quote) - named(a.quote) || b.quote.length - a.quote.length)
  return fit[0] ?? null
}
