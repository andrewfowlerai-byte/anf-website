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

const coaches: DemoConfig = {
  slug: 'coaches',
  product: 'CoachFlow',
  niche: 'Coaches and consultants',
  accent: '#0f766e',
  blurb: 'Clients, sessions, and packages in one place.',
  kpis: [
    { label: 'Active clients', value: '24' },
    { label: 'Monthly recurring', value: '$9,800' },
    { label: 'Sessions this week', value: '17' },
    { label: 'Renewals due', value: '3' },
  ],
  boardTitle: 'Client journey',
  columns: [
    { title: 'New inquiries', cards: [
      { id: 'c1', title: 'Discovery call: Priya N.', subtitle: 'Inquiry from Instagram', tag: 'Today 3p', fields: [['Goal', 'Career transition'], ['Source', 'Instagram DM'], ['Booked', 'Today 3:00p'], ['Package', 'To be set']], note: 'Intake form auto-sent and the calendar hold is confirmed. She walks in already warmed up.' },
    ] },
    { title: 'Active 1:1', cards: [
      { id: 'c2', title: 'Marcus T.', subtitle: 'Executive coaching, month 2', tag: 'On track', fields: [['Program', '12-week executive'], ['Next session', 'Thu 10a'], ['Paid', '$1,800 of $2,400'], ['Progress', '3 of 12 sessions']], note: 'Last session action items are logged. A reminder text goes out 24 hours before each session.' },
    ] },
    { title: 'Group program', cards: [
      { id: 'c3', title: 'Q3 Leadership cohort', subtitle: '8 members, week 4', tag: 'Cohort', fields: [['Members', '8'], ['Week', '4 of 8'], ['Revenue', '$6,400'], ['Next live', 'Tue 12p']] },
    ] },
    { title: 'Renewal due', cards: [
      { id: 'c4', title: 'Renewal: Dana W.', subtitle: 'Program ends in 9 days', tag: 'Renew', fields: [['Program', 'Group, 8 weeks'], ['Ends', 'In 9 days'], ['Lifetime value', '$2,950'], ['Offer', '3-month continuation']], note: 'Renewal offer is drafted and ready to send whenever you are.' },
    ] },
  ],
}

const realEstate: DemoConfig = {
  slug: 'real-estate',
  product: 'AgentDesk',
  niche: 'Real estate agents',
  accent: '#1e3a8a',
  blurb: 'Leads, listings, and deals, end to end.',
  kpis: [
    { label: 'Active leads', value: '31' },
    { label: 'Listings live', value: '6' },
    { label: 'Avg response', value: '4 min' },
    { label: 'Closings this month', value: '3' },
  ],
  boardTitle: 'Deal pipeline',
  columns: [
    { title: 'New leads', cards: [
      { id: 'r1', title: 'Buyer: J. and K. Reyes', subtitle: 'Pre-approved, $450k', tag: 'Hot', fields: [['Type', 'Buyer'], ['Budget', '$450,000'], ['Area', 'Solon'], ['Source', 'Zillow']], note: 'Auto-text replied in 2 minutes. A tour is already booked for Saturday.' },
    ] },
    { title: 'Nurturing', cards: [
      { id: 'r2', title: 'Seller: 142 Maple Ave', subtitle: 'CMA requested', tag: 'New', fields: [['Type', 'Seller'], ['Home', '142 Maple Ave'], ['Estimate', '$520,000'], ['Stage', 'CMA prep']] },
    ] },
    { title: 'Showing / offer', cards: [
      { id: 'r3', title: 'Listing: 88 Lakeview', subtitle: '3 showings this week', tag: '$675k', fields: [['Status', 'Active'], ['List price', '$675,000'], ['Showings', '3'], ['Days on market', '11']] },
    ] },
    { title: 'Under contract', cards: [
      { id: 'r4', title: '27 Birch Run', subtitle: 'Closing in 14 days', tag: 'Pending', fields: [['Price', '$398,000'], ['Closes', 'In 14 days'], ['Status', 'Inspection done'], ['Commission', '$11,940']] },
    ] },
  ],
}

const family: DemoConfig = {
  slug: 'family',
  product: 'Family HQ',
  niche: 'Parents and family',
  accent: '#7c3aed',
  blurb: 'The whole household on one calm board.',
  kpis: [
    { label: "This week's events", value: '11' },
    { label: 'Meals planned', value: '5' },
    { label: 'Appointments', value: '3' },
    { label: 'Errands left', value: '4' },
  ],
  boardTitle: 'This week',
  columns: [
    { title: 'Kids', cards: [
      { id: 'f1', title: 'Mia: soccer practice', subtitle: 'Tue and Thu, 5:30p', tag: 'Recurring', fields: [['Who', 'Mia'], ['When', 'Tue and Thu 5:30p'], ['Where', 'Field 3'], ['Carpool', 'Sarah drives Thu']] },
    ] },
    { title: 'Appointments', cards: [
      { id: 'f2', title: 'Pediatrician: Leo', subtitle: 'Annual checkup', tag: 'Wed 9a', fields: [['Who', 'Leo'], ['When', 'Wed 9:00a'], ['Where', 'Dr. Patel'], ['Bring', 'Insurance card']], note: 'A reminder is set for the night before with the address and what to bring.' },
    ] },
    { title: 'Meals', cards: [
      { id: 'f3', title: 'Dinner plan', subtitle: 'Monday to Friday set', tag: '5 meals', fields: [['Mon', 'Tacos'], ['Tue', 'Sheet-pan chicken'], ['Wed', 'Leftovers'], ['Thu', 'Pasta night']], note: 'The grocery list builds itself from the week of meals.' },
    ] },
    { title: 'Errands and home', cards: [
      { id: 'f4', title: 'Renew car registration', subtitle: 'Due end of month', tag: 'Due soon', fields: [['Task', 'Car registration'], ['Due', 'In 8 days'], ['Owner', 'You'], ['How', 'BMV online']] },
    ] },
  ],
}

