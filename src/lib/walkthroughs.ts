/**
 * Guided sample walkthroughs.
 *
 * A card and an outbound link is not a sample. A lead who clicks through to a
 * live CRM lands on somebody else's dashboard with no idea what they are looking
 * at or which of nineteen sections is the one that matters to them. The family
 * app in particular opens on "Good afternoon, Maya" and a stranger has no reason
 * to click anything.
 *
 * A walkthrough is the version Andrew would give in person: here is the screen,
 * here is what to notice, here is why it matters, next. Every image is a real
 * screenshot captured from the live build with its sample data, never a mockup,
 * so what a lead is walked through is exactly what they get.
 *
 * Screens live in public/walkthrough/<slug>/ and are re-captured by
 * scripts/capture-walkthrough.mjs when a build changes.
 */

export interface WalkthroughStep {
  /** File in public/walkthrough/<slug>/ */
  image: string
  /** What this screen is. Short. */
  title: string
  /** What to notice, in Andrew's voice. Two sentences at most. */
  body: string
  /** Optional: the one detail worth calling out on this screen. */
  note?: string
}

export interface Walkthrough {
  slug: string
  /** Matches showcase_projects.title so a card can find its walkthrough. */
  showcaseTitle: string
  name: string
  /** Who this was built for, in general terms. Never a client's name. */
  builtFor: string
  intro: string
  /** Where the live sample actually lives. */
  liveUrl: string
  liveLabel: string
  /** Shown before the live link, so nobody thinks they are entering real data. */
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
      'This is the largest thing on the Work page, so it is the one worth walking. Nineteen sections, and the parts most people do not expect an app to hold are the ones that end up mattering. Seven of them are below, in the order they earn their keep.',
    liveUrl: 'https://aubreeseverything.com',
    liveLabel: 'Open the real app',
    dataNote:
      'The live app opens on a sample family. No sign-up, no form, and nothing you do in it is saved to anyone real.',
    steps: [
      {
        image: 'today.jpg',
        title: 'The whole day, before coffee',
        body:
          'One screen answers what is happening today, who has to be where, and what is about to be forgotten. Most families reconstruct this every morning from a fridge calendar and three apps.',
        note: 'Nothing here needed setting up. It is assembled from everything else in the app.',
      },
      {
        image: 'weekly-menu.jpg',
        title: 'Dinner decided once, not seven times',
        body:
          'The week gets planned in one sitting, with swaps for the nights that fall apart. The question "what are we eating" stops being asked at five o’clock.',
      },
      {
        image: 'grocery-list.jpg',
        title: 'The list builds itself',
        body:
          'Forty-six items, grouped by aisle, generated from the menu above it. Nobody typed this list, and that is the single biggest hour it gives back.',
        note: 'This is the step to watch. Menu into grocery list is the whole argument for a system over three apps.',
      },
      {
        image: 'kids-hub.jpg',
        title: 'Every kid, in one place',
        body:
          'Sizes, doctors, allergies, teachers, activities. The details that live in one parent’s head until the moment somebody else needs them.',
      },
      {
        image: 'chores-allowance.jpg',
        title: 'Chores that actually settle up',
        body:
          'What was assigned, what got done, and what is owed. It stops being a negotiation because the record already exists.',
      },
      {
        image: 'travel.jpg',
        title: 'Trips, not a separate app',
        body:
          'Flights, stays and what still needs booking, sitting next to the calendar it has to fit around rather than in an inbox.',
      },
      {
        image: 'advisory-board.jpg',
        title: 'A private advisory board',
        body:
          'The AI part, and deliberately last. It answers the questions that come up between all of the above, with the context of everything already in the app.',
        note: 'AI is a feature here, not the product. The other eighteen sections work with it switched off.',
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
