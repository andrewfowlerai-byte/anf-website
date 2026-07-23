/**
 * Title and description for every public route, keyed by path.
 *
 * Kept in one file (rather than scattered across 18 page components) so the whole
 * set is easy to read side by side and easy to keep from drifting into duplicates.
 * Layout looks up the current pathname and hands the match to useSeo().
 *
 * Descriptions run about 150 to 160 characters. Google truncates past that.
 */

export interface PageSeo {
  title: string
  description: string
  noindex?: boolean
}

export const PAGE_SEO: Record<string, PageSeo> = {
  '/': {
    title: 'ANF Consulting',
    description:
      'Custom systems built around how you actually work. Marketing, infrastructure, AI, and training for professionals and small businesses. Clarity. Integration. Automation.',
  },
  '/services': {
    title: 'Services and Pricing',
    description:
      'Websites, CRMs, client portals, and automation, priced up front and built around your business instead of forced into someone else template. See what a build includes.',
  },
  '/work': {
    title: 'Our Work',
    description:
      'Real builds for real businesses: field service platforms, realtor CRMs, client portals, and marketing sites. See what we shipped and what it changed.',
  },
  '/demos': {
    title: 'Live Demos',
    description:
      'Click through working demos built for real estate, coaching, home services, fitness, creators, and families. No signup, no sales call, just the software.',
  },
  '/demos/real-estate': {
    title: 'Real Estate CRM Demo',
    description:
      'A working realtor CRM demo: leads, pipeline, listings, showings, and follow-up in one place. Click through it yourself, no signup required.',
  },
  '/demos/coaches': {
    title: 'Coaching Practice Demo',
    description:
      'A working demo of a coaching practice system: clients, sessions, programs, payments, and progress tracking. Click through it yourself, no signup required.',
  },
  '/demos/family': {
    title: 'Family HQ Demo',
    description:
      'A working demo of a household command center: calendars, tasks, budgets, and the moving parts of family life in one place. Click through it yourself.',
  },
  '/demos/fitness': {
    title: 'Fitness Studio Demo',
    description:
      'A working demo of a fitness studio system: members, class schedules, check-ins, and billing in one place. Click through it yourself, no signup required.',
  },
  '/demos/creators': {
    title: 'Creator Desk Demo',
    description:
      'A working demo of a creator business system: content calendar, brand deals, invoices, and audience in one place. Click through it yourself, no signup required.',
  },
  '/demos/home-services': {
    title: 'Home Services Demo',
    description:
      'A working demo of a field service platform: jobs, dispatch, quotes, invoices, and techs in the field. Click through it yourself, no signup required.',
  },
  '/about': {
    title: 'About',
    description:
      'ANF Consulting is Andrew Fowler and a small team in Northeast Ohio. We build the systems small businesses actually run on. Clarity. Integration. Automation.',
  },
  '/book': {
    title: 'Book a Call',
    description:
      'Pick a time to talk through what you are trying to fix. No pitch deck, no pressure. We will tell you plainly whether we are the right fit for the work.',
  },
  '/audit': {
    title: 'Free Business Systems Audit',
    description:
      'Get a free written audit of your online presence and systems. We look at what is working, what is leaking time or money, and what to fix first.',
  },
  '/refer': {
    title: 'Refer a Business',
    description:
      'Know a business that needs better systems? Send them our way. Referrals that turn into a build earn a thank-you, and we will keep you posted either way.',
  },
  '/reviews': {
    title: 'Leave a Review',
    description:
      'Worked with ANF Consulting? Tell us how it went. Your feedback shapes what we build next and helps other businesses know what to expect.',
  },
  '/handouts': {
    title: 'Class Handouts',
    description:
      'Quick-start sheets for Gemini Pro and Canva AI from AI You Can Actually Use, Class 1. Read them here or print a copy to keep at your desk.',
  },
  '/events': {
    title: 'Events and Classes',
    description:
      'Upcoming ANF Consulting classes and events in Northeast Ohio, including practical AI training for real estate agents and small business owners.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    description:
      'How ANF Consulting collects, uses, and protects your information. Plain language, no surprises.',
  },
  '/terms': {
    title: 'Terms of Service',
    description:
      'The terms that apply when you use the ANF Consulting website and services. Plain language, no surprises.',
  },

  // Unlisted or gated. Shared by direct link, so keep them out of search results.
  '/invest': {
    title: 'Investment Overview',
    description: 'Investment overview for ANF Consulting. Shared by direct link.',
    noindex: true,
  },
  '/start': {
    title: 'Start Your Build',
    description: 'Client onboarding intake for ANF Consulting. Requires a code.',
    noindex: true,
  },
  '/lunch': {
    title: 'Lunch and Learn',
    description: 'RSVP for the ANF Consulting lunch and learn.',
    noindex: true,
  },
  '/rsvp': {
    title: 'RSVP',
    description: 'RSVP for an upcoming ANF Consulting event.',
    noindex: true,
  },
}

/** Falls back to the /demos entry for any demo slug we have not written copy for yet. */
export function seoForPath(pathname: string): PageSeo | null {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  if (PAGE_SEO[clean]) return PAGE_SEO[clean]
  if (clean.startsWith('/demos/')) return PAGE_SEO['/demos']
  return null
}
