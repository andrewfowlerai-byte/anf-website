// SHARED: keep identical in anf-crm/src/lib/onboardingSensitive.ts and anf-website/src/lib/onboarding/sensitive.ts
//
// The sensitive-number detector (contract v1, 6.3). It mirrors the SQL function
// public.onboarding_looks_sensitive rule for rule, and both run the same test
// vectors. The browser runs it before anything is queued, so matching text is
// never sent or stored on the device; SQL runs it again on every saved string.

export const SENSITIVE_MESSAGE =
  'That looks like a card, Social Security or bank number. Please do not type those here; we collect them another way.'

const SSN_DASHED = /(^|[^0-9])[0-9]{3}[- ][0-9]{2}[- ][0-9]{4}([^0-9]|$)/
const SSN_WORDS = /(ssn|social security)/i
const BARE_NINE = /(^|[^0-9])[0-9]{9}([^0-9]|$)/
const BANK_WORDS = /(routing|\baba\b|account (number|no\.?|#)|\bacct\b)/i
const SIX_DIGITS = /[0-9]{6,}/
// Card digits may be split by spaces, hyphens, dots or underscores. Not by
// slashes: two US dates in a row ("10/15/2026 10/16/2026") would then read as
// a 16-digit number and fail one time in ten on the checksum alone.
const CARD_RUN = /[0-9](?:[ ._-]?[0-9]){12,18}/g
const NINE_RUN = /(?<![0-9])([0-9]{9})(?![0-9])/g

function luhnOk(d: string): boolean {
  let s = 0
  let dbl = false
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48
    if (dbl) {
      n *= 2
      if (n > 9) n -= 9
    }
    s += n
    dbl = !dbl
  }
  return s % 10 === 0
}

function abaOk(d: string): boolean {
  const n = (i: number) => d.charCodeAt(i) - 48
  const s = 3 * (n(0) + n(3) + n(6)) + 7 * (n(1) + n(4) + n(7)) + (n(2) + n(5) + n(8))
  return s % 10 === 0
}

/** True when the text looks like a card, Social Security or bank routing number. */
export function looksSensitive(p: string | null | undefined): boolean {
  if (p == null || !/[0-9]/.test(p)) return false
  if (SSN_DASHED.test(p)) return true
  if (SSN_WORDS.test(p) && BARE_NINE.test(p)) return true
  if (BANK_WORDS.test(p) && SIX_DIGITS.test(p)) return true
  for (const m of p.matchAll(CARD_RUN)) {
    const d = m[0].replace(/[^0-9]/g, '')
    if (d.length >= 13 && d.length <= 19 && luhnOk(d)) return true
  }
  for (const m of p.matchAll(NINE_RUN)) {
    if (abaOk(m[1])) return true
  }
  return false
}

/**
 * Browser only (no SQL twin): true while text ends in a run of 6 or more
 * digits. The form waits for the person to leave the field before saving such
 * text, so the first 12 digits of a card or 8 of a Social Security number are
 * never saved on a typing pause before the full number trips looksSensitive.
 */
export function endsInLongNumber(p: string | null | undefined): boolean {
  if (p == null) return false
  // One pass from the end (a regex here can backtrack badly on a long answer).
  // Separators are the ones a card number may use: one at a time between digits.
  const sep = (ch: string) => ch === ' ' || ch === '.' || ch === '_' || ch === '-'
  let i = p.length - 1
  while (i >= 0 && sep(p[i])) i--
  let digits = 0
  let lastWasSep = false
  for (; i >= 0; i--) {
    const ch = p[i]
    if (ch >= '0' && ch <= '9') {
      digits++
      lastWasSep = false
      if (digits >= 6) return true
    } else if (sep(ch) && !lastWasSep) {
      lastWasSep = true
    } else break
  }
  return false
}

/** Runs looksSensitive over every string inside a JSON-like value (strings, arrays, objects). */
export function valueLooksSensitive(v: unknown): boolean {
  if (typeof v === 'string') return looksSensitive(v)
  if (Array.isArray(v)) return v.some(valueLooksSensitive)
  if (v && typeof v === 'object') return Object.values(v as Record<string, unknown>).some(valueLooksSensitive)
  return false
}
