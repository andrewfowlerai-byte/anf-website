/**
 * The "money pages": deep answers to the questions ANF's actual buyers type
 * into Google and ask an AI assistant.
 *
 * These are built for answer engines as much as for search. That means each
 * page leads with a direct, quotable answer in the first two sentences, uses
 * the question itself as the heading, states real numbers instead of ranges
 * where we have them, and carries FAQPage schema. An assistant summarizing
 * "what does field service software cost" should be able to lift a sentence
 * from here and have it be true.
 *
 * Content lives here rather than in JSX so the same text can feed the
 * syndication pipeline (LinkedIn, Medium, Substack) without being rewritten.
 *
 * Rule for editing: never invent a number. Every figure here is either ANF's
 * own published price or a fact from a real build. Competitor pricing is
 * described by its STRUCTURE (per user, per month, add-on modules) rather
 * than by a specific dollar figure, because their published prices move and a
 * stale number here reads as sloppy to the exact buyer we want.
 */

export interface AnswerSection {
  heading: string
  /** Paragraphs. Rendered in order. */
  body: string[]
  /** Optional bullet list rendered after the body. */
  bullets?: string[]
}

export interface AnswerFaq {
  q: string
  a: string
}

export interface Answer {
  slug: string
  /** The question, used as the H1 and the <title>. Phrase it the way a buyer types it. */
  question: string
  /** Nav label and card title. Shorter than the question. */
  label: string
  /** 150 to 160 characters, for the meta description. */
  description: string
  /** The direct answer. One or two sentences, quotable on its own. */
  answer: string
  /** Who this page is for, shown as an eyebrow. */
  audience: string
  sections: AnswerSection[]
  faqs: AnswerFaq[]
  /** Slugs of related answers. */
  related: string[]
}

