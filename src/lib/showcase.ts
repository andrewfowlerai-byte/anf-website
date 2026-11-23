import { supabase } from './supabase'

/** A published "things we've built" entry, managed from the CRM. */
export interface ShowcaseProject {
  id: string
  title: string
  category: string | null
  blurb: string | null
  live_url: string | null
  link_label: string | null
  tags: string[]
  image_url: string | null
  access_code: string | null
  access_note: string | null
  position: number
}

/** Published projects for the /work page, in display order. RLS keeps drafts out. */
async function loadShowcaseProjects(): Promise<ShowcaseProject[]> {
  // select('*') (not an explicit column list) so the page keeps working if the
  // access_code / access_note columns are not migrated in yet: missing columns
  // just come back undefined instead of erroring the whole query.
  const { data, error } = await supabase
    .from('showcase_projects')
    .select('*')
    .eq('published', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[showcase] list failed', error)
    return []
  }
  return (data ?? []) as ShowcaseProject[]
}

/**
 * One read per visit, shared by everything that shows the builds (the home page asks from two sections, /work from
 * a third). An empty or failed read is not kept, so the next ask tries again.
 */
let inFlight: Promise<ShowcaseProject[]> | null = null
export function listShowcaseProjects(): Promise<ShowcaseProject[]> {
  inFlight ??= loadShowcaseProjects().then((rows) => { if (!rows.length) inFlight = null; return rows })
  return inFlight
}

/**
 * A build whose picture in the CRM is older than the build itself gets its current screen from here, by its live
 * address. The brokerage toolkit was rebuilt on 2026-11-10 and its showcase picture still shows the old one.
 * Remove an entry once the CRM row's picture is replaced.
 */
const FRESH: Record<string, string> = { 'brokerage.anfconsult.com': '/showcase/brokerage.jpg' }

/** The picture to show for a build today. */
export function currentImage(p: { live_url: string | null; image_url: string | null }): string | null {
  let host = ''
  try { host = p.live_url ? new URL(p.live_url).host.replace(/^www./, '') : '' } catch { /* not an address */ }
  return FRESH[host] ?? p.image_url
}
