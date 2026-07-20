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
export async function listShowcaseProjects(): Promise<ShowcaseProject[]> {
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
