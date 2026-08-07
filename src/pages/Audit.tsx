import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { runWebsiteAudit, type AuditResults } from '../lib/audit'
import { submitRequest } from '../lib/leads'
import { useLocalDraft, clearLocalDrafts } from '../hooks/useLocalDraft'
import { PageHero } from '../components/PageHero'

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="block text-sm text-silver-300 mb-1.5">
        {label}
        {required && <span className="text-flame-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-midnight-700/60 bg-midnight-900/60 px-4 py-2.5 text-silver-100 placeholder-silver-600 focus:border-flame-500 focus:outline-none"
      />
    </label>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const tone = score >= 60 ? 'bg-flame-500' : score >= 35 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm text-silver-300">{label}</span>
        <span className="text-sm font-semibold text-silver-100">{score}/100</span>
      </div>
      <div className="h-2 rounded-full bg-midnight-800 overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.max(score, 3)}%` }} />
      </div>
    </div>
  )
}

function CheckRow({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={ok ? 'text-emerald-400' : 'text-flame-400'}>{ok ? '✓' : '✗'}</span>
      <span className="text-silver-300">{ok ? okText : badText}</span>
    </li>
  )
}

export function Audit() {
  const [name, setName, clearName] = useLocalDraft('audit.name', '')
  const [business, setBusiness, clearBusiness] = useLocalDraft('audit.business', '')
  const [email, setEmail, clearEmail] = useLocalDraft('audit.email', '')
  const [website, setWebsite, clearWebsite] = useLocalDraft('audit.website', '')
  const [goal, setGoal, clearGoal] = useLocalDraft('audit.goal', '')
  const [hp, setHp] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const [results, setResults] = useState<AuditResults | null>(null)
  const [err, setErr] = useState('')

  const clearAll = () => {
    clearName(); clearBusiness(); clearEmail(); clearWebsite(); clearGoal()
    clearLocalDrafts('audit.name', 'audit.business', 'audit.email', 'audit.website', 'audit.goal')
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (hp) {
      setStatus('done')
      return
    }
    if (name.trim().length < 2 || !email.trim()) {
      setErr('Please add your name and email.')
      return
    }
    setStatus('sending')
    setErr('')
    try {
      if (website.trim()) {
        const r = await runWebsiteAudit({
          name: name.trim(),
          email: email.trim(),
          website: website.trim(),
          business: business.trim() || undefined,
          goal: goal.trim() || undefined,
        })
        if (r.live) setResults(r.results)
      } else {
        // No website to audit: still a real lead, Andrew reviews it by hand.
        await submitRequest({
          contact_name: name.trim(),
          business_name: business.trim() || undefined,
          email: email.trim(),
          notes: [`No website yet.`, goal && `Goal: ${goal.trim()}`].filter(Boolean).join('\n'),
          source: 'website-audit',
        })
      }
      setStatus('done')
      clearAll()
    } catch {
      setStatus('idle')
      setErr('Something went wrong. Please email admin@anfconsult.com and we will sort it out.')
    }
  }

  if (status === 'done' && results) {
    return (
      <>
        <PageHero
          eyebrow="Your audit"
          title={<>Here is what we found on {results.domain}</>}
          subtitle="The full copy is in your inbox. Reply to that email with any question and Andrew will answer it plainly, no pitch attached."
        />
        <section className="max-w-2xl mx-auto px-6 pb-20 space-y-6">
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 md:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <ScoreBar label="Website need" score={results.webNeedScore} />
              <ScoreBar label="Lead system need" score={results.systemNeedScore} />
            </div>
            <ul className="space-y-2 border-t border-white/[0.07] pt-5">
              <CheckRow ok={results.reachable} okText="Site loads" badText="Site did not load when we checked" />
              <CheckRow ok={results.https} okText="Served over HTTPS" badText="Not served over HTTPS (browsers flag this)" />
              <CheckRow ok={results.mobileFriendly} okText="Set up for mobile" badText="Missing mobile setup" />
              {results.platform !== 'None' && results.platform !== 'Unreachable' && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-silver-500">·</span>
                  <span className="text-silver-300">Platform: {results.platform}</span>
                </li>
              )}
            </ul>
            <div className="border-t border-white/[0.07] pt-5 space-y-3">
              {results.findings.map((f, i) => (
                <p key={i} className="text-sm text-silver-300 leading-relaxed">
                  {f}
                </p>
              ))}
              {results.summary && (
                <p className="text-sm text-silver-100 leading-relaxed border-l-2 border-flame-500 pl-4">
                  {results.summary}
                </p>
              )}
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 rounded-full bg-flame-500 hover:bg-flame-600 text-white font-semibold px-7 py-3.5 transition-colors shadow-flame-glow"
            >
              Talk it through with Andrew
            </Link>
          </div>
        </section>
      </>
    )
  }

  if (status === 'done') {
    return (
      <PageHero
        eyebrow="Request received"
        title="Your audit is on the way"
        subtitle="We will review your website and lead flow and send a short, specific audit within two business days. Want to talk it through sooner? Send a request below."
      >
        <Link
          to="/book"
          className="inline-flex items-center gap-2 rounded-full bg-flame-500 hover:bg-flame-600 text-white font-semibold px-7 py-3.5 transition-colors shadow-flame-glow"
        >
          Send a request
        </Link>
      </PageHero>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Free, no obligation"
        title={<>Free Website &amp; CRM Audit</>}
        subtitle="Enter your website and get an instant, specific read: where your site and lead flow are costing you, and the highest-leverage fixes. Results on screen and in your inbox. No pitch attached."
      />
      <section className="max-w-2xl mx-auto px-6 pb-20">
      <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-6 md:p-8">
        <input
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />
        <Field label="Your name" value={name} onChange={setName} required />
        <Field label="Business name" value={business} onChange={setBusiness} />
        <Field label="Email" value={email} onChange={setEmail} type="email" required />
        <Field label="Website (if you have one)" value={website} onChange={setWebsite} placeholder="yourbusiness.com" />
        <label className="block">
          <span className="block text-sm text-silver-300 mb-1.5">What are you hoping to improve?</span>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            rows={3}
            placeholder="More leads, a better site, a CRM to stay organized..."
            className="w-full rounded-xl border border-midnight-700/60 bg-midnight-900/60 px-4 py-2.5 text-silver-100 placeholder-silver-600 focus:border-flame-500 focus:outline-none"
          />
        </label>
        {err && <p role="alert" className="text-sm text-flame-400">{err}</p>}
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full rounded-xl bg-flame-500 hover:bg-flame-400 disabled:opacity-60 text-midnight-950 font-semibold px-6 py-3 transition-colors"
        >
          {status === 'sending' ? 'Running your audit...' : 'Run my free audit'}
        </button>
        <p className="text-center text-xs text-silver-600">
          We will only use this to send your audit and follow up. No spam.
        </p>
      </form>
      </section>
    </>
  )
}
