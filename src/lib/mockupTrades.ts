/**
 * Trade profiles for the prospect homepage mockup at /preview/<id>.
 *
 * Split out of the page so the copy and photography can be judged on their own.
 * Every string here is read by a business owner looking at their own name, so it
 * has to sound like their job rather than like filler. "Comprehensive solutions
 * for all your needs" is exactly the thing that makes a mockup worthless.
 *
 * Photographs are real Pexels images, chosen by hand for each trade rather than
 * searched at runtime. Two reasons: searching needs an API key, and a key cannot
 * go in a public bundle; and a hand-picked photo of a plumber actually working
 * beats whatever a query returns on the day.
 *
 * These are NOT the business's own photos, and the page never implies they are.
 * Their real Google photos would be far stronger, and the only thing stopping
 * that is that GOOGLE_PLACES_API_KEY is currently rejected by Google.
 */

export type Trade =
  | 'plumbing' | 'hvac' | 'roofing' | 'electrical' | 'landscaping'
  | 'realestate' | 'accounting' | 'insurance'
  | 'general'

export interface TradeProfile {
  label: string
  /** Headline promise. Speaks to the customer's bad day, not the company. */
  lede: string
  services: [string, string][]
  /** Three short reasons to call, shown as a trust band. */
  reasons: [string, string][]
  /** Questions a customer actually asks before calling. */
  faq: [string, string][]
  proof: string
  hero: { url: string; alt: string; credit: string }
  gallery: { url: string; alt: string; credit: string }[]
  accent: string
  ink: string
  wash: string
}

