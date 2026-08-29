import { supabase } from './supabase'

/**
 * Referral attribution.
 *
 * A referral partner's agreement names a link, anfconsult.com/r/THEIRCODE, and
 * promises that anyone arriving through it is credited automatically. This is
 * the half that keeps that promise.
 *
 * The code is remembered on the device rather than carried in the URL, because
 * a visitor lands on /r/CODE, browses for a while, and submits a form three
 * pages later. Losing the code at the first navigation would mean the partner
 * is credited only for people who fill in a form on the landing page, which is
 * almost nobody.
 *
 * Storage is deliberately forgiving. Every read and write is wrapped, because a
 * private window, a browser with site data blocked, or an iOS lockdown profile
 * all throw on access rather than returning empty, and an attribution failure
 * must never be allowed to break a lead form.
 */

const KEY = 'anf.referral'
/** Ninety days, matching the window the partner agreement gives a registered
 *  introduction before it goes stale. */
const TTL_MS = 90 * 24 * 60 * 60 * 1000

export interface ReferralAttribution {
  code: string
  /** Resolved partner id, or null when the code matched no live partner. */
  partnerId: string | null
  /** Display name, used only to confirm to the visitor who sent them. */
  partnerName: string | null
  savedAt: number
}

function read(): ReferralAttribution | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as ReferralAttribution
    if (!v || typeof v.code !== 'string') return null
    if (!Number.isFinite(v.savedAt) || Date.now() - v.savedAt > TTL_MS) {
      try { window.localStorage.removeItem(KEY) } catch { /* ignore */ }
      return null
    }
    return v
  } catch {
    return null
  }
}

function write(v: ReferralAttribution): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* Storage unavailable. The visit still works, it just is not attributed. */
  }
}

/** Normalize to the shape the database check constraint accepts. */
export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16)
}

/**
 * Resolve a code against the live partner list and remember it.
 *
 * The lookup goes through a SECURITY DEFINER function rather than a table read,
 * so an anonymous visitor can learn that a code is live and who it belongs to
 * without the partner table being readable. An unrecognised code is still
 * stored, with a null partner id: a typo or a retired code should be visible in
 * the CRM rather than silently dropped.
 */
export async function captureReferral(rawCode: string): Promise<ReferralAttribution> {
  const code = normalizeCode(rawCode)
  const attribution: ReferralAttribution = {
    code,
    partnerId: null,
    partnerName: null,
    savedAt: Date.now(),
  }
  if (!code) return attribution

  try {
    const { data, error } = await supabase.rpc('resolve_referral_code', { p_code: code })
    if (!error && Array.isArray(data) && data.length > 0) {
      attribution.partnerId = data[0].partner_id ?? null
      attribution.partnerName = data[0].partner_name ?? null
    }
  } catch {
    /* Offline or blocked. Keep the raw code; the CRM resolves it on arrival. */
  }

  write(attribution)
  return attribution
}

/** The remembered attribution, if the visitor has one and it has not expired. */
export function currentReferral(): ReferralAttribution | null {
  return read()
}

/**
 * The two columns a lead insert should carry. Returns an empty object when
 * there is no attribution, so it can be spread into any insert unconditionally.
 */
export function referralFields(): { referral_code?: string; referral_partner_id?: string } {
  const r = read()
  if (!r || !r.code) return {}
  return r.partnerId
    ? { referral_code: r.code, referral_partner_id: r.partnerId }
    : { referral_code: r.code }
}

/** A short line to show the visitor, or null when nobody referred them. */
export function referralCredit(): string | null {
  const r = read()
  if (!r) return null
  return r.partnerName ? `Referred by ${r.partnerName}` : null
}

/** Clear the attribution. Used by the "that is not right" affordance on forms. */
export function clearReferral(): void {
  try { window.localStorage.removeItem(KEY) } catch { /* ignore */ }
}
