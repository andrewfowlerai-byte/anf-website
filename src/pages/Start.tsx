import { useEffect, useMemo, useState, memo, useCallback } from 'react'
import { useLocalDraft } from '../hooks/useLocalDraft'
import { useSearchParams } from 'react-router-dom'
import {
  fetchFeatures, validateCode, submitIntake, uploadIntakeFile,
  type IntakeFeature, type CodeInfo, type CustomRequest, type IntakeFile,
} from '../lib/intake'

const inputClass =
  'field'

// Program types let someone focus the catalog on what they actually want, so a
// personal/life build is not buried under CRMs and newsletters (and the reverse).
// Each maps to catalog categories; "personal" maps to the Personal/Life pack.
// Category strings must match intake_features.category (verified against the DB).
const PROGRAM_TYPES: { key: string; label: string; categories: string[]; personal?: boolean }[] = [
  { key: 'fieldservice', label: 'Field service & trades', categories: ['Field service', 'CRM', 'Scheduling', 'Operations & finance', 'Client portal'] },
  { key: 'realestate', label: 'Real estate tools', categories: ['Real estate', 'Website', 'CRM', 'Sales & follow-up', 'Marketing & content'] },
  { key: 'website', label: 'Website & brand', categories: ['Website', 'Branding & content'] },
  { key: 'crm', label: 'CRM & client management', categories: ['CRM', 'Sales & follow-up', 'Client portal', 'Scheduling'] },
  { key: 'ecommerce', label: 'Selling online', categories: ['E-commerce', 'Website', 'Operations & finance'] },
  { key: 'marketing', label: 'Marketing & content', categories: ['Marketing & content', 'Branding & content'] },
  { key: 'ai', label: 'AI & automation', categories: ['AI', 'Integrations'] },
  { key: 'teaching', label: 'Teaching & training', categories: ['Learning & training', 'Website', 'Scheduling'] },
  { key: 'ops', label: 'Billing & operations', categories: ['Operations & finance', 'Integrations'] },
  { key: 'personal', label: 'Personal & life tools', categories: [], personal: true },
]

