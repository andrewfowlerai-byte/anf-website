/**
 * Guided sample walkthroughs.
 *
 * A card and an outbound link is not a sample. A lead who clicks through to a
 * live build lands in somebody else's dashboard with no idea what they are
 * looking at or which of twenty sections matters to them. The solo agent CRM
 * opens on "Good afternoon, Kiara". The family app opens on "Good afternoon,
 * Maya" and nineteen sections a stranger has no reason to explore. They leave
 * without seeing the thing that would have sold them.
 *
 * A walkthrough is the version Andrew would give in person: here is the screen,
 * here is what to notice, here is why it matters, next. Every image is a real
 * screenshot captured from the live build with its sample data, never a mockup,
 * so a lead is walked through exactly what they get.
 *
 * Screens live in public/walkthrough/<slug>/ and are refreshed by
 * scripts/capture-walkthrough.mjs when a build changes.
 */

export interface WalkthroughStep {
  /** File in public/walkthrough/<slug>/ */
  image: string
  /** What this screen is. Short. */
  title: string
  /** What to notice, and why it matters. Two sentences at most. */
  body: string
  /** Optional: the one detail on this screen worth calling out. */
  note?: string
}

export interface Walkthrough {
  slug: string
  /** Must match showcase_projects.title so a card can find its walkthrough. */
  showcaseTitle: string
  name: string
  /** Who it was built for, in general terms. Never a client's name. */
  builtFor: string
  intro: string
  liveUrl: string
  liveLabel: string
  /** Shown before the live link so nobody thinks they are entering real data. */
  dataNote: string
  steps: WalkthroughStep[]
}

