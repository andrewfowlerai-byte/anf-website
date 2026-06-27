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

export interface DemoFeature {
  h: string
  b: string
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
  featuresTitle: string
  features: DemoFeature[]
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
        { id: 'j2b', title: 'Emergency: no AC', subtitle: 'L. Brooks, Solon', tag: 'Urgent', fields: [['Service', 'HVAC'], ['Requested', 'Today, 6:41a'], ['Source', 'Missed call'], ['Est. value', '$450']], note: 'Missed call auto-replied with a text and a same-day slot. She booked before the office even opened.' },
      ],
    },
    {
      title: 'Quoted',
      cards: [
        { id: 'j3', title: 'Bathroom remodel', subtitle: 'The Hartleys, Solon', tag: '$8,400', fields: [['Service', 'Remodel'], ['Quote sent', '2 days ago'], ['Follow-up', 'Due today'], ['Est. value', '$8,400']], note: 'Quote went out with three finish options. A nudge is queued for 5pm if there is no reply.' },
        { id: 'j3b', title: 'Driveway resurfacing', subtitle: 'R. Patel, Hudson', tag: '$3,200', fields: [['Service', 'Concrete'], ['Quote sent', 'Yesterday'], ['Opened', '3 times'], ['Est. value', '$3,200']], note: 'They have opened the quote three times. A good sign, so the follow-up call is flagged as a priority.' },
      ],
    },
    {
      title: 'Scheduled',
      cards: [
        { id: 'j4', title: 'Water heater install', subtitle: 'R. Okafor, Twinsburg', tag: 'Fri 9a', fields: [['Service', 'Plumbing'], ['Crew', 'Mike and Tony'], ['When', 'Fri 9:00a'], ['Value', '$1,950']] },
        { id: 'j4b', title: 'Deck staining', subtitle: 'J. Nguyen, Aurora', tag: 'Mon 8a', fields: [['Service', 'Exterior'], ['Crew', 'Dave'], ['When', 'Mon 8:00a'], ['Value', '$1,100']], note: 'Customer gets an on-my-way text with the crew name and arrival window the morning of.' },
      ],
    },
    {
      title: 'Invoiced',
      cards: [
        { id: 'j5', title: 'Deck power-wash', subtitle: 'S. Patel, Hudson', tag: 'Paid', fields: [['Service', 'Exterior'], ['Invoice', '#1043'], ['Amount', '$240'], ['Status', 'Paid']], note: 'Review request auto-sent at payment. A five-star review came back an hour later.' },
        { id: 'j5b', title: 'Furnace tune-up', subtitle: 'K. Reyes, Macedonia', tag: 'Sent', fields: [['Service', 'HVAC'], ['Invoice', '#1044'], ['Amount', '$180'], ['Status', 'Awaiting pay']], note: 'Invoice was sent from the truck the second the job wrapped. A gentle reminder fires in 3 days if unpaid.' },
      ],
    },
  ],
  featuresTitle: 'Built around how the work actually gets done',
  features: [
    { h: 'Answer every lead in seconds', b: 'A new request from your site, Google, or a missed call gets an instant text back with a booking link, so the fast reply wins the job instead of the competitor who happened to call back first.' },
    { h: 'Quotes that follow up on their own', b: 'Build a quote with good-better-best options, send it in a tap, and get pinged the moment they open it. A nudge is queued automatically if they go quiet, so deals stop slipping through the cracks.' },
    { h: 'The whole week on one board', b: 'Drag jobs onto the calendar, assign your crews, and see who is where at a glance. No more double-booking or the 7am "where am I supposed to be" text.' },
    { h: 'Get paid before you leave the driveway', b: 'Send the invoice the second the job is done and take a card or ACH on the spot. No chasing checks, no net-30 limbo, no forgetting to bill the small ones.' },
    { h: 'Reviews on autopilot', b: 'A review request fires automatically when payment lands, while the work is still fresh in their mind. Your reputation compounds without you ever having to ask.' },
    { h: 'Every customer remembered', b: 'Property details, past jobs, and notes are right there when a repeat customer calls, so you pick up exactly where you left off instead of starting from scratch.' },
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
      { id: 'c1b', title: 'Inquiry: Sam D.', subtitle: 'Referral from a past client', tag: 'New', fields: [['Goal', 'Confidence and speaking'], ['Source', 'Client referral'], ['Status', 'Sent a booking link'], ['Package', 'To be set']], note: 'Referrals get a warm, personal reply that mentions who sent them. It is drafted and ready to send.' },
    ] },
    { title: 'Active 1:1', cards: [
      { id: 'c2', title: 'Marcus T.', subtitle: 'Executive coaching, month 2', tag: 'On track', fields: [['Program', '12-week executive'], ['Next session', 'Thu 10a'], ['Paid', '$1,800 of $2,400'], ['Progress', '3 of 12 sessions']], note: 'Last session action items are logged. A reminder text goes out 24 hours before each session.' },
      { id: 'c2b', title: 'Elena R.', subtitle: 'Life coaching, month 1', tag: 'New client', fields: [['Program', '8-week reset'], ['Next session', 'Fri 1p'], ['Paid', 'In full'], ['Progress', '1 of 8 sessions']] },
    ] },
    { title: 'Group program', cards: [
      { id: 'c3', title: 'Q3 Leadership cohort', subtitle: '8 members, week 4', tag: 'Cohort', fields: [['Members', '8'], ['Week', '4 of 8'], ['Revenue', '$6,400'], ['Next live', 'Tue 12p']] },
      { id: 'c3b', title: 'Confidence bootcamp', subtitle: '12 members, week 1', tag: 'Just started', fields: [['Members', '12'], ['Week', '1 of 6'], ['Revenue', '$4,200'], ['Next live', 'Wed 6p']], note: 'Welcome sequence went out to all 12 on enrollment, with the workbook and the call schedule.' },
    ] },
    { title: 'Renewal due', cards: [
      { id: 'c4', title: 'Renewal: Dana W.', subtitle: 'Program ends in 9 days', tag: 'Renew', fields: [['Program', 'Group, 8 weeks'], ['Ends', 'In 9 days'], ['Lifetime value', '$2,950'], ['Offer', '3-month continuation']], note: 'Renewal offer is drafted and ready to send whenever you are.' },
    ] },
  ],
  featuresTitle: 'Built around how coaching actually works',
  features: [
    { h: 'Every client, ready before the call', b: 'Goals, history, and last session notes surface the moment you open a client, so you walk into every session already prepared instead of scrambling to remember where you left off.' },
    { h: 'Notes that follow up for you', b: 'Log what you covered and what is next. The client gets their action items and a reminder before the next session, sent automatically, so the work continues between sessions.' },
    { h: 'Packages and payments at a glance', b: 'See which session they are on and what they have paid without digging through email. Renewal time and unpaid balances never sneak up on you.' },
    { h: 'Run group programs without the chaos', b: 'Cohorts, rosters, weekly content, and revenue per group in one view, so a twelve-person program feels as calm and organized as a single client.' },
    { h: 'No-shows quietly disappear', b: 'Friendly reminders go out before every session on their own. Fewer empty slots, less awkward chasing, more sessions that actually happen.' },
    { h: 'Renewals drafted before they end', b: 'When a program is wrapping up, the continuation offer is already written and waiting for your okay, so no client quietly lapses because the moment passed.' },
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
  featuresTitle: 'Built around how you actually sell',
  features: [
    { h: 'Never let a lead go cold', b: 'An assistant answers and qualifies new leads in seconds, day or night, then hands you the ones worth a call. Slow response is where most agents quietly lose deals. Here it is handled.' },
    { h: 'One place, not five tabs', b: 'Leads, listings, showings, closings, and past clients in one system shaped to your day, instead of a CRM, a dialer, a scheduler, and a spreadsheet that never talk to each other.' },
    { h: 'You own it, you do not rent it', b: 'No per-seat fee that climbs as your team grows. ANF builds the system for you and it is yours, so the tool fits the agent instead of the agent fitting the tool.' },
    { h: 'One partner for the whole thing', b: 'Website, CRM, lead response, listing content and reels, and CE-credit AI training, from one team that knows real estate and your market. Not five vendors and a help desk.' },
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
      { id: 'f1b', title: 'Leo: science fair project', subtitle: 'Due Friday', tag: 'Due soon', fields: [['Who', 'Leo'], ['Due', 'Friday'], ['Needs', 'Poster board, glue'], ['Status', 'Half done']], note: 'Supplies got added to the grocery list automatically so nobody is at the store at 9pm Thursday.' },
    ] },
    { title: 'Appointments', cards: [
      { id: 'f2', title: 'Pediatrician: Leo', subtitle: 'Annual checkup', tag: 'Wed 9a', fields: [['Who', 'Leo'], ['When', 'Wed 9:00a'], ['Where', 'Dr. Patel'], ['Bring', 'Insurance card']], note: 'A reminder is set for the night before with the address and what to bring.' },
      { id: 'f2b', title: 'Dentist: Mia', subtitle: 'Cleaning', tag: 'Thu 4p', fields: [['Who', 'Mia'], ['When', 'Thu 4:00p'], ['Where', 'Bright Smiles'], ['Note', 'Pick up from school early']] },
    ] },
    { title: 'Meals', cards: [
      { id: 'f3', title: 'Dinner plan', subtitle: 'Monday to Friday set', tag: '5 meals', fields: [['Mon', 'Tacos'], ['Tue', 'Sheet-pan chicken'], ['Wed', 'Leftovers'], ['Thu', 'Pasta night']], note: 'The grocery list builds itself from the week of meals.' },
    ] },
    { title: 'Errands and home', cards: [
      { id: 'f4', title: 'Renew car registration', subtitle: 'Due end of month', tag: 'Due soon', fields: [['Task', 'Car registration'], ['Due', 'In 8 days'], ['Owner', 'You'], ['How', 'BMV online']] },
      { id: 'f4b', title: 'Replace furnace filter', subtitle: 'Every 90 days', tag: 'Recurring', fields: [['Task', 'Furnace filter'], ['Last done', '88 days ago'], ['Size', '16x25x1'], ['Owner', 'Partner']], note: 'The recurring home stuff reminds itself, so it never piles up into a stressful weekend.' },
    ] },
  ],
  featuresTitle: 'The whole household, finally on one calm board',
  features: [
    { h: "Everyone's week in one place", b: "Kids, work, appointments, and activities on a single shared board, so the whole week stops living only in one parent's head." },
    { h: 'Carpool and handoffs, sorted', b: 'Who drives, who picks up, where to be and when, all written down instead of texted at the last minute. Fewer crossed wires, fewer forgotten pickups.' },
    { h: 'Meals plan the grocery list for you', b: 'Set the week of dinners once and the shopping list builds itself. Less "what is for dinner" every single night, less standing in the store wondering what you forgot.' },
    { h: 'Nothing important slips', b: 'Appointments, renewals, and school forms get a reminder the night before with everything you need to bring or do.' },
    { h: 'The recurring stuff remembers itself', b: 'Registrations, filters, refills, and seasonal tasks live on the board and resurface on time, so they never pile up into a stressful weekend.' },
    { h: 'Calm, not another chore app', b: 'Shaped like a family HQ, not a corporate to-do list. It is built to lower the mental load on the household, not add one more thing to manage.' },
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
      { id: 'w1b', title: 'Trial: Jordan P.', subtitle: 'Day 5 of 7', tag: 'Converting', fields: [['Member', 'Jordan P.'], ['Trial', 'Day 5 of 7'], ['Visits', '3 so far'], ['Next', 'Offer goes out today']], note: 'Three visits in five days is a strong signal. The membership offer is timed to send while motivation is high.' },
    ] },
    { title: 'New members', cards: [
      { id: 'w2', title: 'Bree K.', subtitle: 'Joined Monday', tag: 'New', fields: [['Plan', 'Unlimited'], ['Started', 'Monday'], ['Goal', 'Marathon prep'], ['Monthly', '$129']] },
      { id: 'w2b', title: 'Chris D.', subtitle: 'Joined last week', tag: 'New', fields: [['Plan', '3x per week'], ['Started', 'Last Wed'], ['Goal', 'Lose 20 lbs'], ['Monthly', '$89']], note: 'First-month check-in is scheduled so new members feel looked after before the early drop-off window.' },
    ] },
    { title: 'At risk', cards: [
      { id: 'w3', title: 'Tom R.', subtitle: 'No visit in 18 days', tag: 'Win back', fields: [['Member', 'Tom R.'], ['Last visit', '18 days ago'], ['Plan', '3x per week'], ['Status', 'Lapsing']], note: 'A friendly check-in text is drafted to reach him before he cancels.' },
    ] },
    { title: "Today's classes", cards: [
      { id: 'w4', title: '6:00 PM HIIT', subtitle: '14 booked, 2 spots', tag: 'Tonight', fields: [['Class', 'HIIT'], ['When', '6:00p'], ['Coach', 'Jordan'], ['Booked', '14 of 16']] },
      { id: 'w4b', title: '7:00 AM Yoga', subtitle: 'Waitlist of 3', tag: 'Full', fields: [['Class', 'Vinyasa'], ['When', '7:00a'], ['Coach', 'Maya'], ['Booked', '16 of 16']], note: 'When a spot opens, the first person on the waitlist gets an auto-text and the slot fills itself.' },
    ] },
  ],
  featuresTitle: 'Built around members, classes, and keeping people coming back',
  features: [
    { h: 'Turn trials into members', b: 'Every trial gets a welcome and a convert offer timed to the right day, so more of them stick around past week one instead of quietly disappearing.' },
    { h: 'Classes and bookings in one view', b: "See tonight's roster, open spots, and who is teaching at a glance. Waitlists, reminders, and the spot-just-opened texts run themselves." },
    { h: 'Catch a member before they quit', b: 'When someone goes quiet, a friendly check-in is drafted automatically, so you win them back before they cancel instead of finding out when the payment stops.' },
    { h: 'Memberships and billing handled', b: 'Plans, renewals, and payments tracked in one place, with the awkward "your card failed" follow-ups handled for you so revenue does not leak.' },
    { h: 'Retention you can actually see', b: 'Know your real retention number and exactly who is at risk this week, instead of finding out the bad news when the monthly revenue dips.' },
    { h: 'Built for a studio, not a calendar', b: 'Assign coaches, manage the timetable, and fill classes from one board made for how a studio actually runs, not a generic scheduling app with the labels changed.' },
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
      { id: 'k1b', title: 'Meal-kit brand', subtitle: 'Cold pitch with media kit', tag: 'Pitched', fields: [['Brand', 'Meal-kit co.'], ['Deliverable', '2 reels'], ['Ask', '$2,800'], ['Sent', 'Yesterday']], note: 'Your media kit and best-performing posts attached automatically. A follow-up is queued for day 4.' },
    ] },
    { title: 'Negotiating', cards: [
      { id: 'k2', title: 'Skincare co.', subtitle: 'Counter sent', tag: '$2,500', fields: [['Brand', 'Skincare co.'], ['Scope', '3 reels'], ['Their offer', '$2,000'], ['Your counter', '$2,500']], note: 'Your rate card and past performance auto-attach to the reply.' },
    ] },
    { title: 'Booked', cards: [
      { id: 'k3', title: 'Coffee brand', subtitle: 'Due Friday', tag: 'Booked', fields: [['Brand', 'Coffee brand'], ['Fee', '$1,800'], ['Due', 'Friday'], ['Usage', '30 days paid']] },
      { id: 'k3b', title: 'Fitness app', subtitle: 'Due next week', tag: 'Booked', fields: [['Brand', 'Fitness app'], ['Fee', '$3,400'], ['Due', 'Next Wed'], ['Usage', '90 days paid']], note: 'Deliverables, due dates, and the paid usage window are tracked so nothing gets used longer than you agreed.' },
    ] },
    { title: 'Content due', cards: [
      { id: 'k4', title: 'Launch reel', subtitle: 'Script ready', tag: 'Today', fields: [['Project', 'Launch reel'], ['Status', 'Script ready'], ['Post', 'Today 6p'], ['Audio', 'Trending pick saved']], note: 'Caption and hashtags are drafted. Add the trending audio in-app when you post.' },
    ] },
  ],
  featuresTitle: 'Built around the deals and the content, not the busywork',
  features: [
    { h: 'Never lose track of a deal', b: 'Every brand pitch, negotiation, and booking on one pipeline, so you always know what is owed, what is due, and which conversation is worth chasing today.' },
    { h: 'Negotiate from strength', b: 'Your rate card and past performance attach to every reply, so you counter with proof and book at your real rate instead of guessing and under-charging.' },
    { h: 'A content calendar that ships', b: 'Plan posts, drafts, and due dates in one place. Captions and hashtags are drafted ahead of time, so posting day is calm instead of a scramble.' },
    { h: 'Pitches that actually get answered', b: 'Send pitches with your media kit built in and a nudge queued if a brand goes quiet, so you get more replies and spend less time refreshing your inbox.' },
    { h: 'Know what a deal is really worth', b: 'Fees, usage windows, and deliverables tracked per deal, so you never under-charge, over-deliver, or forget what you agreed to months later.' },
    { h: 'The business behind the content', b: 'Followers and posts are the fun part. This runs the money and the deadlines underneath, so the creative work actually turns into a living.' },
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