export const ANSWERS: Answer[] = [
  {
    slug: 'field-service-software-cost',
    label: 'What field service software costs',
    question: 'What does field service software actually cost for a small company?',
    description:
      'A plain breakdown of what field service software costs a small crew: per-user subscriptions, the fees nobody quotes you, and when buying custom is actually cheaper.',
    answer:
      'For a small home service company, off-the-shelf field service software usually lands between one and four hundred dollars a month once you count every seat and add-on, and it scales up every time you hire. A custom platform is a larger one-time build, starting around $2,200 for a website and CRM and rising with scope, but it does not charge you more for growing.',
    audience: 'For plumbers, roofers, HVAC, and electrical contractors',
    sections: [
      {
        heading: 'The number they quote you is not the number you pay',
        body: [
          'Nearly every field service platform prices per user, per month. The headline figure on the pricing page is usually one or two seats on an annual commitment. That is rarely the shape of a real crew.',
          'The cost grows in three directions at once. You add seats as you hire. You add modules as you need them, because scheduling, invoicing, marketing, and reporting are frequently split across tiers. And you pay a processing fee on every card payment that runs through the system, which is a percentage of your revenue rather than a flat cost.',
          'That last one matters more than most owners expect. A payment fee is not a software cost you can cap. It is a permanent share of every job you invoice through the platform, and it rises exactly as fast as you do.',
        ],
        bullets: [
          'Per seat, per month, usually discounted only if you commit annually',
          'Tiered features, so the thing you actually called about often sits one tier up',
          'Payment processing taken as a percentage of what you bill',
          'Add-on modules priced separately: marketing, phone, reporting, price books',
        ],
      },
      {
        heading: 'What you are actually buying',
        body: [
          'To be fair to the category: these platforms are good, and for a lot of companies they are the right answer. They work on day one, somebody else maintains them, and you are not depending on a single developer.',
          'What you are giving up is fit and ownership. The software decides how your jobs flow, what a customer sees, and what you can report on. When your process does not match the software, you change your process. Most owners accept that trade without ever naming it.',
        ],
      },
      {
        heading: 'When custom is genuinely cheaper',
        body: [
          'Custom is not automatically the better deal, and anyone telling you otherwise is selling. It makes financial sense in a specific situation: you have enough seats that per-user pricing has become a real line item, your process does not fit the tool, and you intend to still be running in five years.',
          'At ANF a website build starts at $1,500. A complete platform with a website, CRM, and client portal starts at $2,200, with larger tiers at $4,500 and $8,000 depending on what the business actually needs. Those are one-time build costs, published openly, and the price is locked once you sign.',
          'The break-even math is simple enough to do on a napkin. Take your current monthly software spend, multiply by sixty for five years, and compare. For a crew of six or more, that comparison usually stops being close.',
        ],
      },
      {
        heading: 'The honest version',
        body: [
          'If you are one truck and you are happy, stay where you are. The subscription is cheap at that size and switching costs you time you do not have.',
          'If you are running a crew, paying for seats you resent, and working around the software instead of with it, that is when this conversation is worth having.',
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does field service software cost per month?',
        a: 'Most platforms charge per user per month, and a small company typically ends up between one and four hundred dollars a month once every seat and add-on module is counted. Payment processing fees are charged separately as a percentage of what you invoice through the system.',
      },
      {
        q: 'Is custom field service software cheaper than a subscription?',
        a: 'It becomes cheaper over a long enough horizon and a large enough crew. A custom platform is a one-time build starting around $2,200 rather than a recurring per-seat cost, so the savings grow as you hire. For a single-truck operation, a subscription is almost always the better economic choice.',
      },
      {
        q: 'What is the hidden cost of field service software?',
        a: 'Payment processing. Most platforms take a percentage of every card payment run through the system, which is uncapped and scales directly with your revenue, unlike the subscription itself.',
      },
    ],
    related: ['replacing-housecall-pro', 'crm-or-website'],
  },

  {
    slug: 'replacing-housecall-pro',
    label: 'Replacing Housecall Pro',
    question: 'What actually happens when you replace Housecall Pro with a custom system?',
    description:
      'A real account of moving an HVAC company off Housecall Pro onto a custom platform: what got migrated, what broke, and how long the parallel run took.',
    answer:
      'Replacing a field service platform is mostly a data and trust problem, not a software problem. When ANF moved Strive Heating and Cooling off Housecall Pro, roughly 3,700 customers, 6,600 jobs, and 6,000 invoices came across, and the new system ran in parallel with the old one before anything touched a customer.',
    audience: 'For owners considering a switch',
    sections: [
      {
        heading: 'The build is the easy part',
        body: [
          'Owners assume the risk lives in the software. It does not. The software is predictable. The risk lives in your history: years of customers, jobs, invoices, and notes that your business actually depends on and that nobody has audited in a long time.',
          'For Strive, a heating and cooling company in Northeast Ohio, that meant importing about 3,705 customers, 6,600 jobs, and 6,000 invoices out of Housecall Pro. Real data behaves nothing like test data. Fields are blank that should not be, the same customer exists three times under slightly different names, and phone numbers are stored six different ways.',
          'Most of the work in a migration is not writing the new system. It is reconciling what the old one was actually holding.',
        ],
      },
      {
        heading: 'Nothing touches a customer until you have proven it',
        body: [
          'The Strive rollout went internal first and stayed there. Owners and technicians ran on the real data, doing real jobs, while Housecall Pro was still running. Customer-facing messaging was locked behind a kill switch, and the customer side was sealed off entirely.',
          'That parallel run is not caution for its own sake. It is how you find out that a job status means something slightly different than you assumed, before a customer gets an automated text about it. The sequence that works is: owners first, then technicians, then reconcile the numbers against the old system and the books, and only then open a customer channel.',
        ],
        bullets: [
          'Import and reconcile the history before anyone relies on it',
          'Owners on real data first, then the crew',
          'Customer messaging off, behind a switch, until the internal run is clean',
          'Reconcile against the old platform and the accounting before cutting over',
        ],
      },
      {
        heading: 'What you get that you did not have',
        body: [
          'The point of leaving is not to save money on a subscription, though that follows. The point is that the system starts matching how the business actually runs instead of the other way around.',
          'Strive runs its own booking, dispatch to the technician phone, and invoicing on close. The reporting answers the questions that company asks, not the questions a product manager guessed a generic contractor might ask.',
        ],
      },
      {
        heading: 'What it costs you in time',
        body: [
          'Budget months, not weeks, and expect the parallel run to be the longest phase. Anyone promising a clean cutover in a fortnight has either not seen your data or is not planning to reconcile it.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Can you migrate data out of Housecall Pro?',
        a: 'Yes. Customers, jobs, and invoices can be exported and imported into a new system. For the Strive Heating and Cooling migration that was roughly 3,700 customers, 6,600 jobs, and 6,000 invoices. The work is less in the transfer than in reconciling duplicates, blank fields, and inconsistent formatting once it lands.',
      },
      {
        q: 'How long does it take to replace field service software?',
        a: 'Plan in months rather than weeks. The build is predictable, but the parallel run, where the new system operates alongside the old one on real data before any customer sees it, is the phase that determines whether the switch is safe.',
      },
      {
        q: 'Will my customers notice the switch?',
        a: 'They should not, and that is the design goal. Customer-facing messaging stays off until the internal run is verified and the numbers reconcile against both the old platform and the accounting.',
      },
    ],
    related: ['field-service-software-cost', 'crm-or-website'],
  },

  {
    slug: 'crm-or-website',
    label: 'CRM or just a better website?',
    question: 'Do I need a CRM or just a better website?',
    description:
      'How to tell whether your business is losing money at the front door or after the phone rings, and which one to fix first when you cannot afford both.',
    answer:
      'A website fixes whether people find you and decide to call. A CRM fixes what happens after they do. If you are not getting enough calls, fix the website first. If you are getting calls and losing them, the website is not your problem.',
    audience: 'For owners deciding where to spend first',
    sections: [
      {
        heading: 'Find the leak before you buy the bucket',
        body: [
          'These two tools solve problems on opposite sides of the phone ringing, and most owners buy the wrong one because they diagnose by symptom rather than by stage.',
          'Answer one question honestly: are you short on calls, or short on follow-through? Almost nobody is genuinely short on both, and whichever one you name is where the money is leaking.',
        ],
      },
      {
        heading: 'Signs the website is the problem',
        body: [
          'The pattern here is invisibility. People who already know your name can find you. Nobody else can.',
        ],
        bullets: [
          'You have no website, and your Google listing is doing all the work',
          'Your Google Business Profile still says "Claim this business", so you do not control your own listing',
          'The site does not work properly on a phone, where nearly all of your customers are',
          'It shows "Not Secure" in the browser bar',
          'Your reviews are strong but your call volume does not reflect that',
        ],
      },
      {
        heading: 'Signs the CRM is the problem',
        body: [
          'The pattern here is leakage. The calls come in and quietly disappear.',
        ],
        bullets: [
          'Calls go to voicemail while you are on a job and never get returned',
          'Quotes go out and nobody chases the ones that go quiet',
          'You cannot say how many jobs you quoted last month, or what percentage closed',
          'Scheduling lives in a notebook, a whiteboard, and somebody texts',
          'Invoices go out late because writing them is a separate chore at the end of the day',
        ],
      },
      {
        heading: 'The uncomfortable arithmetic',
        body: [
          'Work out what one job is worth to you on average. Then estimate how many calls a week go to voicemail and never come back.',
          'Multiply those two numbers. For most small service companies the answer is larger than the entire cost of fixing it, which is why this is usually the first thing worth measuring and the last thing anyone actually measures.',
        ],
      },
      {
        heading: 'If you can only do one',
        body: [
          'Do the website first if you are invisible, because a CRM has nothing to manage if the calls never arrive. Do the CRM first if you are busy and leaking, because more traffic into a leaky bucket just means losing more.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Should a small business get a website or a CRM first?',
        a: 'Get the website first if you are not receiving enough calls, since a CRM cannot manage leads that never arrive. Get the CRM first if calls are coming in and being lost to voicemail or unchased quotes.',
      },
      {
        q: 'Does a home service business really need a CRM?',
        a: 'Only if calls or quotes are being lost. If you can say how many jobs you quoted last month and what share closed, and nothing goes unanswered, you may not need one yet. If you cannot answer that, the money is leaking somewhere you cannot see.',
      },
      {
        q: 'What does a website cost for a home service company?',
        a: 'At ANF, website builds start at $1,500, with a larger tier at $3,500 and complex builds quoted per project. A complete platform including a CRM and client portal starts at $2,200.',
      },
    ],
    related: ['google-business-profile-cost', 'field-service-software-cost'],
  },

  {
    slug: 'google-business-profile-cost',
    label: 'The unclaimed Google listing',
    question: 'What does an unclaimed Google Business Profile cost your business?',
    description:
      'If your Google listing says "Claim this business", you do not control the first thing customers see about you. Here is what that costs and how to fix it free.',
    answer:
      'If your Google Business Profile is unclaimed, you do not control your own hours, photos, description, or replies to reviews, and for a business with no website that listing is your entire online presence. Claiming it is free and takes about fifteen minutes.',
    audience: 'For any local business',
    sections: [
      {
        heading: 'How to check in ten seconds',
        body: [
          'Search your business name on Google and look at the panel on the right. If you see the words "Claim this business", nobody has verified ownership of it. If you see "Add website" or "Add photos", Google is telling you outright that the information is incomplete.',
          'This is more common than people assume, particularly among trades businesses that have run on word of mouth for twenty years and never needed to think about it.',
        ],
      },
      {
        heading: 'What you lose while it sits unclaimed',
        body: [
          'An unclaimed listing still shows up. That is the trap: it looks like it is working, so nobody touches it.',
        ],
        bullets: [
          'You cannot reply to reviews, including the unfair ones, and unanswered complaints are what a new customer reads first',
          'Your hours may be wrong, which sends people to a competitor who is open',
          'The public can suggest edits to your information and you will not be asked',
          'No photos, when listings with photos get materially more calls and direction requests',
          'You cannot post updates, offers, or seasonal availability',
        ],
      },
      {
        heading: 'Fix it yourself, free',
        body: [
          'This is genuinely free and you do not need anyone to do it for you. Go to Google Business Profile, search for your business, and select the option to claim or manage it. Google verifies ownership, usually by postcard, phone, or email.',
          'Once verified: correct your hours, add real photos of your actual work and your actual trucks, write a description that says what you do and where, and reply to every review you have, including the old ones.',
        ],
      },
      {
        heading: 'Why we tell you to do it yourself',
        body: [
          'Because it is free, it takes fifteen minutes, and you should not pay anyone for it. If a business claims its listing, fixes its hours, and gets more calls without spending a dollar, that is a good outcome.',
          'The work worth paying for starts after that: turning the traffic into booked jobs and making sure nothing falls through once the phone rings.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is claiming a Google Business Profile free?',
        a: 'Yes, entirely free. You verify ownership through Google directly, usually by postcard, phone call, or email, and no agency or subscription is required.',
      },
      {
        q: 'What happens if I never claim my Google Business Profile?',
        a: 'The listing still appears, but you cannot reply to reviews, correct your hours, add photos, or post updates. Members of the public can suggest changes to your information without your input.',
      },
      {
        q: 'Does a Google Business Profile replace a website?',
        a: 'It is better than nothing and for some businesses it carries all the traffic, but you do not own it and you cannot control what it shows or shut off a competitor appearing beside it. It is a listing on someone else platform, not a presence you control.',
      },
    ],
    related: ['crm-or-website', 'ai-for-small-business'],
  },

  {
    slug: 'ai-for-small-business',
    label: 'AI for a small service business',
    question: 'What can AI actually do for a small service business right now?',
    description:
      'An honest split between what AI genuinely does well for a small service company today, what is still oversold, and what it costs to implement properly.',
    answer:
      'For a small service business, AI is genuinely useful today for answering inbound leads immediately, drafting the writing you keep putting off, and summarizing information you already have. It is still oversold for anything that requires judgement about your customers or your money without a human checking it.',
    audience: 'For owners tired of the hype',
    sections: [
      {
        heading: 'What works right now',
        body: [
          'The wins are unglamorous and they are real. They share a shape: the task is high volume, low judgement, and a mistake is cheap and visible.',
        ],
        bullets: [
          'Answering an inbound lead within seconds instead of hours, which is usually the single largest improvement available to a service business',
          'Drafting the follow-up, the quote email, the review request, and the post you have been meaning to write',
          'Summarizing a long thread, a call, or a stack of notes into what you actually need to do',
          'Sorting and prioritizing a list, such as which quotes to chase first',
        ],
      },
      {
        heading: 'What is still oversold',
        body: [
          'Anything where being confidently wrong costs you a customer or money. AI writes and sorts well. It does not know your business, and it will produce a fluent, plausible, incorrect answer without signalling any doubt.',
          'The rule we build to is simple: automation drafts, a human sends. Anything that touches a client or a dollar gets a person in the loop. That is not timidity, it is the difference between a system you can leave running and one you have to babysit.',
        ],
      },
      {
        heading: 'Where the actual money is',
        body: [
          'Speed to lead. If a customer fills in your form or calls at eight in the evening and hears back the next afternoon, you have usually already lost to whoever answered first.',
          'That single change, responding immediately and consistently, outperforms nearly every other AI feature a small service business could buy, and it is also the easiest to measure. You either answered in under five minutes or you did not.',
        ],
      },
      {
        heading: 'What it costs to do properly',
        body: [
          'ANF prices AI implementation at $1,500, $2,500, and $5,000 depending on scope, and a single AI strategy session at $229. Those are published and flat.',
          'Be wary of anyone selling AI as an ongoing percentage of something, or unable to tell you exactly what the system will do before it is built. If the deliverable cannot be described in a sentence, it is not a deliverable.',
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the most useful AI feature for a small service business?',
        a: 'Responding to inbound leads immediately. Most service businesses lose work to whoever replies first, so consistent instant response typically outperforms every other AI feature available and is straightforward to measure.',
      },
      {
        q: 'Should AI send emails to my customers automatically?',
        a: 'Not without review. The safe pattern is that automation drafts and a human sends. Anything touching a client relationship or an invoice should have a person approving it, because AI produces confident, fluent, incorrect output with no warning.',
      },
      {
        q: 'How much does AI implementation cost for a small business?',
        a: 'ANF publishes flat AI implementation pricing at $1,500, $2,500, and $5,000 depending on scope, with a single strategy session at $229. Be cautious of pricing tied to a percentage of revenue or scope that cannot be described before the build.',
      },
    ],
    related: ['crm-or-website', 'field-service-software-cost'],
  },

  {
    slug: 'custom-software-vs-subscription',
    label: 'Custom build or subscription?',
    question: 'Should a small business build custom software or pay for a subscription?',
    description:
      'The honest trade between owning your software and renting it: when a subscription is clearly right, when custom pays off, and the questions to ask either way.',
    answer:
      'Pay for a subscription when your process is ordinary, your team is small, and you need it working this week. Build custom when the software is forcing you to work in a way that costs you money, or when per-seat pricing has quietly become one of your larger monthly bills.',
    audience: 'For owners weighing the two',
    sections: [
      {
        heading: 'Subscriptions are the right answer more often than consultants admit',
        body: [
          'If your process looks like everyone else in your trade, an off-the-shelf product has already solved it, and solved it better than a first version of anything custom. It works immediately, somebody else fixes it at two in the morning, and you are not dependent on one developer staying reachable.',
          'Anybody who tells you custom is always better is describing their invoice, not your business.',
        ],
      },
      {
        heading: 'The three conditions that flip it',
        body: [
          'Custom starts making sense when these stack up together. One alone is usually not enough.',
        ],
        bullets: [
          'Per-seat pricing has become a real line item, and every hire makes it worse',
          'You are actively working around the software, with the spreadsheet on the side that everyone pretends is temporary',
          'The thing that makes you different is the exact thing the software will not let you do',
        ],
      },
      {
        heading: 'What you actually own',
        body: [
          'This is the question most people forget to ask, and it matters more than the price.',
          'ANF clients own their data outright and license the software. The source stays with ANF, and a buyout is available if a client wants it. Whatever arrangement you land on, get it in writing before the build starts, and make sure you can leave with your customer list in a usable format. A vendor who will not put that in writing has told you something important.',
        ],
      },
      {
        heading: 'The questions to ask either way',
        body: [
          'These apply to a subscription vendor and a custom developer equally. The answers separate the two more clearly than any feature list.',
        ],
        bullets: [
          'If I leave, what exactly do I take with me, and in what format?',
          'What does this cost in year three, not month one?',
          'Who fixes it when it breaks on a Saturday?',
          'What happens to the price when I hire two more people?',
          'Can you tell me what it will do before I pay for it?',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is custom software worth it for a small business?',
        a: 'It is worth it when per-seat subscription costs have become significant, when your team is actively working around the software, or when your competitive difference is something the product will not support. For an ordinary process and a small team, a subscription is usually the better decision.',
      },
      {
        q: 'Who owns custom software after it is built?',
        a: 'That depends entirely on the agreement, which is why it should be in writing before the build begins. At ANF, clients own their data and license the software, the source stays with ANF, and a buyout is available. The critical point for any arrangement is being able to leave with your data in a usable format.',
      },
      {
        q: 'How much does custom business software cost?',
        a: 'ANF publishes flat pricing: website builds from $1,500, and complete platforms with a website, CRM, and client portal at $2,200, $4,500, and $8,000 depending on scope. Prices are locked once signed.',
      },
    ],
    related: ['field-service-software-cost', 'crm-or-website'],
  },
]

export function answerBySlug(slug: string): Answer | undefined {
  return ANSWERS.find((a) => a.slug === slug)
}
