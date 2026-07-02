/**
 * Live-editable pricing and contact info, fetched from the CRM's Site
 * Settings (migration 0116). Andrew edits prices there instead of in code.
 * If the CRM has not been edited yet for a section (or the fetch fails), the
 * caller's local fallback value is used instead, so the site never shows
 * blank content.
 */
export interface SiteContent {
  pricing: Record<string, Record<string, string>[]>;
  contact: Record<string, string>;
}

let cached: Promise<SiteContent> | null = null;

export function fetchSiteContent(): Promise<SiteContent> {
  if (!cached) {
    cached = fetch('https://crm.anfconsult.com/api/public-site-content')
      .then((r) => (r.ok ? r.json() : { pricing: {}, contact: {} }))
      .catch(() => ({ pricing: {}, contact: {} })) as Promise<SiteContent>;
  }
  return cached;
}

/** Pricing rows for one section, or the fallback if not live-edited yet. */
export async function pricingSection<T>(section: string, fallback: T[]): Promise<T[]> {
  const { pricing } = await fetchSiteContent();
  const rows = pricing[section];
  return rows && rows.length > 0 ? (rows as unknown as T[]) : fallback;
}
