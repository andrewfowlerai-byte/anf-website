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

## Type: Schibsted Grotesk, one family

Display 800, tracking -0.04em, leading 0.88. Text 400, functional text 600. Five steps and no others:
`--step-small`, `--step-body`, `--step-lead`, `--step-head`, `--step-display` (in `src/index.css`). Headlines are two
lines or fewer at every width. Left-aligned, except the hero.

## Layout

- Margins: `--edge` on every section. One 12-column grid.
- A chapter is at least 90svh. One thing per chapter.
- Square corners everywhere. One button shape: a flat flame rectangle with ink text (`.btn`, `BookCallButton`).
- The header is a plain bar in the logo's own navy (#07102B), so the chrome mark sits in it with no box. On a wide
  screen the logo takes the centre of the bar; on a phone it leads from the left. (First tried as a navy block
  flush in the top left corner of a paper bar. Andrew: "it feels out of place.")
- The founder section is his portrait set into the first lines of two plain paragraphs, like a drop capital, with
  three facts beside it. (First tried as two justified columns with highlighted words. Andrew did not like it. Do
  not bring highlighted words or justified type back.)
- The footer closes on the name, built from three blocks.

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

## What is still the old design

Only the home page is rebuilt. Services, Work, About, Book and the rest picked up the new header, footer, typeface
and button but still carry the old card layouts. Each needs its own pass against this page.
