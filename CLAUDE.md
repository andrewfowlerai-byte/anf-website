# anf-website

The public ANF Consulting marketing site: **anfconsult.com**.

React 19 + TypeScript + Vite + Tailwind v3 + react-router-dom. Three.js / React Three Fiber
powers the hero and showcase visuals. Deploys to Vercel automatically on push to `main`.

There is **no `api/` directory**. This is a pure static SPA (`vercel.json` rewrites everything
to `/`). Anything that needs a server runs in **anf-crm**, which shares the same Supabase
project. This repo talks to Supabase directly with the anon key, so every table it touches
must be readable under RLS by anonymous visitors.

## Layout

- `src/pages/` — one file per route. `Home`, `Services`, `Work`, `About`, `Book`, `Start`
  (client intake), `Audit` (free lead-magnet audit), `Refer`, `Events`, `FreeClass` +
  `ClassMaterial` + `Handouts` (the review-gated class workbook), `Reviews`, `Invest`,
  `Demos`, `Signature`, `Privacy`, `Terms`, `NotFound`.
- `src/components/` — shared shell (`Layout`, `Header`, `Footer`), plus `LeadChat`,
  `Testimonials`, `ProductShowcase`, `WatchItWork`, `JsonLd`, `ErrorBoundary`.
- `src/lib/` — Supabase-backed data access, one module per feature (`leads`, `intake`,
  `events`, `reviews`, `refer`, `audit`, `siteContent`, `showcase`, `classMaterials`,
  `freeClass`) plus `pageSeo` / `useSeo` for per-route meta.
- Every page except `Home` is `React.lazy`-loaded in `App.tsx`. Keep it that way; the 3D
  dependencies are heavy and the first paint budget depends on it.

## Conventions

- **EASTERN TIME, ALWAYS.** Every date, time, schedule, and "today" boundary defaults to
  Eastern unless Andrew explicitly says otherwise. ANF and its clients are in Northeast Ohio.
  In this repo the trap is **display formatting**: `toLocaleDateString(undefined, ...)` renders
  in the *visitor's* timezone, so a 6pm ET class reads as 3pm to someone in California. Always
  pass `timeZone: 'America/New_York'` for anything dated that a visitor sees, and add
  `timeZoneName: 'short'` on times so the hour is unambiguous (see `EventCard` in
  `src/pages/Events.tsx`). If server-side or scheduled code is ever added here, the same rule
  applies: `new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })` for a
  YYYY-MM-DD Eastern day, never `toISOString().slice(0, 10)` (that rolls over at 8pm ET).
  Comparing two instants (`starts_at >= new Date().toISOString()`) is fine; that derives no
  calendar day.
- **No "book a call" CTAs. Anywhere on this site or any subsite.** The site is request-first:
  the CTA is **"Send a request"** and it opens the contact form. `BookCallButton` already
  defaults to that label. On `/book`, the contact form comes first and the Cal.com scheduler
  is demoted to a secondary option below it. Do not reintroduce a scheduler-first flow.
- **The one catchphrase is "Clarity. Integration. Automation."** Use it consistently.
- **No em-dashes** anywhere in copy. They read as AI. Use periods, commas, colons, or parens.
- **No "boutique"**. Ever.
- **Brand voice**: calm, steady, practical. Clarity, structure, integrity, practicality.
  ANF gives **equal weight** to marketing, infrastructure, AI, and education. Not AI-first.
- **ANF does not sell social media management.** It was exited in June 2026. Never re-pitch it
  or leave it in copy.
- **Never share Supabase keys, Stripe keys, or any secret in chat.** Reference env var names.
- **Mobile**: every page must be usable on a phone. Tailwind grids need an explicit base
  `grid-cols-1` (not just `md:grid-cols-2`) or they overflow the right edge.
- **Forms persist.** Any form a visitor types into should survive a tab switch or reload.
- **Build gates the deploy.** `npm run build` runs `tsc -b && vite build`, so unused vars and
  type errors block the deploy. Clean before pushing.
- **Site copy is partly live-editable** from the CRM via the `siteContent` module. Before
  hardcoding a headline, check whether it is already CRM-managed.
