import { supabase } from './supabase'

// Public client onboarding intake. The form is open to anyone; an access code is
// optional and only personalizes it (preset features, greeting, budget). It writes
// through two SECURITY DEFINER RPCs (validate_intake_code, submit_intake), so the
// anon client never reads the codes table or inserts submissions directly. Weights
// ("credits") are internal and never shown to the client.

export interface IntakeFeature {
  slug: string
  category: string
  label: string
  description: string | null
  weight: number
  is_personal: boolean
  sort: number
}

export interface CodeInfo {
  valid: boolean
  package: string | null
  budget_credits: number | null
  addon_rate_cents: number | null
  preset_features: string[] | null
  client_name: string | null
  intro: string | null
}

export interface CustomRequest { title: string; detail: string }
export interface IntakeFile { name: string; path: string; size: number }

export interface SubmitPayload {
  business_name?: string
  contact_name?: string
  email?: string
  phone?: string
  website?: string
  industry?: string
  goals?: string
  timeline?: string
  budget?: string
  programs?: string[]
  selected_features: string[]
  personal_features: string[]
  custom_requests: CustomRequest[]
  files: IntakeFile[]
}

export async function fetchFeatures(): Promise<IntakeFeature[]> {
  const { data, error } = await supabase
    .from('intake_features')
    .select('slug,category,label,description,weight,is_personal,sort')
    .eq('active', true)
    .order('sort', { ascending: true })
  if (error) { console.error('[intake] fetchFeatures failed', error); return [] }
  return (data ?? []) as IntakeFeature[]
}

export async function validateCode(code: string): Promise<CodeInfo | null> {
  const trimmed = code.trim()
  if (!trimmed) return null
  const { data, error } = await supabase.rpc('validate_intake_code', { p_code: trimmed })
  if (error) { console.error('[intake] validate failed', error); return null }
  return Array.isArray(data) && data.length > 0 ? (data[0] as CodeInfo) : null
}

export async function submitIntake(code: string, payload: SubmitPayload): Promise<string | null> {
  const { data, error } = await supabase.rpc('submit_intake', { p_code: code.trim(), p_payload: payload })
  if (error) { console.error('[intake] submit failed', error); throw error }
  return (data as string) ?? null
}

export async function uploadIntakeFile(folder: string, file: File): Promise<IntakeFile | null> {
  const safe = file.name.replace(/[^\w.\-]+/g, '_')
  const path = `${folder}/${Date.now()}_${safe}`
  const { error } = await supabase.storage.from('intake-uploads').upload(path, file, { upsert: false })
  if (error) { console.error('[intake] upload failed', error); return null }
  return { name: file.name, path, size: file.size }
}