export const WALKTHROUGHS: Walkthrough[] = [
  {
    slug: 'family',
    showcaseTitle: "A family's whole life, in one app",
    name: "A family's whole life, in one app",
    builtFor: 'A family running a household, two businesses and three kids',
    intro:
      'The largest thing on the Work page, so it is the one worth walking. Nineteen sections, and the parts most people do not expect an app to hold are the ones that end up mattering. Seven of them are below, in the order they earn their keep.',
    liveUrl: 'https://aubreeseverything.com',
    liveLabel: 'Open the real app',
    dataNote:
      'The live app opens on a sample family. No sign-up, no form, and nothing you do in it is saved to anyone real.',
    steps: [
      {
        image: 'today.jpg',
        title: 'The whole day, before coffee',
        body: 'One screen answers what is happening today, who has to be where, and what is about to be forgotten. Most families reconstruct this every morning from a fridge calendar and three apps.',
        note: 'Nothing here needed setting up. It is assembled from everything else in the app.',
      },
      {
        image: 'weekly-menu.jpg',
        title: 'Dinner decided once, not seven times',
        body: 'The week gets planned in one sitting, with swaps for the nights that fall apart. The question "what are we eating" stops being asked at five o’clock.',
      },
      {
        image: 'grocery-list.jpg',
        title: 'The list builds itself',
        body: 'Forty-six items, grouped by aisle, generated from the menu on the previous screen. Nobody typed this list, and that is the single biggest hour it gives back.',
        note: 'This is the step to watch. Menu into grocery list is the whole argument for a system over three separate apps.',
      },
      {
        image: 'kids-hub.jpg',
        title: 'Every kid, in one place',
        body: 'Sizes, doctors, allergies, teachers, activities. The details that live in one parent’s head until the moment somebody else needs them.',
      },
      {
        image: 'chores-allowance.jpg',
        title: 'Chores that actually settle up',
        body: 'What was assigned, what got done, and what is owed. It stops being a negotiation because the record already exists.',
      },
      {
        image: 'travel.jpg',
        title: 'Trips, not a separate app',
        body: 'Flights, stays and what still needs booking, sitting next to the calendar it has to fit around rather than buried in an inbox.',
      },
      {
        image: 'advisory-board.jpg',
        title: 'A private advisory board',
        body: 'The AI part, and deliberately last. It answers the questions that come up between all of the above, with the context of everything already in the app.',
        note: 'AI is a feature here, not the product. The other eighteen sections work with it switched off.',
      },
    ],
  },

  {
    slug: 'solo-agent',
    showcaseTitle: 'Solo Agent CRM + Finances',
    name: 'A solo agent’s business and money, together',
    builtFor: 'A single real estate agent with no team and no back office',
    intro:
      'Most agent CRMs handle the deals and leave the money to a spreadsheet, so an agent never actually knows what a year is worth until their accountant tells them. This one puts both in the same place. Twenty-two sections in three groups: the business, growing it, and the money.',
    liveUrl: 'https://solo-agent.anfconsult.com',
    liveLabel: 'Open the live CRM',
    dataNote:
      'Sample data throughout, and the passcode is on the card if it asks. Nothing in it belongs to a real client.',
    steps: [
      {
        image: 'today.jpg',
        title: 'What today actually needs',
        body: 'Not a dashboard of charts. The specific calls, showings and follow-ups that make up the next eight hours, with everything else out of the way.',
      },
      {
        image: 'pipeline.jpg',
        title: 'Every deal, and what stalls it',
        body: 'Each opportunity with its stage and what is holding it there. A solo agent loses deals to forgetting, not to competition.',
      },
      {
        image: 'buyers.jpg',
        title: 'Buyers, with what they actually want',
        body: 'Criteria, budget and timing per buyer, so a new listing is matched against real people rather than a mailing list.',
      },
      {
        image: 'reconnect.jpg',
        title: 'The database that usually rots',
        body: 'Past clients and old leads surfaced when it is time to speak to them again. This is the highest value screen in the app and the one every agent means to build and never does.',
        note: 'Repeat and referral business is most of an agent’s career. This is the part that protects it.',
      },
      {
        image: 'open-house.jpg',
        title: 'An open house that converts',
        body: 'Capture at the door and follow up automatically afterwards, instead of a paper sheet that gets photographed and forgotten.',
      },
      {
        image: 'commissions.jpg',
        title: 'What a closing is really worth',
        body: 'Gross commission, the brokerage split, and what actually lands in the agent’s account. Most agents can only estimate this.',
      },
      {
        image: 'spending-insights.jpg',
        title: 'And what it costs to earn it',
        body: 'Where the money goes across the year, so the business side is a number rather than a feeling. This is the half a normal CRM does not touch.',
        note: 'Business and money in one system is the whole point. Two tools cannot answer "was that listing worth it".',
      },
    ],
  },

  {
    slug: 'dual-business',
    showcaseTitle: 'Dual-Business Operating System',
    name: 'One person, two businesses',
    builtFor: 'A realtor on Cleveland’s West Shore who is also opening a bar',
    intro:
      'Built for someone running two businesses that share nothing except the person running them. The site had to sell a calm, high-touch real estate practice while a second operation ran behind it, without either feeling like an afterthought.',
    liveUrl: 'https://dual-business.anfconsult.com',
    liveLabel: 'Open the live site',
    dataNote: 'Sample listings and copy. Real photography, sample data.',
    steps: [
      {
        image: 'hero.jpg',
        title: 'A promise, not a headshot',
        body: '"A calmer way to move." Most agent sites open with a photograph and a phone number. This one opens with the thing the client actually wants.',
      },
      {
        image: 'promise.jpg',
        title: 'Said plainly, once',
        body: 'Navigating the market in a stress-free, straightforward way. One line, given room, so it is the sentence someone remembers.',
      },
      {
        image: 'portfolio.jpg',
        title: 'The work, shown as work',
        body: 'Current and recent homes across the West Shore, presented like a portfolio rather than a feed of listings.',
      },
      {
        image: 'territory.jpg',
        title: 'Owning a specific map',
        body: 'Westlake, Rocky River, Bay Village, Avon, Lakewood. Naming five towns beats claiming the whole county, because it is the difference between a specialist and a search result.',
        note: 'Territory is the strongest positioning move a solo agent has, and almost nobody uses it.',
      },
      {
        image: 'approach.jpg',
        title: 'Quiet process, loud results',
        body: 'How the work actually runs, step by step. This is the section that answers the question a seller is really asking, which is what it will be like to work with you.',
      },
      {
        image: 'about.jpg',
        title: 'Why this person',
        body: 'Marketing-trained and detail-obsessed, with the background that explains both. Credibility told through history rather than adjectives.',
      },
    ],
  },

  {
    slug: 'realtor-site',
    showcaseTitle: 'Realtor Marketing Website',
    name: 'A realtor site that reads like a person',
    builtFor: 'An agent on Cleveland’s West Side who wanted calm, not chrome',
    intro:
      'Real estate sites default to loud. This one goes the other way and is more persuasive for it. Six screens, and the neighborhood section is the one worth waiting for.',
    liveUrl: 'https://realtor-site.anfconsult.com',
    liveLabel: 'Open the live site',
    dataNote: 'Sample listings and sample reviews throughout.',
    steps: [
      {
        image: 'hero.jpg',
        title: 'Finding home, written in the stars',
        body: 'A quieter, more human way to buy and sell. The tone is set in the first four seconds, before a single listing appears.',
      },
      {
        image: 'philosophy.jpg',
        title: 'Arriving, not bracing for impact',
        body: 'Real estate should feel calm and organized, with the truth told even when it is unwelcome. This is a promise a nervous first-time buyer can actually feel.',
      },
      {
        image: 'collection.jpg',
        title: 'Listings as a collection',
        body: 'Presented as homes worth a look rather than inventory. Fewer, larger, with room to breathe.',
      },
      {
        image: 'neighborhoods.jpg',
        title: 'The honest story on each area',
        body: 'The good and the tradeoffs, named. Almost no agent site will tell you the downside of a neighborhood, which is exactly why doing it builds trust.',
        note: 'This is the section that turns a website into a reason to call someone.',
      },
      {
        image: 'guide.jpg',
        title: 'What the agent is for',
        body: 'Protecting your time, your money and your peace of mind. A job description rather than a list of credentials.',
      },
      {
        image: 'reviews.jpg',
        title: 'Proof in the client’s words',
        body: 'Specific stories about specific fears, which is the only kind of testimonial anyone believes.',
      },
    ],
  },

  {
    slug: 'realtor-leads',
    showcaseTitle: 'Realtor Lead-Capture Site',
    name: 'A site built to capture, not to impress',
    builtFor: 'A Greater Cleveland agent who relocated and is building a sphere',
    intro:
      'The opposite problem from a portfolio site. This one exists to turn a stranger into a name in the CRM, and every section is a different reason to hand over an email.',
    liveUrl: 'https://realtor-leads.anfconsult.com',
    liveLabel: 'Open the live site',
    dataNote: 'A live lead form. Anything submitted lands in a sample inbox, not a real pipeline.',
    steps: [
      {
        image: 'hero.jpg',
        title: 'Having Hopes is the first step',
        body: 'The agent’s own name doing the work in the headline. Memorable beats descriptive when someone has to recall you three weeks later.',
      },
      {
        image: 'summer-guide.jpg',
        title: 'Give something away first',
        body: 'A summer events guide for Greater Cleveland, split by area. Useful to someone who is not ready to move, which is the entire point.',
        note: 'This is the mechanism. Nobody fills in a "contact an agent" form. They will tap a map to see concerts near them.',
      },
      {
        image: 'full-guide.jpg',
        title: 'Then ask for the email',
        body: 'The complete guide, refreshed through the season, in exchange for an address. The ask arrives after the value, not before it.',
      },
      {
        image: 'home-value.jpg',
        title: 'The seller’s question',
        body: 'A free valuation prepared by hand rather than an instant automated number. Slower on purpose, because the hand-prepared version starts a conversation.',
      },
      {
        image: 'new-to-cleveland.jpg',
        title: 'A relocation story that fits',
        body: 'She moved here from Houston, so the welcome guide is credible rather than generic. Positioning built out of a real biographical fact.',
      },
    ],
  },

  {
    slug: 'retail',
    showcaseTitle: "Men's Wellness Shop and Journal",
    name: 'A shop and a mental health practice, in one',
    builtFor: 'A menswear brand that is really about how men feel',
    intro:
      'Two things that do not normally belong together: a clothing shop and a daily mental health check-in. The build works because the second one asks for nothing.',
    liveUrl: 'https://retail.anfconsult.com',
    liveLabel: 'Open the live shop',
    dataNote: 'A sample catalogue. Nothing is for sale and no order is real.',
    steps: [
      {
        image: 'hero.jpg',
        title: 'Menswear plus mental health',
        body: 'Feel at home in your own skin, starting with what you put on it. The connection is stated in the first line so nothing later feels bolted on.',
      },
      {
        image: 'check-in.jpg',
        title: 'One tap, and nothing is asked of you',
        body: 'Calm, choppy or rough. It stays on the device, there are no streaks, and there is no guilt for missing a day.',
        note: 'The restraint is the design. A streak counter would turn this into one more thing to fail at, which is the opposite of the point.',
      },
      {
        image: 'wear-it-well.jpg',
        title: 'Why clothes belong in this conversation',
        body: 'Clothes that fit the body you have today. When what you wear feels right, one background stressor goes quiet.',
      },
      {
        image: 'shop.jpg',
        title: 'Fewer, better, calmer',
        body: 'A deliberately short catalogue. A shop with eight products reads as a point of view; a shop with eighty reads as a warehouse.',
      },
      {
        image: 'journal.jpg',
        title: 'The content that earns the search traffic',
        body: 'Notes on steadier living, written to be read rather than to rank. This is the half of the business that brings people in.',
      },
      {
        image: 'give-back.jpg',
        title: 'The part that makes it true',
        body: 'A portion of every order funds therapy sessions for men who could not otherwise afford them. Without this the wellness framing would just be marketing.',
      },
    ],
  },

  {
    slug: 'bar',
    showcaseTitle: 'Italian Martini Bar',
    name: 'A bar with one very good idea',
    builtFor: 'A martini bar that had not opened yet',
    intro:
      'Built before the doors opened, which changes the job: there are no photographs of a full room and no reviews to lean on. The site has to make the place feel like it already exists.',
    liveUrl: 'https://bar.anfconsult.com',
    liveLabel: 'Open the live site',
    dataNote: 'A sample menu and sample pricing for a venue that was still being built.',
    steps: [
      {
        image: 'hero.jpg',
        title: 'From sunset to midnight',
        body: 'Cold glasses, warm rooms, and no reason to hurry. Atmosphere doing the work that a photograph of an empty room could not.',
      },
      {
        image: 'our-story.jpg',
        title: 'The martini, done right',
        body: 'A martini is the hour between work and dinner. Selling the occasion rather than the drink.',
      },
      {
        image: 'the-menu.jpg',
        title: 'Six martinis, nothing else matters',
        body: 'A short list is a confidence signal. The list changes with the season and the standard never does.',
      },
      {
        image: 'golden-hour.jpg',
        title: 'A reason to come at four',
        body: 'Half price, four to six, every table. The offer is aimed at the hardest hours to fill rather than the ones that fill themselves.',
      },
      {
        image: 'build-yours.jpg',
        title: 'Four choices, ninety-six martinis',
        body: 'Build one on the site and it prints a numbered bar ticket. Show it at the bar and the drink appears.',
        note: 'This is the piece worth stealing. It is a genuine reason to open the website before you leave the house, which almost no restaurant site has.',
      },
    ],
  },

  {
    slug: 'simple-site',
    showcaseTitle: 'Calm Five-Page Realtor Site',
    name: 'The build that got smaller on purpose',
    builtFor: 'An architect who was overwhelmed by a bigger proposal',
    intro:
      'This one is here as an argument, not a flex. The first version was far larger and it overwhelmed the client, so it was cut to four sections and got better. Sometimes the right build is the quiet one.',
    liveUrl: 'https://simple-site.anfconsult.com',
    liveLabel: 'Open the live site',
    dataNote: 'Real work, presented with sample project copy.',
    steps: [
      {
        image: 'hero.jpg',
        title: 'One phrase that does everything',
        body: '"The design doctor." A whole practice explained in three words, which is worth more than a page of positioning copy.',
      },
      {
        image: 'how-she-works.jpg',
        title: 'The process, in her own metaphor',
        body: 'She sees the space, then writes the prescription. Most houses do not need to be gutted, and saying so builds trust with a nervous homeowner.',
        note: 'The medical framing runs through the whole site without ever becoming a gimmick.',
      },
      {
        image: 'recent-work.jpg',
        title: 'Projects told as stories',
        body: 'One house serving three families over thirty years. A project list becomes something worth reading when each entry has a point.',
      },
      {
        image: 'contact.jpg',
        title: 'Start with a conversation',
        body: 'No booking widget and no quote calculator. For work like this the next step is a conversation, and pretending otherwise loses people.',
      },
    ],
  },
]

export function walkthroughFor(slug: string): Walkthrough | undefined {
  return WALKTHROUGHS.find((w) => w.slug === slug)
}

/** Does this showcase card have a guided walkthrough behind it? */
export function walkthroughForTitle(title: string): Walkthrough | undefined {
  return WALKTHROUGHS.find((w) => w.showcaseTitle === title)
}
