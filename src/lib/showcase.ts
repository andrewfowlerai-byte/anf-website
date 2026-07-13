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
  position: number
}

/** Published projects for the /work page, in display order. RLS keeps drafts out. */
export async function listShowcaseProjects(): Promise<ShowcaseProject[]> {
  const { data, error } = await supabase
    .from('showcase_projects')
    .select('id, title, category, blurb, live_url, link_label, tags, image_url, position')
    .eq('published', true)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })
  if (error) {
    console.error('[showcase] list failed', error)
    return []
  }
  return (data ?? []) as ShowcaseProject[]
}
