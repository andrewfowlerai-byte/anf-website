import { useState, type FormEvent } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { unlockClass, type ClassMaterial as ClassMat } from '../lib/classMaterials'
import GettingRealAiWorksheet from '../components/worksheets/GettingRealAiWorksheet'
import ClassReviewGate from '../components/ClassReviewGate'

export default function ClassMaterial() {
  const [code, setCode] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [material, setMaterial] = useState<ClassMat | null>(null)
  const [reviewed, setReviewed] = useState(false)

  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return
    setUnlocking(true)
    setError(null)
    try {
      const m = await unlockClass(code)
      if (!m) {
        setError("That code didn't match. Double-check the code from class.")
      } else {
        setMaterial(m)
        // Returning attendees who already reviewed on this device skip the form.
        try {
          setReviewed(localStorage.getItem(`anf-class-reviewed-${m.slug}`) === '1')
        } catch {
          setReviewed(false)
        }
      }
    } finally {
      setUnlocking(false)
    }
  }

  if (material) {
    // Gate the workbook behind a short class review. The class code already
    // proved they attended; the review flows to the CRM Reviews tab for socials.
    if (!reviewed) {
      return <ClassReviewGate slug={material.slug} onDone={() => setReviewed(true)} />
    }
    if (material.slug === 'getting-real-ai') return <GettingRealAiWorksheet title={material.title} />
    return (
      <div className="grid min-h-screen place-items-center bg-slate-100 px-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-midnight-900">{material.title}</h1>
          <p className="mt-2 text-slate-600">This worksheet isn't published yet. Check with Andrew.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-1 flex items-center gap-2 text-flame-600">
          <Lock className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">Class materials</span>
        </div>
        <h1 className="text-2xl font-bold text-midnight-900">Enter your class code</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
          Type the code from today's class to open your guide. You can download or print a copy to keep.
        </p>
        <form onSubmit={handleUnlock} className="mt-5 space-y-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ENTER CODE"
            autoComplete="off"
            autoCapitalize="characters"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-center font-mono uppercase tracking-[0.3em] text-midnight-900 placeholder-slate-300 focus:border-flame-500 focus:outline-none focus:ring-1 focus:ring-flame-500/40"
          />
          <button
            type="submit"
            disabled={unlocking || !code.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-flame-500 px-5 py-3 font-medium text-white transition-colors hover:bg-flame-600 disabled:opacity-60"
          >
            {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Open guide
          </button>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">ANF Consulting · anfconsult.com</p>
      </div>
    </div>
  )
}
