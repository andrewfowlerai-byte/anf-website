# anf-website

The public ANF Consulting marketing site: **anfconsult.com**. Static SPA with no `api/` directory; anything server-side runs in **anf-crm** (shared Supabase, anon key, so tables must be RLS-readable by visitors).

## Stack

React 19, TypeScript, Vite, Tailwind v3, react-router-dom, Three.js / React Three Fiber (hero and showcase visuals).

## Scripts

- `npm run dev` Vite; `npm run lint` ESLint
- `npm run build` = `tsc -b && vite build`. Unused vars and type errors block the deploy, so clean before pushing.

## Deploy

Vercel auto-deploys on push to `main`.

## Layout

Pages in `src/pages/` (all lazy-loaded except `Home`; keep it that way), shared shell in `src/components/`, Supabase data modules in `src/lib/`. Map and details: `.claude/rules/site-layout.md`. Check `siteContent` (CRM-managed copy) before hardcoding a headline.

## Conventions

- **EASTERN TIME, ALWAYS.** ANF and its clients are in Northeast Ohio. `toLocaleDateString(undefined, ...)` renders in the *visitor's* timezone, so always pass `timeZone: 'America/New_York'` for any date a visitor sees, plus `timeZoneName: 'short'` on times (see `EventCard` in `src/pages/Events.tsx`). For a YYYY-MM-DD Eastern day use `toLocaleDateString('en-CA', { timeZone: 'America/New_York' })`, never `toISOString().slice(0, 10)`. Comparing two instants is fine.
- **No "book a call" CTAs, anywhere.** The CTA is **"Send a request"** (opens the contact form; `BookCallButton` defaults to it). `/book` is a request-a-call form that posts to the CRM `inbound-lead` with `callRequested: true`. Cal.com was removed 2026-10-14; do not add a scheduler back.
- **The one catchphrase is "Clarity. Integration. Automation."**
- **No em-dashes** in copy (use periods, commas, colons, parens). **No "boutique"**.
- **Brand voice**: calm, steady, practical. Marketing, infrastructure, AI and education weigh equally; not AI-first.
- **ANF does not sell social media management** (exited June 2026). Never pitch it or leave it in copy.
- **Never share Supabase keys, Stripe keys or any secret in chat.** Use env var names.
- **Mobile**: usable on a phone. Tailwind grids need an explicit base `grid-cols-1` or they overflow the right edge.
- **Forms persist**: anything a visitor types survives a tab switch or reload.