function Section({ step, title, subtitle, children, open, onToggle, done }: {
  step: number
  title: string
  subtitle?: string
  children: React.ReactNode
  open: boolean
  onToggle: () => void
  done?: boolean
}) {
  return (
    <section className="bg-silver-200">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full text-left flex items-baseline gap-3 p-5 md:p-6"
      >
        {/* The order is in the page; a finished step says so in a word. */}
        <span className="text-[13px] font-semibold w-10 shrink-0" data-step={step}>{done ? 'Done' : ''}</span>
        <div className="flex-1 min-w-0">
          <h2 className="t-lead font-extrabold tracking-[-0.03em]">{title}</h2>
          {subtitle && <p className="text-midnight-500 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[13px] font-semibold shrink-0">{open ? 'Close' : 'Open'}</span>
      </button>
      {open && <div className="px-5 md:px-6 pb-5 md:pb-6">{children}</div>}
    </section>
  )
}


/**
 * One tile per category, expanded in place.
 *
 * The catalog is 80 options across 11 categories. Rendered as one flat list it
 * reads as a wall and people bail before they reach anything relevant. As tiles
 * they can see the whole shape of what is on offer in a single screen, then open
 * only the parts they care about. The selected count stays on the collapsed tile
 * so nothing they have chosen is ever hidden from them.
 */
const CategoryTile = memo(function CategoryTile({
  category, items, selected, onToggle, open, onOpen,
}: {
  category: string
  items: IntakeFeature[]
  selected: Set<string>
  onToggle: (slug: string) => void
  open: boolean
  onOpen: (category: string) => void
}) {
  const chosen = items.filter((f) => selected.has(f.slug)).length
  return (
    <div
      className={`transition-colors ${
 open
 ? ' bg-silver-200 sm:col-span-2 lg:col-span-3'
 : chosen > 0
 ? ' bg-midnight-100'
 : ' bg-silver-200 '
 }`}
    >
      <button
        onClick={() => onOpen(category)}
        aria-expanded={open}
        className="w-full text-left p-4 md:p-5 flex items-start gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="font-extrabold tracking-[-0.03em] md:t-lead leading-tight">{category}</p>
          <p className="mt-1 text-[13px] text-midnight-500">
            {items.length} option{items.length === 1 ? '' : 's'}
            {chosen > 0 && <span className="text-flame-700 font-medium"> &middot; {chosen} picked</span>}
          </p>
        </div>
        <span className="text-[13px] font-semibold shrink-0">{open ? 'Close' : 'Open'}</span>
      </button>

      {open && (
        <div className="px-4 md:px-5 pb-4 md:pb-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((f) => {
            const on = selected.has(f.slug)
            return (
              <button
                key={f.slug}
                onClick={() => onToggle(f.slug)}
                className={`text-left p-3 transition-colors ${on ? 'bg-midnight-950 text-silver-100' : 'bg-silver-100'}`}
              >
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 ${on ? 'bg-flame-500 text-midnight-950' : 'outline outline-2 -outline-offset-2 outline-midnight-950'}`}>
                    {on && <svg viewBox="0 0 24 24" className="w-3 h-3 text-midnight-950" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium">{f.label}</p>
                    {f.description && <p className="text-[13px] text-midnight-500 mt-0.5 leading-snug">{f.description}</p>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})

export function Start() {
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') ?? '')
  const [info, setInfo] = useState<CodeInfo | null>(null)
  const [checking, setChecking] = useState(false)
  const [gateError, setGateError] = useState('')
  const [features, setFeatures] = useState<IntakeFeature[]>([])

  // Persisted: this is the longest form on the site, people fill it across
  // sessions, and losing it on a tab switch is the one failure that guarantees
  // they never come back to finish.
  const [form, setForm] = useLocalDraft('start.form', { contact_name: '', business_name: '', email: '', phone: '', website: '', industry: '', goals: '', timeline: '', budget: '' })
  const [hp, setHp] = useState('') // honeypot: bots fill it, people never see it
  const [showCode, setShowCode] = useState(false)
  // Which tile is open. Persisted so switching tabs mid-form does not collapse
  // them back to the top of a catalog they were halfway through.
  const [openCat, setOpenCat] = useLocalDraft<string | null>('start.openCategory', null)
  // Stable identities, so memo on CategoryTile actually holds. A fresh arrow
  // here would make every tile re-render on every keystroke anyway.
  const toggleFeature = useCallback((slug: string) => {
    setSelected((prev) => { const n = new Set(prev); if (n.has(slug)) n.delete(slug); else n.add(slug); return n })
  }, [])
  // Which section is expanded. Only one at a time: that is the whole point.
  const [openSec, setOpenSec] = useLocalDraft<number>('start.openSection', 1)
  const sec = useCallback((n: number) => ({
    open: openSec === n,
    onToggle: () => setOpenSec(openSec === n ? 0 : n),
  }), [openSec, setOpenSec])

  const openCategory = useCallback((cat: string) => {
    setOpenCat((prev) => (prev === cat ? null : cat))
  }, [setOpenCat])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [personal, setPersonal] = useState<Set<string>>(new Set())
  const [programs, setPrograms] = useState<Set<string>>(new Set())
  const [showAll, setShowAll] = useState(false)
  const [custom, setCustom] = useState<CustomRequest[]>([])
  const [files, setFiles] = useState<IntakeFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [folder] = useState(() => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now())))

  useEffect(() => { void fetchFeatures().then(setFeatures) }, [])

  const unlock = async (c: string) => {
    if (!c.trim()) return
    setChecking(true); setGateError('')
    const res = await validateCode(c)
    setChecking(false)
    if (res && res.valid) {
      setInfo(res)
      setCode(c.trim())
      if (res.preset_features?.length) setSelected(new Set(res.preset_features))
    } else {
      setGateError('That code is not valid, or it has expired. Double-check it with Andrew.')
    }
  }

  // Auto-validate a code passed in the URL.
  useEffect(() => {
    const c = params.get('code')
    if (c) void unlock(c)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bizFeatures = useMemo(() => features.filter((f) => !f.is_personal), [features])
  const personalFeatures = useMemo(() => features.filter((f) => f.is_personal), [features])
  const groups = useMemo(() => {
    const g: { category: string; items: IntakeFeature[] }[] = []
    for (const f of bizFeatures) {
      let grp = g.find((x) => x.category === f.category)
      if (!grp) { grp = { category: f.category, items: [] }; g.push(grp) }
      grp.items.push(f)
    }
    return g
  }, [bizFeatures])

  // Focus the catalog to the chosen program types. No selection (or "show all")
  // means everything shows, so skipping the picker never hides anything.
  const activeCats = useMemo(() => {
    if (programs.size === 0 || showAll) return null
    const set = new Set<string>()
    for (const t of PROGRAM_TYPES) if (programs.has(t.key)) for (const c of t.categories) set.add(c.toLowerCase())
    return set
  }, [programs, showAll])
  const visibleGroups = useMemo(
    () => (activeCats ? groups.filter((g) => activeCats.has(g.category.toLowerCase())) : groups),
    [groups, activeCats],
  )
  const personalShown =
    personalFeatures.length > 0 &&
    (programs.size === 0 || showAll || [...programs].some((k) => PROGRAM_TYPES.find((t) => t.key === k)?.personal))

  const toggleIn = (setSet: React.Dispatch<React.SetStateAction<Set<string>>>, slug: string) =>
    setSet((prev) => { const n = new Set(prev); if (n.has(slug)) n.delete(slug); else n.add(slug); return n })

  const onFiles = async (list: FileList | null) => {
    if (!list || !list.length) return
    setUploading(true)
    for (const file of Array.from(list)) {
      const up = await uploadIntakeFile(folder, file)
      if (up) setFiles((prev) => [...prev, up])
    }
    setUploading(false)
  }

  const canSubmit = !!form.contact_name.trim() && !!form.email.trim() && !submitting

  const submit = async () => {
    if (!canSubmit) return
    // Honeypot tripped: pretend it worked, drop it silently.
    if (hp.trim()) { setDone(true); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    setSubmitting(true)
    setSubmitError('')
    try {
      const id = await submitIntake(code, {
        ...form,
        programs: [...programs].map((k) => PROGRAM_TYPES.find((t) => t.key === k)?.label).filter((x): x is string => !!x),
        selected_features: [...selected],
        personal_features: [...personal],
        custom_requests: custom.filter((c) => c.title.trim()),
        files,
      })
      // Fire-and-forget notification. A no-op unless enabled server-side, and
      // never blocks the success screen if it fails.
      if (id) {
        fetch('https://crm.anfconsult.com/api/intake-notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId: id }),
        }).catch(() => {})
      }
      setDone(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setSubmitError('Something went wrong submitting. Please try again, or email admin@anfconsult.com.')
    } finally {
      setSubmitting(false)
    }
  }

  // --- Success ---
  if (done) {
    return (
      <div className="max-w-2xl px-[var(--edge)] py-24">
        <div className="w-16 h-16 bg-midnight-100 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-flame-700" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h1 className="t-head font-extrabold tracking-[-0.03em] mb-4">Thank you{form.contact_name ? `, ${form.contact_name.split(' ')[0]}` : ''}.</h1>
        <p className="t-lead leading-relaxed">
          We have everything we need to get started. Andrew will review it, put together your plan, and reach out shortly. If you forgot something, just reply to his email or send another note.
        </p>
      </div>
    )
  }

  // --- Form (open to anyone; an access code is optional and personalizes it) ---
  return (
    <>
      <header className="page-hero on-flame">
        <h1 className="t-head page-hero-title is-long">
          {info?.intro
            ? info.intro
            : info?.client_name
              ? `Welcome, ${info.client_name}. Let's build your project.`
              : `Let's build your project.`}
        </h1>
        <p className="t-lead page-hero-sub">
          Tell us about your business and pick what you want. Nothing here is locked in. It just gives Andrew everything he needs to put together your plan.
        </p>

        {/* Optional access code. The form works without one; a code just personalizes it. */}
        {info ? (
          <p className="mt-4 font-extrabold">
            Access code applied{info.client_name ? `: ${info.client_name}` : ''}
          </p>
        ) : showCode ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') void unlock(code) }}
              placeholder="Access code"
              className={`${inputClass} max-w-[220px]`}
            />
            <button
              onClick={() => void unlock(code)}
              disabled={checking || !code.trim()}
              className="btn btn-ink disabled:opacity-50"
            >
              {checking ? 'Checking...' : 'Apply'}
            </button>
            {gateError && <p role="alert" className="w-full text-flame-700">{gateError}</p>}
          </div>
        ) : (
          <button onClick={() => setShowCode(true)} className="mt-4 link">
            Have an access code?
          </button>
        )}
      </header>

      <div className="max-w-3xl px-[var(--edge)] py-12 md:py-16">
      {/* Honeypot: parked off-screen, invisible to people. Only bots fill it. */}
      <div aria-hidden className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
        <label>Company URL
          <input tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
        </label>
      </div>

      <div className="space-y-5">
        {/* Focus picker: narrow the catalog to what they actually want. */}
        <section className="p-5 md:p-6 bg-silver-200">
          <h2 className="t-lead font-extrabold tracking-[-0.03em]">What are you looking for?</h2>
          <p className="text-midnight-500 mt-0.5">Pick any that apply and we will focus the options below. You can still open everything.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PROGRAM_TYPES.map((t) => {
              const on = programs.has(t.key)
              return (
                <button
                  key={t.key}
                  onClick={() => toggleIn(setPrograms, t.key)}
                  aria-pressed={on}
                  className="chip"
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </section>

        <Section step={1} title="About you" subtitle="The basics so we can reach you." done={Boolean(form.contact_name && form.email)} {...sec(1)}>
          <div className="grid sm:grid-cols-2 gap-4">
            <label>Your name *
              <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="Jane Smith" />
            </label>
            <label>Business name
              <input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="Smith & Co." />
            </label>
            <label>Email *
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="you@business.com" />
            </label>
            <label>Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="(555) 123-4567" />
            </label>
            <label>Current website
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="yoursite.com (if any)" />
            </label>
            <label>Industry
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="HVAC, real estate, coaching..." />
            </label>
          </div>
        </Section>

        <Section step={2} title="Your goals" subtitle="What would make this a win for you?" done={Boolean(form.goals)} {...sec(2)}>
          <textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} rows={4} className={`${inputClass} resize-y`} placeholder="What do you want this to do for your business? What is not working today?" />
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <label className="block">Ideal timeline
              <input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="e.g. live within 6 weeks" />
            </label>
            <label className="block">Budget range
              <input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="e.g. $3k to $6k, or not sure yet" />
            </label>
          </div>
        </Section>

        <Section step={3} title="What you'd like" subtitle={selected.size > 0 ? `${selected.size} picked so far` : 'Open whichever areas matter to you.'} done={selected.size > 0} {...sec(3)}>
          {selected.size > 0 && (
            <p className="mb-4 text-flame-700">
              {selected.size} selected so far. Nothing is committed, this just tells us what to shape the plan around.
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleGroups.map((g) => (
              <CategoryTile
                key={g.category}
                category={g.category}
                items={g.items}
                selected={selected}
                onToggle={toggleFeature}
                open={openCat === g.category}
                onOpen={openCategory}
              />
            ))}
          </div>
          {programs.size > 0 && (
            <button onClick={() => setShowAll((v) => !v)} className="mt-5 link">
              {showAll ? 'Show only what fits what I picked' : 'Show all options'}
            </button>
          )}
        </Section>

        {personalShown && (
          <Section step={4} title="A few things for you" subtitle={personal.size > 0 ? `${personal.size} picked` : 'Optional personal touches we can fold in.'} done={personal.size > 0} {...sec(4)}>
            <div className="grid sm:grid-cols-2 gap-2">
              {personalFeatures.map((f) => {
                const on = personal.has(f.slug)
                return (
                  <button
                    key={f.slug}
                    onClick={() => toggleIn(setPersonal, f.slug)}
                    className={`text-left p-3 transition-colors ${on ? 'bg-midnight-950 text-silver-100' : 'bg-silver-100'}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 w-4 h-4 flex items-center justify-center shrink-0 ${on ? 'bg-flame-500 text-midnight-950' : 'outline outline-2 -outline-offset-2 outline-midnight-950'}`}>
                        {on && <svg viewBox="0 0 24 24" className="w-3 h-3 text-midnight-950" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium">{f.label}</p>
                        {f.description && <p className="text-[13px] text-midnight-500 mt-0.5 leading-snug">{f.description}</p>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        <Section step={personalShown ? 5 : 4} title="Anything else?" subtitle="Something not on the list? Describe it and we will include it in your plan." {...sec(5)}>
          <div className="space-y-3">
            {custom.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_1.5fr_auto] gap-2 items-start">
                <input value={c.title} onChange={(e) => setCustom(custom.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} className={inputClass} placeholder="What is it?" />
                <input value={c.detail} onChange={(e) => setCustom(custom.map((x, idx) => idx === i ? { ...x, detail: e.target.value } : x))} className={inputClass} placeholder="A bit more detail" />
                <button onClick={() => setCustom(custom.filter((_, idx) => idx !== i))} className="px-3 py-2.5 text-midnight-500 hover:underline">Remove</button>
              </div>
            ))}
            <button onClick={() => setCustom([...custom, { title: '', detail: '' }])} className="link">+ Add a custom request</button>
          </div>
        </Section>

        <Section step={personalShown ? 6 : 5} title="Share your files" subtitle="Logo, brand assets, photos, anything you have. Optional." {...sec(6)}>
          <label className="flex flex-col items-center justify-center gap-2 py-8 border-dashed bg-silver-200 cursor-pointer transition-colors">
            <input type="file" multiple className="hidden" onChange={(e) => void onFiles(e.target.files)} />
            <span>{uploading ? 'Uploading...' : 'Click to upload files'}</span>
            <span className="text-[13px] text-midnight-500">Images, PDFs, docs</span>
          </label>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-silver-200 text-[13px]">
                  {f.name}
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-midnight-500 hover:underline">x</button>
                </span>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Running summary + submit (stays in view while you pick) */}
      <div className="sticky bottom-4 mt-5 z-20 bg-midnight-950 text-silver-100">
        <div className="px-4 md:px-5 py-3 flex items-center gap-4">
          <p className="flex-1 min-w-0 truncate">
            {selected.size > 0 ? `${selected.size} ${selected.size === 1 ? 'item' : 'items'} selected` : 'Pick what you would like'}
            <span className="hidden sm:inline">. We tailor your plan to your choices.</span>
          </p>
          <button
            onClick={() => void submit()}
            disabled={!canSubmit}
            className="shrink-0 px-6 py-3 bg-flame-500 hover:bg-flame-400 disabled:opacity-40 text-midnight-950 font-semibold transition-colors"
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
        {submitError && <p role="alert" className="px-4 md:px-5 pb-2 text-[13px] text-flame-700">{submitError}</p>}
        {!canSubmit && !submitting && <p className="px-4 md:px-5 pb-2 text-[13px]">Add your name and email to submit.</p>}
      </div>
      </div>
    </>
  )
}
