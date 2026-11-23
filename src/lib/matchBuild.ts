/**
 * Which real build answers what a visitor typed (the home page's "headline you can type", 2026-11-23). Pure, so it
 * can be tested. The builds are the published showcase projects from the CRM; nothing here invents one. A visitor
 * types their own kind of business ("HVAC company", "real estate agent") and gets the build made for one like it,
 * or an honest "nothing like that yet".
 */

export interface Build {
  title: string
  category: string | null
  blurb: string | null
  live_url: string | null
  tags: string[]
  image_url: string | null
}

/** What people call their trade, mapped to the words the builds are filed under. */
const MEANS: [RegExp, string[]][] = [
  [/hvac|heat|cool|furnace|plumb|electric|roof|contract|landscap|lawn|clean|handyman|remodel|trade|field|home serv/i, ['home services', 'field service', 'field-service']],
  [/real ?estate|realtor|agent|listing|homes?\b/i, ['real estate', 'realtor']],
  [/broker|office|team lead|recruit/i, ['brokerage', 'office', 'recruiting']],
  [/coach|consult|mentor|therap|trainer/i, ['coaching', 'coach']],
  [/family|famil|kids|household|parent|mom|dad/i, ['family']],
  [/bar\b|restaurant|cafe|coffee|food|hospitality|brewery|martini/i, ['hospitality', 'bar']],
  [/shop|store|retail|clothing|merch|product/i, ['retail', 'shop', 'product']],
  [/event|festival|fair|calendar/i, ['events']],
  [/content|social|post|blog|creator|writer/i, ['content', 'saas']],
  [/wellness|health|clinic|spa|fitness|gym/i, ['wellness', 'health']],
  [/money|finance|account|bookkeep|budget/i, ['finance']],
]

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 2)

/** The best build for the typed words, or null when nothing fits. Ties go to the earlier (higher placed) build. */
export function matchBuild(typed: string, builds: Build[]): Build | null {
  const said = typed.trim()
  if (said.length < 2 || !builds.length) return null
  const wanted = new Set<string>(words(said))
  for (const [re, terms] of MEANS) if (re.test(said)) for (const t of terms) wanted.add(t)
  let best: Build | null = null
  let top = 0
  for (const b of builds) {
    const filed = `${b.category ?? ''} ${(b.tags ?? []).join(' ')}`.toLowerCase()
    const told = `${b.title} ${b.blurb ?? ''}`.toLowerCase()
    let score = 0
    for (const w of wanted) {
      if (filed.includes(w)) score += 3
      else if (told.includes(w)) score += 1
    }
    // A build with a picture and a live address shows better than one without.
    if (score > 0 && b.image_url) score += 0.5
    if (score > top) { top = score; best = b }
  }
  return top >= 3 ? best : null
}

/** A live address as a person reads it: "field-service.anfconsult.com". */
export function hostOf(url: string | null): string {
  if (!url) return ''
  try { return new URL(url).host.replace(/^www\./, '') } catch { return '' }
}
