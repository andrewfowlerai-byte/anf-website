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
