import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { captureReferral } from '../lib/referralAttribution'

/**
 * anfconsult.com/r/:code
 *
 * The link a referral partner hands out. It records who sent the visitor and
 * then gets out of the way, because a partner shares this link expecting it to
 * open the actual site, not a receipt.
 *
 * The visitor sees a brief acknowledgement rather than a blank flash. That is
 * partly courtesy and partly practical: a partner who clicks their own link to
 * check it works needs to see that it did.
 */
export function ReferralLanding() {
  const { code = '' } = useParams()
  const navigate = useNavigate()
  const [name, setName] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  // A code resolves once. Without this, React's development double-invoke fires
  // two lookups and two redirects race each other.
  const started = useRef(false)

  useEffect(() => {
    // The ref is the whole guard. Do NOT add a cancelled flag alongside it:
    // StrictMode's double-invoke runs the cleanup and then skips the second
    // effect, so a cancelled flag would suppress the first run's state updates
    // and leave this page stuck on its loading copy forever.
    if (started.current) return
    started.current = true

    const go = async () => {
      try {
        const r = await captureReferral(code)
        setName(r.partnerName)
      } catch {
        /* Attribution is best effort. Never block the visit on it. */
      } finally {
        setDone(true)
      }
    }
    void go()
  }, [code])

  // Belt and braces: if the lookup neither resolves nor rejects (a hung
  // request, an offline device), the visitor still reaches the site.
  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 2500)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!done) return
    // Long enough to read, short enough not to feel like a wall. replace: true
    // keeps the referral URL out of the back button, so Back leaves the site
    // rather than re-running the redirect.
    const t = window.setTimeout(() => navigate('/', { replace: true }), name ? 1400 : 500)
    return () => window.clearTimeout(t)
  }, [done, name, navigate])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-24">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-flame-500">
          {name ? 'Welcome' : 'One moment'}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-silver-100 sm:text-4xl">
          {name ? `${name} sent you.` : 'Taking you in.'}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-silver-400">
          {name
            ? 'We will make sure they get the credit. Have a look around.'
            : 'Loading the site.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="mt-8 rounded-full border border-midnight-700/60 px-6 py-2.5 text-sm text-silver-100 transition hover:border-flame-500 hover:text-flame-500"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default ReferralLanding
