/**
 * Which real build answers what a visitor typed (the home page's "headline you can type", 2026-11-23). Pure, so it
 * can be tested. The builds are the published showcase projects from the CRM, the brokerage system and the six
 * demos that ship with the site; nothing here invents one. A visitor types their own kind of business ("HVAC
 * company", "real estate agent") and gets the build made for one like it, or an honest "nothing like that yet".
 */

export interface Build {
  title: string
  category: string | null
  blurb: string | null
  /** A full address, or a path inside this site for a demo ("/demos/fitness"). */
  live_url: string | null
  tags: string[]
  image_url: string | null
}

/** What people call their trade, mapped to the words the builds are filed under. */
const MEANS: [RegExp, string[]][] = [
  [/hvac|heat|cool|furnace|plumb|electric|roof|contract|landscap|lawn|clean|handyman|remodel|trade|field|home serv/i, ['home services', 'field service', 'field-service']],
  [/real ?estate|realtor|agent|listing|homes?\b/i, ['real estate', 'realtor']],
  [/broker|office|team lead|sales manager|recruit/i, ['brokerage', 'office', 'recruiting']],
  [/coach|consult|mentor|therap/i, ['coaching', 'coach']],
  [/family|famil|kids|household|parent|mom|dad/i, ['family']],
  [/bar\b|restaurant|cafe|coffee|food|hospitality|brewery|martini/i, ['hospitality', 'bar']],
  [/shop|store|retail|clothing|merch|product/i, ['retail', 'shop', 'product']],
  [/event|festival|fair|calendar/i, ['events']],
  [/content|social|post|blog|creator|writer|influenc|solopreneur/i, ['content', 'creator', 'saas']],
  [/wellness|health|clinic|spa|fitness|gym|trainer|studio|yoga/i, ['wellness', 'health']],
  [/money|finance|account|bookkeep|budget/i, ['finance']],
]

const words = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w.length > 2)

/**
 * Every build that fits the typed words, best first. Ties keep the list's own order (the higher placed build).
 * A build has to be filed under what was typed, or say it more than twice, to count at all.
 */
export function rankBuilds(typed: string, builds: Build[]): Build[] {
  const said = typed.trim()
  if (said.length < 2 || !builds.length) return []
  const typedWords = words(said)
  const wanted = new Set<string>(typedWords)
  for (const [re, terms] of MEANS) if (re.test(said)) for (const t of terms) wanted.add(t)
  const fits: { b: Build; score: number; at: number }[] = []
  builds.forEach((b, at) => {
    const filed = `${b.category ?? ''} ${(b.tags ?? []).join(' ')}`.toLowerCase()
    const told = `${b.title} ${b.blurb ?? ''}`.toLowerCase()
    let score = 0
    for (const w of wanted) {
      if (filed.includes(w)) score += 3
      else if (told.includes(w)) score += 1
    }
    if (score < 3) return
    // The visitor's own word in a build's name is the closest fit there is ("bar" and the martini bar).
    const name = b.title.toLowerCase()
    for (const w of typedWords) if (name.includes(w)) score += 1
    // A build with a picture shows better than one without.
    if (b.image_url) score += 0.5
    fits.push({ b, score, at })
  })
  return fits.sort((x, y) => y.score - x.score || x.at - y.at).map((f) => f.b)
}

/** The best build for the typed words, or null when nothing fits. */
export function matchBuild(typed: string, builds: Build[]): Build | null {
  return rankBuilds(typed, builds)[0] ?? null
}

/** True for a build that opens inside this site (a demo), not at an address of its own. */
export function isOnSite(url: string | null): boolean {
  return !!url && url.startsWith('/')
}

/** A live address as a person reads it: "field-service.anfconsult.com", or "anfconsult.com/brokerage" for a path. */
export function hostOf(url: string | null): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    return u.host.replace(/^www\./, '') + u.pathname.replace(/\/+$/, '')
  } catch { return '' }
}
