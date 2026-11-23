/**
 * The six interactive demos that open inside this site (/demos/...). They are listed on /work beside the builds, and
 * the home page's typed headline can answer with one, so the list lives here, outside the lazily loaded Work page.
 * Each picture in public/showcase/demo-*.jpg is a capture of the demo itself.
 */

export interface SiteDemo {
  name: string
  summary: string
  tags: string[]
  link: string
  image: string
}

export const SITE_DEMOS: SiteDemo[] = [
  {
    name: 'Real estate agents',
    summary: 'A CRM shaped around how an agent actually works: lead pipeline, speed to lead, listings through to closing. Click straight in.',
    tags: ['Real Estate', 'CRM', 'Interactive'],
    link: '/demos/real-estate',
    image: '/showcase/demo-real-estate.jpg',
  },
  {
    name: 'Home and service pros',
    summary: 'For trades, cleaners and landscapers. Jobs and quotes, scheduling, invoices and reviews, in the order a working day happens.',
    tags: ['Home Services', 'CRM', 'Interactive'],
    link: '/demos/home-services',
    image: '/showcase/demo-home-services.jpg',
  },
  {
    name: 'Coaches and consultants',
    summary: 'Built for one to one and group programs. Client roster, session notes, packages and payments.',
    tags: ['Coaching', 'CRM', 'Interactive'],
    link: '/demos/coaches',
    image: '/showcase/demo-coaches.jpg',
  },
  {
    name: 'Fitness and wellness',
    summary: 'Trainers, studios and clinics. Members, classes and the retention problem that decides whether a studio survives.',
    tags: ['Wellness', 'CRM', 'Interactive'],
    link: '/demos/fitness',
    image: '/showcase/demo-fitness.jpg',
  },
  {
    name: 'Parents and family',
    summary: 'A family HQ rather than a CRM. Kids’ schedules, meals and errands, appointments, all in one place.',
    tags: ['Family', 'Interactive'],
    link: '/demos/family',
    image: '/showcase/demo-family.jpg',
  },
  {
    name: 'Creators and solopreneurs',
    summary: 'When content is the business. Brand deals, a content calendar, and posting that does not depend on remembering.',
    tags: ['Creator', 'Interactive'],
    link: '/demos/creators',
    image: '/showcase/demo-creators.jpg',
  },
]
