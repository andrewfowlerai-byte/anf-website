import { supabase } from './supabase'

export interface ClassMaterial {
  slug: string
  title: string
}

/**
 * Unlock a class worksheet with the code shown in class. Returns the matched
 * material (slug + title) or null. The codes live behind a security-definer
 * RPC (class_unlock), so the anon client never sees the codes or the table.
 */
export async function unlockClass(code: string): Promise<ClassMaterial | null> {
  const trimmed = code.trim()
  if (!trimmed) return null
  const { data, error } = await supabase.rpc('class_unlock', { p_code: trimmed })
  if (error) {
    console.error('[class] unlock failed', error)
    return null
  }
  if (Array.isArray(data) && data.length > 0) {
    const row = data[0] as ClassMaterial
    return { slug: row.slug, title: row.title }
  }
  return null
}