const px = (id: string) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`

export const TRADES: Record<Trade, TradeProfile> = {
  plumbing: {
    label: 'Plumbing',
    lede: 'Burst pipe, backed-up drain, or a water heater that quit overnight. Call and talk to someone who can actually come out.',
    services: [
      ['Emergency repairs', 'Burst pipes, leaks and blockages, same day where we can get to you.'],
      ['Water heaters', 'Repair, replacement, and the honest answer about which one you need.'],
      ['Drains and sewer', 'Cleared properly, with a camera, so you know what caused it.'],
      ['Fixtures and remodels', 'Kitchens and bathrooms, done once and done right.'],
    ],
    reasons: [
      ['We answer the phone', 'A person, not a queue, and usually on the first ring.'],
      ['Priced before we start', 'You approve the number before any work happens.'],
      ['We clean up', 'You should not be able to tell we were there, apart from the fix.'],
    ],
    faq: [
      ['Do you charge for a call-out?', 'We tell you the call-out fee on the phone, before we come. No surprises on the invoice.'],
      ['How fast can you get here?', 'For a burst pipe or no water, same day whenever we can. We will tell you honestly if we cannot.'],
      ['Do you handle insurance work?', 'Yes, and we document everything with photographs so a claim is straightforward.'],
    ],
    proof: 'Licensed and insured',
    hero: { url: px('6419128'), alt: 'A plumber installing steel pipes', credit: 'Anıl Karakaya' },
    gallery: [
      { url: px('29226620'), alt: 'A plumber fitting a radiator pipe', credit: 'Sergei Starostin' },
      { url: px('8486928'), alt: 'A plumber holding a pipe wrench', credit: 'Kindel Media' },
      { url: px('16509869'), alt: 'A worker repairing pipework', credit: 'AR Abnoy' },
    ],
    accent: '#1B5E8C', ink: '#0F2233', wash: '#F2F7FB',
  },

  hvac: {
    label: 'Heating and cooling',
    lede: 'No heat in January, no air in July. Fast, honest, and we tell you when a repair beats a replacement.',
    services: [
      ['Emergency repair', 'Heat and cooling failures, prioritised by how cold or hot it actually is.'],
      ['Installs and replacement', 'Sized for your house, not upsold from a catalogue.'],
      ['Seasonal maintenance', 'The tune-up that stops the January phone call happening at all.'],
      ['Indoor air quality', 'Humidity, filtration, and the things that make a house comfortable.'],
    ],
    reasons: [
      ['Repair before replace', 'If a repair will hold, we say so, even though it is the smaller job.'],
      ['Same-day in a cold snap', 'No heat moves to the front of the list. Always.'],
      ['Fixed quotes', 'The number we give you is the number on the invoice.'],
    ],
    faq: [
      ['Should I repair or replace?', 'Age, the cost of the repair and what it will cost you to run. We walk you through all three and let you decide.'],
      ['How long does a replacement take?', 'Most residential systems are a single day, and we leave the house liveable that night.'],
      ['Do you service what you did not install?', 'Yes, any make and any age.'],
    ],
    proof: 'Licensed and insured',
    hero: { url: px('5463581'), alt: 'A technician repairing a rooftop air conditioning unit', credit: 'José Andrés Pacheco Cortes' },
    gallery: [
      { url: px('32497161'), alt: 'A technician inspecting an outdoor HVAC unit', credit: 'Kathleen Austin Kuhn' },
      { url: px('5463575'), alt: 'A technician servicing an air conditioner outdoors', credit: 'José Andrés Pacheco Cortes' },
      { url: px('7347538'), alt: 'A technician repairing an outdoor air conditioning unit', credit: 'Richard Low Hong' },
    ],
    accent: '#B4471F', ink: '#241410', wash: '#FBF5F2',
  },

  roofing: {
    label: 'Roofing',
    lede: 'Storm damage, a leak you have been watching, or a roof at the end of its life. Free inspection, straight answer.',
    services: [
      ['Storm and leak repair', 'Found, explained with photographs, and fixed.'],
      ['Full replacement', 'Materials and timeline in writing before anything starts.'],
      ['Free inspections', 'You get the report whether or not you hire us.'],
      ['Gutters and siding', 'The rest of the envelope that keeps water out of the house.'],
    ],
    reasons: [
      ['Photographs, not claims', 'You see what we saw up there, before you decide anything.'],
      ['We handle the insurer', 'Documentation, adjuster meetings and the paperwork.'],
      ['Written warranty', 'On the workmanship as well as the materials.'],
    ],
    faq: [
      ['Will insurance cover it?', 'Often, for storm damage. We document the claim properly and meet the adjuster on site.'],
      ['Repair or replace?', 'Depends on the age and how much of the roof is affected. We will tell you if a repair buys you five more years.'],
      ['How long does a roof take?', 'Most homes are one to two days, weather permitting.'],
    ],
    proof: 'Licensed, insured, and we handle the insurance paperwork',
    hero: { url: px('33404248'), alt: 'A roofer installing shingles with a nail gun', credit: 'Ryan Stephens' },
    gallery: [
      { url: px('37677394'), alt: 'A roofer installing asphalt shingles', credit: 'Ryan Stephens' },
      { url: px('37677476'), alt: 'Roofers working on a brick home', credit: 'Ryan Stephens' },
      { url: px('33404080'), alt: 'Workers installing a slate roof', credit: 'Ryan Stephens' },
    ],
    accent: '#2F5D3A', ink: '#13251A', wash: '#F3F8F4',
  },

  electrical: {
    label: 'Electrical',
    lede: 'Panel upgrades, a dead circuit, or the outlet that has been warm for a month. Licensed work, inspected and safe.',
    services: [
      ['Repairs and troubleshooting', 'The circuit nobody else could find.'],
      ['Panel upgrades', 'For older homes carrying modern loads.'],
      ['Lighting and outlets', 'Interior, exterior, and everything code requires.'],
      ['Generators and EV charging', 'Installed properly and permitted.'],
    ],
    reasons: [
      ['Permitted and inspected', 'Done to code, so it does not become a problem when you sell.'],
      ['We explain the why', 'You will understand what was wrong and what we did about it.'],
      ['Safety first, always', 'If something is dangerous we tell you immediately, job or no job.'],
    ],
    faq: [
      ['My outlet feels warm. Is that urgent?', 'Yes. Stop using it and call. A warm outlet is usually a loose connection and it is a fire risk.'],
      ['Do I need a panel upgrade?', 'If you have 60 or 100 amp service and keep tripping breakers, probably. We will check before quoting.'],
      ['Do you pull permits?', 'Always, on anything that needs one.'],
    ],
    proof: 'Licensed and insured',
    hero: { url: px('32497160'), alt: 'An electrician examining a residential fuse box', credit: 'Kathleen Austin Kuhn' },
    gallery: [
      { url: px('257736'), alt: 'An electrician working on a circuit breaker panel', credit: 'Pixabay' },
      { url: px('27928762'), alt: 'An electrician drilling into a circuit board', credit: 'ranjeet' },
      { url: px('14319099'), alt: 'An electrician using a multimeter on a control panel', credit: 'Onics Energy' },
    ],
    accent: '#8A6A12', ink: '#241D0C', wash: '#FBF8F0',
  },

  realestate: {
    label: 'Real estate',
    lede: 'Buying or selling should not feel like a fight. Clear guidance, straight answers, and someone protecting your time.',
    services: [
      ['Selling your home', 'Priced on real comparables, marketed properly, negotiated hard.'],
      ['Buying', 'Someone in your corner who will tell you when to walk away.'],
      ['Free home valuation', 'Prepared by hand from recent sales near you, not by an algorithm.'],
      ['Relocation', 'Local knowledge for someone arriving from out of state.'],
    ],
    reasons: [
      ['You always know where things stand', 'No wondering what is happening or what comes next.'],
      ['Honest pricing', 'Including when the honest number is lower than you hoped.'],
      ['We know these streets', 'The good and the tradeoffs, told to you plainly.'],
    ],
    faq: [
      ['What is my home actually worth?', 'We prepare a valuation by hand from recent sales near you. It is free and there is no obligation.'],
      ['How long will it take to sell?', 'Depends on price and condition. We will tell you honestly what each one is costing you.'],
      ['Do I need to renovate first?', 'Usually far less than people expect. We will tell you which jobs return their cost and which do not.'],
    ],
    proof: 'Licensed in Ohio',
    hero: { url: px('4044785'), alt: 'A suburban home with a porch and garden', credit: 'Curtis Adams' },
    gallery: [
      { url: px('4682075'), alt: 'A suburban home with classic architecture', credit: 'Curtis Adams' },
      { url: px('30652918'), alt: 'A historic white house with a wraparound porch', credit: 'John Cheathem' },
      { url: px('7710011'), alt: 'A modern suburban home with a stone facade', credit: 'Get Lost Mike' },
    ],
    accent: '#2A4A6B', ink: '#111E2C', wash: '#F4F7FA',
  },

  landscaping: {
    label: 'Landscaping and lawn care',
    lede: 'Weekly cuts, spring clean-ups, or a yard that has got away from you. We turn up on the day we said.',
    services: [
      ['Weekly mowing', 'Same day each week, so you stop thinking about it.'],
      ['Spring and fall clean-up', 'Leaves, beds, gutters and everything winter left behind.'],
      ['Design and planting', 'Beds and borders that still look right in three years.'],
      ['Mulch, edging and trimming', 'The details that make a yard look maintained rather than mown.'],
    ],
    reasons: [
      ['We show up', 'Same day every week. If weather moves us, you get a message.'],
      ['Flat seasonal pricing', 'One number for the season, so there is nothing to think about.'],
      ['We leave it clean', 'Blown down, cleared up, gate shut.'],
    ],
    faq: [
      ['Do you do one-off cleanups?', 'Yes. A lot of people start with one and go weekly afterwards.'],
      ['What happens if it rains?', 'We move you to the next dry day and tell you when.'],
      ['Do I need to be home?', 'No. Most of our customers are at work when we come.'],
    ],
    proof: 'Licensed and insured',
    hero: { url: px('6728925'), alt: 'Mowing a lawn on a sunny day', credit: 'Magic K' },
    gallery: [
      { url: px('11364122'), alt: 'Trimming grass in a sunny garden', credit: 'Pascal Küffer' },
      { url: px('6728919'), alt: 'Mowing a sunlit lawn with a push mower', credit: 'Magic K' },
      { url: px('9548417'), alt: 'Cutting grass in bright sunlight', credit: 'Reimond Mar Depra' },
    ],
    accent: '#3B6B33', ink: '#152210', wash: '#F4F8F2',
  },

  accounting: {
    label: 'Accounting and tax',
    lede: 'Books that are current, a return filed on time, and someone who picks up the phone in March.',
    services: [
      ['Tax preparation', 'Personal and business, filed on time, with the deductions you are owed.'],
      ['Bookkeeping', 'Monthly, so the year-end is not an emergency.'],
      ['Business advisory', 'Entity structure, payroll and the questions that cost money if you guess.'],
      ['Payroll', 'Run properly, with the filings handled.'],
    ],
    reasons: [
      ['You can reach us in March', 'The busiest month is when most people cannot get an answer. Not here.'],
      ['Plain English', 'You will understand what we did and why it matters.'],
      ['Fixed fees', 'Quoted up front, not billed by the six minutes.'],
    ],
    faq: [
      ['When should I switch accountants?', 'Any time. We handle the handover and request your prior returns ourselves.'],
      ['Do you work with small businesses?', 'Most of our clients are owner-operated. It is the work we know best.'],
      ['How much does a return cost?', 'We quote before we start, based on the actual complexity rather than a guess.'],
    ],
    proof: 'Licensed CPA',
    hero: { url: px('8296970'), alt: 'An accountant working through financial documents', credit: 'Mikhail Nilov' },
    gallery: [
      { url: px('33175651'), alt: 'Reviewing financial documents with a calculator', credit: 'Bia Limova' },
      { url: px('7680744'), alt: 'Calculating expenses at a desk', credit: 'kaboompics.com' },
      { url: px('8296974'), alt: 'Working through paperwork and folders at a desk', credit: 'Mikhail Nilov' },
    ],
    accent: '#1F4B57', ink: '#0E1D22', wash: '#F2F7F8',
  },

  insurance: {
    label: 'Insurance',
    lede: 'The right cover, explained properly, from someone local you can actually call when something happens.',
    services: [
      ['Home and auto', 'Bundled where it saves you money, separate where it does not.'],
      ['Business insurance', 'General liability, property and the cover your contracts require.'],
      ['Life and health', 'Sized to what your family would actually need.'],
      ['Policy review', 'Free, and we will tell you if you are already fine.'],
    ],
    reasons: [
      ['We answer at claim time', 'Anyone can sell a policy. The test is the day you need it.'],
      ['We shop it for you', 'Multiple carriers, one conversation.'],
      ['No pressure', 'If your current policy is good, we will say so.'],
    ],
    faq: [
      ['Will switching cost me?', 'Usually not. Most policies are cancelled pro rata and we time the changeover so there is no gap.'],
      ['Do you handle claims?', 'We walk you through it and deal with the adjuster alongside you.'],
      ['Is a review really free?', 'Yes, and there is no obligation. Plenty of people leave a review with the policy they came in with.'],
    ],
    proof: 'Licensed in Ohio',
    hero: { url: px('7734650'), alt: 'A handshake in an office meeting', credit: 'Mikhail Nilov' },
    gallery: [
      { url: px('8730120'), alt: 'Business professionals meeting around a table', credit: 'Mikhail Nilov' },
      { url: px('7734597'), alt: 'A couple shaking hands with an agent', credit: 'Mikhail Nilov' },
      { url: px('8730006'), alt: 'An agent closing a deal with clients', credit: 'Kampus Production' },
    ],
    accent: '#3D4B7A', ink: '#161B2E', wash: '#F4F5FA',
  },

  general: {
    label: 'Local service',
    lede: 'Straightforward work, done when we say and priced the way we quoted.',
    services: [
      ['What we do', 'The work you are known for, said plainly.'],
      ['How we work', 'Clear pricing, a clear timeline, and no surprises.'],
      ['Service area', 'The towns you actually cover.'],
      ['Get in touch', 'One button, answered by a person.'],
    ],
    reasons: [
      ['We answer', 'A person, not a queue.'],
      ['Quoted before we start', 'You approve the number first.'],
      ['We turn up when we said', 'And we call if anything changes.'],
    ],
    faq: [
      ['How do I get a quote?', 'Call or send a message. Most quotes are same day.'],
      ['What areas do you cover?', 'The surrounding towns. Ask if you are not sure.'],
      ['Are you insured?', 'Yes, and we can send the certificate.'],
    ],
    proof: 'Licensed and insured',
    hero: { url: px('6196229'), alt: 'A worker in uniform beside a service van', credit: 'Tima Miroshnichenko' },
    gallery: [
      { url: px('20077008'), alt: 'A collection of hand tools', credit: 'Muhammed zeya' },
      { url: px('33074110'), alt: 'Pliers and a wrench on a workbench', credit: 'svetlana photographer' },
      { url: px('18153234'), alt: 'A tradesman in a workshop', credit: 'Daniel Lienert' },
    ],
    accent: '#334A63', ink: '#141D26', wash: '#F5F7F9',
  },
}

/**
 * Pick a trade from the Google category list and the business name.
 *
 * Order matters: the trades are checked before the professions, because
 * "Smith Plumbing and Heating" should read as plumbing rather than HVAC, and a
 * roofing company that also does gutters is still a roofer.
 *
 * The real estate pattern accepts a space as well as an underscore. It
 * originally only matched Google's "real_estate_agency" category, so businesses
 * carrying it in their NAME instead ("Trent Ecklar Real Estate Team", "Carter
 * Real Estate Company") fell through to the generic profile and were shown a
 * photograph of hand tools.
 */
export function tradeOf(types: string[] | null, name: string): Trade {
  const hay = `${(types ?? []).join(' ')} ${name}`.toLowerCase()
  if (/plumb/.test(hay)) return 'plumbing'
  if (/hvac|heating|cooling|air.?condition|furnace/.test(hay)) return 'hvac'
  if (/roof/.test(hay)) return 'roofing'
  if (/electric/.test(hay)) return 'electrical'
  if (/landscap|lawn|garden_center|tree.?service|hardscap/.test(hay)) return 'landscaping'
  if (/real.?estate|realty|realtor|\bhomes\b|brokerage/.test(hay)) return 'realestate'
  if (/accounting|accountant|\bcpa\b|bookkeep|\btax\b/.test(hay)) return 'accounting'
  if (/insurance/.test(hay)) return 'insurance'
  return 'general'
}

/** "5743 Chevrolet Blvd, Parma, OH 44130, USA" -> "Parma" */
export function cityOf(address: string | null): string {
  if (!address) return 'Northeast Ohio'
  const parts = address.split(',').map((s) => s.trim())
  const city = parts.length >= 3 ? parts[parts.length - 3] : parts[0]
  return city && !/^\d/.test(city) ? city : 'Northeast Ohio'
}
