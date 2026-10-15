---
paths:
  - "src/pages/**"
  - "src/components/**"
  - "src/lib/**"
  - "src/App.tsx"
---

# Layout (src/)

- `src/pages/` — one file per route. `Home`, `Services`, `Work`, `About`, `Book`, `Start`
  (client intake), `Audit` (free lead-magnet audit), `Refer`, `Events`, `FreeClass` +
  `ClassMaterial` + `Handouts` (the review-gated class workbook), `Reviews`, `Invest`,
  `Demos`, `Signature`, `Privacy`, `Terms`, `NotFound`, plus the client onboarding form
  at `/onboard/:token`.
- `src/components/` — shared shell (`Layout`, `Header`, `Footer`), plus `LeadChat`,
  `Testimonials`, `ProductShowcase`, `WatchItWork`, `JsonLd`, `ErrorBoundary`.
- `src/lib/` — Supabase-backed data access, one module per feature (`leads`, `intake`,
  `events`, `reviews`, `refer`, `audit`, `siteContent`, `showcase`, `classMaterials`,
  `freeClass`) plus `pageSeo` / `useSeo` for per-route meta.
- Every page except `Home` is `React.lazy`-loaded in `App.tsx`. Keep it that way; the 3D
  dependencies are heavy and the first paint budget depends on it.
- **Site copy is partly live-editable** from the CRM via the `siteContent` module. Before
  hardcoding a headline, check whether it is already CRM-managed.
- Pure static SPA: no `api/` directory, and `vercel.json` rewrites everything to `/`.
  Anything that needs a server runs in **anf-crm** (same Supabase project). This repo uses
  the anon key directly, so every table it touches must be readable under RLS by
  anonymous visitors.
