# Onboarding form: art direction

The form at `/onboard/:token`. ANF's own surface, so ANF's brand wins: midnight, silver, flame; Space Grotesk headings, Inter body.

## The world

A practice owner and her team filling in a long questionnaire between appointments, mostly on a phone, sometimes at the front desk computer. Up to 1,200 questions. It has to feel like a calm, well-kept working file, not a survey and not a marketing page. References, for what to take from each:

- A law firm's client intake binder: numbered parts, a table of contents, one topic per page.
- A tax organizer (the kind an accountant sends in January): plain questions, room to say "will send", nothing salesy.
- A spreadsheet the office manager already keeps: tables that feel like a grid, with a CSV round trip.

## One idea

**A calm working file.** Everything serves "I can stop any time and nothing is lost."

## Type

- Display: Space Grotesk 600. Form title 30/38 px, section title 26/30 px, `text-wrap: balance`.
- Eyebrows: Space Grotesk 11 to 12 px, uppercase, tracking 0.14 to 0.16 em (part labels, "Your progress").
- Body: Inter. Question label 16 px medium, help 14 px, intro 15 to 17 px, meta 12 px with tabular figures.
- Inputs always 16 px on phones (iOS does not zoom).

## Color

| token | value | use |
|---|---|---|
| page | `#07102B` | page and bars. Matches the wordmark's own background, so the logo has no box around it |
| surface | midnight-900 | inputs, the current nav row, dialogs |
| hairline | midnight-800 / 700 | rules between questions, table grid |
| text | silver-100 / 300 / 500 | labels / body / help and meta |
| accent | flame-500 | the one primary action, focus ring, current section marker, Needed before chips |
| ok / warn / critical | emerald / amber / rose | Saved and Ready for ANF / offline and retrying / sensitive-number and refused notes |

The accent never means status; status colors never decorate.

## Imagery

None. This is a working document. The only image is the ANF wordmark. No illustrations, no icons in circles, no stock photos.

## Layout

- Desktop: table of contents left (288 px), one section per screen in a 720 px column, progress rail right at 1280 px and up.
- Phone: drawer table of contents, sticky Previous / Sections / Next bar, one card per table row.
- Signature moves, used everywhere:
  1. The table of contents set like a printed index: section, leader dots, `answered/total` in tabular figures, a Ready check.
  2. Section headers like a document page: `Part 4 / Services and booking`, the title, the intro, then a one-line ledger ("1 of 6 answered, 2 needed soon").
  3. Questions on hairline rules, never in cards. Who answered and when sits right-aligned in small tabular type.
  4. Tables look like a spreadsheet: row numbers in the gutter, the first column pinned while the rest scrolls.
