# ANF Consulting website: design direction

Written 2026-11-23, when the home page was rebuilt. Andrew's words: "my website is SOOOO vibecoded". This page is the
art direction for anfconsult.com. Read it before designing or restyling any page here.

## What was wrong

The old home page failed 15 measured checks: nine small labels above headings, 01 to 04 numbering, twenty tiny
uppercase labels, gradients and glows, thirty outlined boxes, six rows of identical cards, fourteen font sizes, a
three-line centred headline with one orange word, and two real pictures in ten screens. Nothing in it was wrong and
nothing in it was decided. It is the anti-reference: do not polish it, replace it.

## The idea

**On this page, the real systems ANF has built become the answer when a visitor types their own trade.**

The proof is ANF's output: live builds for named kinds of business, pulled from the CRM's published showcase. A
visitor types "HVAC company" and gets the field-service platform; "real estate agent" and gets an agent's CRM. Every
picture on the site is a real build, a real person or a real app. Nothing is a mock-up, a stock photo or an
illustration of "technology".

## Direction: colour chapters

Every section is one flat field of a brand colour, floor to ceiling, butted against the next with no gap and no
line. The page reads like posters hung in a row, held together by one typeface and one grid. (Dealt by the taste
skill, seed 1925015714; reprint with `node ~/.claude/skills/design-taste-frontend/scripts/draw.mjs --show`.)

## Colour (the brand's own, used flat)

| Token | Value | Job |
| --- | --- | --- |
| `--paper` | #F5F7FA | light ground, the header bar |
| `--flame` | #F26B1D | the accent field and the one action. Ink text on it, never white (white fails contrast) |
| `--ink` | #060F1F | text on light fields, the darkest field, the footer |
| `--midnight` | #0B1A33 | the dark field |
| `--mist` | #C5CDDC | the quiet light field, chips, highlights |
| `--night` | #0A0F0D | Solden's section only, with Solden's gold #F2B544 |

Neighbouring fields differ in lightness as well as hue. No tints, no gradients, no shadows, no glows.

## Type: Archivo, one family, set wide

The logo's letters are wide and lean forward, so the display type is Archivo on its width axis (`--wide`, 122% on a
wide screen, 108% on a phone). Body text stays at normal width. (First set in Schibsted Grotesk, tight and compact.
Andrew: "the font screams vibecoded.") Display 800, tracking -0.03em, leading 0.94. Text 400, functional text 600. Five steps and no others:
`--step-small`, `--step-body`, `--step-lead`, `--step-head`, `--step-display` (in `src/index.css`). Headlines are two
lines or fewer at every width. Left-aligned, except the hero.

## Layout

- Margins: `--edge` on every section. One 12-column grid.
- A chapter is at least 90svh. One thing per chapter.
- **The lean.** One forward slant, taken from the logo, replaces the square: buttons, chips and the chat button are
  parallelograms (`.btn`, `.chip`, `.lean`); pictures and mosaic tiles lean (`.lean-pic`); every seam between
  two fields rises across the page (`--lean`; `.lean-stack` on the home page, `.lean-top` / `.lean-both` on a
  band, the slanted foot of `PageHero`). No rounded corners and no plain rectangles for anything decorative.
- **No boxes.** (Andrew: "all the square boxes".) What used to sit in a grey rectangle stands on the page under a
  small leaning flame mark (`.slab`). Form fields are the one outlined rectangle left.
- The header is a plain bar in the logo's own navy (#07102B), so the chrome mark sits in it with no box. On a wide
  screen the logo takes the centre of the bar; on a phone it leads from the left. (First tried as a navy block
  flush in the top left corner of a paper bar. Andrew: "it feels out of place.")
- The founder section is his portrait set into the first lines of two plain paragraphs, like a drop capital, with
  three facts beside it. (First tried as two justified columns with highlighted words. Andrew did not like it. Do
  not bring highlighted words or justified type back.)
- The footer closes on the real logo, in the logo's own navy.
- Solden on the home page is one short band under the hero ("Our most recent project:" ending on Solden's own
  wordmark, a sentence, the store badges), under half a screen. (It was a full chapter with the video. Andrew: "I
  dont think I actually want solden to take up anywhere near as much home page.") The full section is on About.
- The typed headline carries nine trades to try, each landing on a different build, and names up to three other
  builds that fit ("Also built for this"). The six on-site demos count as builds there and come last in a tie.

## Signature moves

1. The waterline hero: "Built around you" set across a paper and flame seam, flame above it, ink below.
2. The headline you can type (the one live thing).
3. The mosaic of unlike tiles, where no two neighbours hold the same kind of thing.
4. One real review spread edge to edge.
5. The request form's first step, already open on flame.

## Banned here

Labels above headings. Index numbers. Tiny uppercase letter-spaced labels. Gradients, glows, glass, shadows on
things at rest. Hairline rules and 1px outlined boxes. Rows of identical cards. Icons in circles. A coloured or
italic accent word in a headline. Monospace outside code. Emoji. Stock photos. Any price typed into code (prices are
CRM-managed).

## Motion

One loud move: the hero's lines rise from behind their baselines. Elsewhere text rises a little as it enters,
pictures and filled tiles are uncovered from their top edge, and every control answers a press or hover. All of it
stands down for reduced motion.

A page can author its own motion with `hooks/useMotion.ts` (Services, About and Book do): put the returned ref and
`data-motion` on the page root, then mark elements `data-reveal` (rises), `data-reveal="wipe"` (a picture is
uncovered and settles), `data-reveal="draw"` (a bar draws), `data-stagger` (children arrive in turn, `--step` sets
the gap) or `data-progress` (`--p` runs 0 to 1 across the screen). Every `PageHero` title arrives word by word.
Never put `data-reveal` on an element that is fully clipped: it never counts as on screen.

## Inner pages

Every page inside the site shell stands on paper with ink text (`main.on-paper`, set in `Layout`). Its header is
`PageHero`: one flame field with the title set large and left, sized by its length, with no label above it. Body
sections sit on the page margin (`px-[var(--edge)]`), left-aligned. There are no cards: a group is a `.slab`. Form fields are `.field` (white, a 2px ink outline). A page can drop in a full
chapter (`.ch .ch-flame` and so on) for its one big thing, usually its close.

- Services: the shared header, a real price table, each service line a band alternating paper and mist.
- Work: one build per band with its real screen large (`.wk-row`). The six interactive demos have real
  screenshots in `public/showcase/demo-*.jpg`. No drawn browser windows, numbers or badges.
- Book: the form beside "What happens next" as a real ordered list.
- About: the founder's portrait beside his story, the mission on mist, the four beliefs as large flame words on
  midnight, then Solden (`SoldenFeature`, ANF's own app; it replaced Everlee here on 2026-11-23).
- Handouts: white sheets that still print one to a page.
- The chat: a small square button. Its teaser shows on the first screen of wide screens only and tucks away on
  scroll, so it never sits on a heading.

## What is still the old design

Pages outside the shell or behind a link: the client onboarding form (`/onboard/:token`), the personal testimonial
link (`/testimonial/:token`), the class workbook (`/class`), the email signature tool, the digital business card
(`/andrew`), the six industry demos (they bring their own look on purpose) and the 3D experience. They share the
typeface only. The onboarding and testimonial forms were left alone deliberately: they cannot be opened without a
client's link, so a restyle there could not be checked.
