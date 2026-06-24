import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  fetchFeatures, validateCode, submitIntake, uploadIntakeFile,
  type IntakeFeature, type CodeInfo, type CustomRequest, type IntakeFile,
} from '../lib/intake'

const inputClass =
  'w-full px-4 py-2.5 rounded-lg bg-midnight-900/60 border border-midnight-700/50 text-silver-100 placeholder-silver-500 focus:outline-none focus:border-flame-500/60 transition-colors'

function Section({ step, title, subtitle, children }: { step: number; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="border border-midnight-700/30 rounded-2xl p-5 md:p-6 bg-midnight-900/40">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-xs font-mono text-flame-500">{String(step).padStart(2, '0')}</span>
        <div>
          <h2 className="text-lg md:text-xl font-display text-silver-100">{title}</h2>
          {subtitle && <p className="text-sm text-silver-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

export function Start() {
  const [params] = useSearchParams()
  const [code, setCode] = useState(params.get('code') ?? '')
  const [info, setInfo] = useState<CodeInfo | null>(null)
  const [checking, setChecking] = useState(false)
  const [gateError, setGateError] = useState('')
  const [features, setFeatures] = useState<IntakeFeature[]>([])

  const [form, setForm] = useState({ contact_name: '', business_name: '', email: '', phone: '', website: '', industry: '', goals: '', timeline: '' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [personal, setPersonal] = useState<Set<string>>(new Set())
  const [custom, setCustom] = useState<CustomRequest[]>([])
  const [files, setFiles] = useState<IntakeFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
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
    setSubmitting(true)
    try {
      const id = await submitIntake(code, {
        ...form,
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
      alert('Something went wrong submitting. Please try again, or email Andrew.')
    } finally {
      setSubmitting(false)
    }
  }

  // --- Success ---
  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-flame-500/15 flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-flame-400" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <h1 className="text-3xl md:text-4xl font-display text-silver-100 mb-4">Thank you{form.contact_name ? `, ${form.contact_name.split(' ')[0]}` : ''}.</h1>
        <p className="text-lg text-silver-400 leading-relaxed">
          We have everything we need to get started. Andrew will review it, put together your plan, and reach out shortly. If you forgot something, just reply to his email or send another note.
        </p>
      </div>
    )
  }

  // --- Code gate ---
  if (!info) {
    return (
      <div className="max-w-md mx-auto px-6 py-24">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Client intake</p>
          <h1 className="text-3xl md:text-4xl font-display text-silver-100">Let's start your project</h1>
          <p className="text-silver-400 mt-4 leading-relaxed">Enter the access code Andrew gave you to open your intake form.</p>
        </div>
        <div className="border border-midnight-700/30 rounded-2xl p-6 bg-midnight-900/40">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter') void unlock(code) }}
            placeholder="Your access code"
            autoFocus
            className={`${inputClass} text-center font-mono tracking-widest text-lg`}
          />
          {gateError && <p className="text-sm text-red-400 mt-3 text-center">{gateError}</p>}
          <button
            onClick={() => void unlock(code)}
            disabled={checking || !code.trim()}
            className="mt-4 w-full py-3 rounded-lg bg-flame-500 hover:bg-flame-400 disabled:opacity-50 text-midnight-950 font-semibold transition-colors"
          >
            {checking ? 'Checking...' : 'Open my form'}
          </button>
          <p className="text-xs text-silver-500 mt-4 text-center">No code? Email <a href="mailto:anfaiconsulting@gmail.com" className="text-flame-400 hover:text-flame-300">anfaiconsulting@gmail.com</a></p>
        </div>
      </div>
    )
  }

  // --- Form ---
  return (
    <div className="max-w-3xl mx-auto px-5 md:px-6 py-12 md:py-16">
      <header className="mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">Client intake</p>
        <h1 className="text-3xl md:text-5xl font-display text-silver-100 leading-tight">
          {info.intro || `Welcome${info.client_name ? `, ${info.client_name}` : ''}. Let's build your project.`}
        </h1>
        <p className="text-silver-400 mt-4 leading-relaxed">
          Tell us about your business and pick what you want. Nothing here is locked in. It just gives Andrew everything he needs to put together your plan.
        </p>
      </header>

      <div className="space-y-5">
        <Section step={1} title="About you" subtitle="The basics so we can reach you.">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="text-sm text-silver-400">Your name *
              <input value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="Jane Smith" />
            </label>
            <label className="text-sm text-silver-400">Business name
              <input value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="Smith & Co." />
            </label>
            <label className="text-sm text-silver-400">Email *
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="you@business.com" />
            </label>
            <label className="text-sm text-silver-400">Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="(555) 123-4567" />
            </label>
            <label className="text-sm text-silver-400">Current website
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="yoursite.com (if any)" />
            </label>
            <label className="text-sm text-silver-400">Industry
              <input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="HVAC, real estate, coaching..." />
            </label>
          </div>
        </Section>

        <Section step={2} title="Your goals" subtitle="What would make this a win for you?">
          <textarea value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} rows={4} className={`${inputClass} resize-y`} placeholder="What do you want this to do for your business? What is not working today?" />
          <label className="block text-sm text-silver-400 mt-4">Ideal timeline
            <input value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })} className={`mt-1 ${inputClass}`} placeholder="e.g. live within 6 weeks" />
          </label>
        </Section>

        <Section step={3} title="What you'd like" subtitle="Pick everything that sounds useful. We will tailor your proposal to what you choose.">
          <div className="space-y-6">
            {groups.map((g) => (
              <div key={g.category}>
                <p className="text-xs font-semibold uppercase tracking-wider text-silver-500 mb-2">{g.category}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {g.items.map((f) => {
                    const on = selected.has(f.slug)
                    return (
                      <button
                        key={f.slug}
                        onClick={() => toggleIn(setSelected, f.slug)}
                        className={`text-left p-3 rounded-xl border transition-colors ${on ? 'border-flame-500/60 bg-flame-500/10' : 'border-midnight-700/40 bg-midnight-900/30 hover:border-midnight-700/70'}`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-flame-500 border-flame-500' : 'border-silver-600'}`}>
                            {on && <svg viewBox="0 0 24 24" className="w-3 h-3 text-midnight-950" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-silver-100">{f.label}</p>
                            {f.description && <p className="text-xs text-silver-500 mt-0.5 leading-snug">{f.description}</p>}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {personalFeatures.length > 0 && (
          <Section step={4} title="A few things for you" subtitle="Optional personal touches we can fold in at no extra cost.">
            <div className="grid sm:grid-cols-2 gap-2">
              {personalFeatures.map((f) => {
                const on = personal.has(f.slug)
                return (
                  <button
                    key={f.slug}
                    onClick={() => toggleIn(setPersonal, f.slug)}
                    className={`text-left p-3 rounded-xl border transition-colors ${on ? 'border-flame-500/60 bg-flame-500/10' : 'border-midnight-700/40 bg-midnight-900/30 hover:border-midnight-700/70'}`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${on ? 'bg-flame-500 border-flame-500' : 'border-silver-600'}`}>
                        {on && <svg viewBox="0 0 24 24" className="w-3 h-3 text-midnight-950" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-silver-100">{f.label}</p>
                        {f.description && <p className="text-xs text-silver-500 mt-0.5 leading-snug">{f.description}</p>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </Section>
        )}

        <Section step={personalFeatures.length > 0 ? 5 : 4} title="Anything else?" subtitle="Something not on the list? Describe it and we will quote it separately.">
          <div className="space-y-3">
            {custom.map((c, i) => (
              <div key={i} className="grid sm:grid-cols-[1fr_1.5fr_auto] gap-2 items-start">
                <input value={c.title} onChange={(e) => setCustom(custom.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))} className={inputClass} placeholder="What is it?" />
                <input value={c.detail} onChange={(e) => setCustom(custom.map((x, idx) => idx === i ? { ...x, detail: e.target.value } : x))} className={inputClass} placeholder="A bit more detail" />
                <button onClick={() => setCustom(custom.filter((_, idx) => idx !== i))} className="px-3 py-2.5 text-silver-500 hover:text-red-400 text-sm">Remove</button>
              </div>
            ))}
            <button onClick={() => setCustom([...custom, { title: '', detail: '' }])} className="text-sm text-flame-400 hover:text-flame-300">+ Add a custom request</button>
          </div>
        </Section>

        <Section step={personalFeatures.length > 0 ? 6 : 5} title="Share your files" subtitle="Logo, brand assets, photos, anything you have. Optional.">
          <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border border-dashed border-midnight-700/60 bg-midnight-900/30 cursor-pointer hover:border-flame-500/50 transition-colors">
            <input type="file" multiple className="hidden" onChange={(e) => void onFiles(e.target.files)} />
            <span className="text-sm text-silver-400">{uploading ? 'Uploading...' : 'Click to upload files'}</span>
            <span className="text-xs text-silver-600">Images, PDFs, docs</span>
          </label>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-midnight-900/60 border border-midnight-700/50 text-xs text-silver-300">
                  {f.name}
                  <button onClick={() => setFiles(files.filter((_, idx) => idx !== i))} className="text-silver-500 hover:text-red-400">x</button>
                </span>
              ))}
            </div>
          )}
        </Section>
      </div>

      {/* Running summary + submit (stays in view while you pick) */}
      <div className="sticky bottom-4 mt-5 z-20 rounded-2xl border border-midnight-700/50 bg-midnight-950/90 backdrop-blur shadow-2xl shadow-black/40">
        <div className="px-4 md:px-5 py-3 flex items-center gap-4">
          <p className="flex-1 min-w-0 text-sm text-silver-300 truncate">
            {selected.size > 0 ? `${selected.size} ${selected.size === 1 ? 'item' : 'items'} selected` : 'Pick what you would like'}
            <span className="text-silver-500"> · we tailor your proposal to your choices</span>
          </p>
          <button
            onClick={() => void submit()}
            disabled={!canSubmit}
            className="shrink-0 px-6 py-3 rounded-lg bg-flame-500 hover:bg-flame-400 disabled:opacity-40 text-midnight-950 font-semibold transition-colors"
          >
            {submitting ? 'Sending...' : 'Submit'}
          </button>
        </div>
        {!canSubmit && !submitting && <p className="px-4 md:px-5 pb-2 text-[11px] text-silver-600">Add your name and email to submit.</p>}
      </div>
    </div>
  )
}
