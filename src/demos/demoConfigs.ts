// Data-driven demo studio. One engine (src/pages/Demo.tsx) renders any of these
// configs as an interactive CRM screen under anfconsult.com/demos/<slug>. Adding
// a niche is just another entry here, no new app or Vercel project.

export interface DemoCard {
  id: string
  title: string
  subtitle: string
  tag?: string
  fields: [string, string][]
  note?: string
}

export interface DemoColumn {
  title: string
  cards: DemoCard[]
}

export interface DemoConfig {
  slug: string
  product: string
  niche: string
  accent: string
  blurb: string
  kpis: { label: string; value: string; sub?: string }[]
  boardTitle: string
  columns: DemoColumn[]
}

const homeServices: DemoConfig = {
  slug: 'home-services',
  product: 'ServiceFlow',
  niche: 'Home and service pros',
  accent: '#c2410c',
  blurb: 'Jobs, quotes, and crews in one place.',
  kpis: [
    { label: 'Jobs this week', value: '18' },
    { label: 'Quotes out', value: '$24,500', sub: '7 awaiting reply' },
    { label: 'Avg response', value: '11 min' },
    { label: '5-star reviews', value: '142' },
  ],
  boardTitle: 'Job pipeline',
  columns: [
    {
      title: 'New requests',
      cards: [
        { id: 'j1', title: 'Kitchen faucet replacement', subtitle: 'M. Alvarez, Pepper Pike', tag: 'New', fields: [['Service', 'Plumbing'], ['Requested', 'Today, 8:14a'], ['Source', 'Website form'], ['Est. value', '$320']], note: 'Auto-text sent with a booking link 40 seconds after the form came in. No lead sits cold.' },
        { id: 'j2', title: 'Gutter cleaning', subtitle: 'D. Chen, Beachwood', tag: 'New', fields: [['Service', 'Gutters'], ['Requested', 'Today, 7:02a'], ['Source', 'Google'], ['Est. value', '$180']] },
      ],
    },
    {
      title: 'Quoted',
      cards: [
        { id: 'j3', title: 'Bathroom remodel', subtitle: 'The Hartleys, Solon', tag: '$8,400', fields: [['Service', 'Remodel'], ['Quote sent', '2 days ago'], ['Follow-up', 'Due today'], ['Est. value', '$8,400']], note: 'Quote went out with three finish options. A nudge is queued for 5pm if there is no reply.' },
      ],
    },
    {
      title: 'Scheduled',
      cards: [
        { id: 'j4', title: 'Water heater install', subtitle: 'R. Okafor, Twinsburg', tag: 'Fri 9a', fields: [['Service', 'Plumbing'], ['Crew', 'Mike and Tony'], ['When', 'Fri 9:00a'], ['Value', '$1,950']] },
      ],
    },
    {
      title: 'Invoiced',
      cards: [
        { id: 'j5', title: 'Deck power-wash', subtitle: 'S. Patel, Hudson', tag: 'Paid', fields: [['Service', 'Exterior'], ['Invoice', '#1043'], ['Amount', '$240'], ['Status', 'Paid']], note: 'Review request auto-sent at payment. A five-star review came back an hour later.' },
      ],
    },
  ],
}

export const DEMO_CONFIGS: Record<string, DemoConfig> = {
  [homeServices.slug]: homeServices,
}
