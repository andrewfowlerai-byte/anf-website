// Class reviews are posted to the CRM's public submit-review endpoint (the same
// one client testimonials use), so they land in the CRM Reviews tab and email
// Andrew. The CRM endpoint allows this cross-origin POST from the ANF web origins.

const CRM_API_BASE = 'https://crm.anfconsult.com';

export interface ClassReviewInput {
  clientName: string;
  businessName?: string;
  rating: number;
  outcome?: string; // biggest takeaway
  highlight?: string; // what they thought of the class
  recommend?: string; // "Yes" / "No" — would recommend the class to others
  email?: string;
  notifyEvents?: boolean; // opt in to hear about future ANF events
  allowPublic: boolean;
  service: string; // e.g. "Getting Real With AI class"
  website?: string; // honeypot, must stay empty
}

export interface PublicReview {
  name: string;
  business?: string | null;
  service?: string | null;
  rating?: number | null;
  quote: string;
  date?: string;
}

/** Approved (consented) client testimonials, from the CRM's public endpoint.
 *  Returns [] on any error so the site never breaks over reviews. */
export async function fetchPublicReviews(): Promise<PublicReview[]> {
  try {
    const res = await fetch(`${CRM_API_BASE}/api/public-reviews`);
    if (!res.ok) return [];
    const data = (await res.json()) as { reviews?: PublicReview[] };
    return Array.isArray(data.reviews) ? data.reviews : [];
  } catch {
    return [];
  }
}

export interface ClientReviewInput {
  clientName: string;
  businessName?: string;
  email?: string;
  service: string;
  rating: number;
  before?: string;
  outcome?: string;
  highlight?: string;
  recommend?: string;
  allowPublic: boolean;
  website?: string; // honeypot, must stay empty
}

/** Full guided client review (the link Andrew shares after a project). Posts to
 *  the CRM's public submit-review endpoint and returns the Google review URL if
 *  one is configured, so we can invite a Google review on the thank-you screen. */
export async function submitClientReview(input: ClientReviewInput): Promise<{ googleReviewUrl: string | null }> {
  const res = await fetch(`${CRM_API_BASE}/api/submit-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: input.clientName,
      businessName: input.businessName,
      email: input.email,
      service: input.service,
      rating: input.rating,
      before: input.before,
      outcome: input.outcome,
      highlight: input.highlight,
      recommend: input.recommend,
      allowPublic: input.allowPublic,
      website: input.website,
    }),
  });
  if (!res.ok) {
    let message = 'Could not submit your review. Please try again.';
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  const data = (await res.json().catch(() => ({}))) as { googleReviewUrl?: string | null };
  const g = typeof data.googleReviewUrl === 'string' ? data.googleReviewUrl.trim() : '';
  return { googleReviewUrl: g || null };
}

export async function submitClassReview(input: ClassReviewInput): Promise<void> {
  const res = await fetch(`${CRM_API_BASE}/api/submit-review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientName: input.clientName,
      businessName: input.businessName,
      rating: input.rating,
      outcome: input.outcome,
      highlight: input.highlight,
      recommend: input.recommend,
      email: input.email,
      notifyEvents: input.notifyEvents,
      allowPublic: input.allowPublic,
      service: input.service,
      website: input.website,
    }),
  });

  if (!res.ok) {
    let message = 'Could not submit your review. Please try again.';
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
}