const fitness: DemoConfig = {
  slug: 'fitness',
  product: 'StudioFlow',
  niche: 'Fitness and wellness',
  accent: '#15803d',
  blurb: 'Members, classes, and retention in one view.',
  kpis: [
    { label: 'Active members', value: '142' },
    { label: 'Classes this week', value: '23' },
    { label: 'Trials running', value: '7' },
    { label: 'Retention', value: '91%' },
  ],
  boardTitle: 'Members and classes',
  columns: [
    { title: 'Free trials', cards: [
      { id: 'w1', title: 'Trial: Alex M.', subtitle: 'Day 2 of 7', tag: 'Trial', fields: [['Member', 'Alex M.'], ['Trial', 'Day 2 of 7'], ['Goal', 'Strength'], ['Next', 'Booked Fri 6a']], note: 'Welcome text sent, and a day-5 convert offer is already queued.' },
    ] },
    { title: 'New members', cards: [
      { id: 'w2', title: 'Bree K.', subtitle: 'Joined Monday', tag: 'New', fields: [['Plan', 'Unlimited'], ['Started', 'Monday'], ['Goal', 'Marathon prep'], ['Monthly', '$129']] },
    ] },
    { title: 'At risk', cards: [
      { id: 'w3', title: 'Tom R.', subtitle: 'No visit in 18 days', tag: 'Win back', fields: [['Member', 'Tom R.'], ['Last visit', '18 days ago'], ['Plan', '3x per week'], ['Status', 'Lapsing']], note: 'A friendly check-in text is drafted to reach him before he cancels.' },
    ] },
    { title: "Today's classes", cards: [
      { id: 'w4', title: '6:00 PM HIIT', subtitle: '14 booked, 2 spots', tag: 'Tonight', fields: [['Class', 'HIIT'], ['When', '6:00p'], ['Coach', 'Jordan'], ['Booked', '14 of 16']] },
    ] },
  ],
}

const creators: DemoConfig = {
  slug: 'creators',
  product: 'CreatorDesk',
  niche: 'Creators and solopreneurs',
  accent: '#be185d',
  blurb: 'Brand deals and content, organized.',
  kpis: [
    { label: 'Active deals', value: '$18,200' },
    { label: 'Posts scheduled', value: '12' },
    { label: 'Followers', value: '84k' },
    { label: 'Open pitches', value: '5' },
  ],
  boardTitle: 'Brand deal pipeline',
  columns: [
    { title: 'Pitched', cards: [
      { id: 'k1', title: 'Local boutique', subtitle: 'Reel plus 2 stories', tag: 'Pitched', fields: [['Brand', 'Local boutique'], ['Deliverable', '1 reel, 2 stories'], ['Ask', '$1,200'], ['Sent', '2 days ago']] },
    ] },
    { title: 'Negotiating', cards: [
      { id: 'k2', title: 'Skincare co.', subtitle: 'Counter sent', tag: '$2,500', fields: [['Brand', 'Skincare co.'], ['Scope', '3 reels'], ['Their offer', '$2,000'], ['Your counter', '$2,500']], note: 'Your rate card and past performance auto-attach to the reply.' },
    ] },
    { title: 'Booked', cards: [
      { id: 'k3', title: 'Coffee brand', subtitle: 'Due Friday', tag: 'Booked', fields: [['Brand', 'Coffee brand'], ['Fee', '$1,800'], ['Due', 'Friday'], ['Usage', '30 days paid']] },
    ] },
    { title: 'Content due', cards: [
      { id: 'k4', title: 'Launch reel', subtitle: 'Script ready', tag: 'Today', fields: [['Project', 'Launch reel'], ['Status', 'Script ready'], ['Post', 'Today 6p'], ['Audio', 'Trending pick saved']], note: 'Caption and hashtags are drafted. Add the trending audio in-app when you post.' },
    ] },
  ],
}

export const DEMO_CONFIGS: Record<string, DemoConfig> = {
  [homeServices.slug]: homeServices,
  [coaches.slug]: coaches,
  [realEstate.slug]: realEstate,
  [family.slug]: family,
  [fitness.slug]: fitness,
  [creators.slug]: creators,
}
