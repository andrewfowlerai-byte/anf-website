import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Solden, ANF's own health and wellness app, right under the home hero
 * (2026-11-16: "make sure Solden is front and center on the ANF website").
 * The section takes Solden's own colours (night green, sun gold) so it reads as
 * the product, not as one more ANF service card. Every line here matches what
 * solden.app says publicly; change them together.
 *
 * The 20 second "Meet Solden" video waits off screen with only its poster, then
 * plays muted when the section comes into view. Reduced motion or Save-Data
 * keeps the poster and the controls instead.
 */

const APP_STORE_URL = 'https://apps.apple.com/app/id6818184192'
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.solden'
const SITE_URL = 'https://solden.app'

const INSIDE = [
  { term: 'Coach', line: 'Type or talk. It logs what you ate, lifted or weighed, and builds plans around your week.' },
  { term: 'Training', line: 'Each lift starts from the weight in your own journal and suggests the next step up.' },
  { term: 'Move', line: 'Runs, rides, walks and hikes, with GPS that keeps going with the phone locked.' },
  { term: 'Food', line: 'Snap it, say it or scan the barcode. Calories, protein, carbs and fat, estimated.' },
  { term: 'Sleep and recovery', line: 'With your permission, sleep, resting heart rate and HRV against your own usual.' },
  { term: 'Friends', line: 'Share only what you choose. Kudos, comments, crews and weekly boards.' },
]

/** The header's Solden link points at #solden; a client-side navigation does not scroll by itself. */
function useSoldenHash() {
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === '#solden') document.getElementById('solden')?.scrollIntoView({ block: 'start' })
  }, [hash])
}

const BADGE = 'inline-flex leading-none rounded-[10px] transition-transform hover:-translate-y-px active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B544]'

/**
 * Solden on the home page: one short band (Andrew, 2026-11-23: "I dont think I actually want solden to take up
 * anywhere near as much home page as it is now ... maybe we could add 'most recent project'"). It names Solden as
 * the most recent project, says what it is in a sentence, and carries the two store badges. The whole section, with
 * what is inside the app and the video, is on About.
 */
export function SoldenStrip() {
  useSoldenHash()
  return (
    <section id="solden" aria-labelledby="solden-title" className="solden-strip scroll-mt-16">
      <div className="ch-grid items-center gap-y-8">
        <div className="col-span-12 md:col-span-8 min-w-0">
          <h2 id="solden-title" className="solden-strip-title">
            <span>Our most recent project:</span>
            <a href={SITE_URL} aria-label="Solden, at solden.app" className="inline-flex">
              <img src="/solden/solden-wordmark.svg" alt="Solden" width={789} height={150} />
            </a>
          </h2>
          <p className="mt-4 max-w-[64ch]">
            Our own health and wellness app, now on the App Store and Google Play. Workouts, runs, meals, sleep and
            friends in one place, with a built-in AI coach that knows your week.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a href={APP_STORE_URL} className={BADGE}>
              <img src="/solden/app-store.svg" width={168} height={56} alt="Download Solden on the App Store" className="h-12 w-auto" />
            </a>
            <a href={PLAY_STORE_URL} className={BADGE}>
              <img src="/solden/google-play.png" width={215} height={83} alt="Get Solden on Google Play" className="h-[71px] w-auto -my-[11px]" />
            </a>
            <a href={SITE_URL} className="text-[#F2B544] hover:text-[#F7CB72] font-semibold underline-offset-4 hover:underline">
              See it at solden.app <span aria-hidden>→</span>
            </a>
          </div>
        </div>
        <div className="hidden md:block md:col-span-4 min-w-0">
          <img
            src="/solden/meet-solden-poster.webp"
            alt="Solden on a phone: a run, a meal and a ride in one feed"
            width={720}
            height={1280}
            loading="lazy"
            decoding="async"
            className="lean-pic block w-full aspect-[2/1] object-cover object-[50%_42%]"
          />
        </div>
      </div>
    </section>
  )
}

export function SoldenFeature() {
  const video = useRef<HTMLVideoElement>(null)
  useSoldenHash()

  useEffect(() => {
    const v = video.current
    if (!v) return
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (still || saveData || typeof IntersectionObserver === 'undefined') {
      v.controls = true
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) v.play().catch(() => { v.controls = true })
        else v.pause()
      },
      { threshold: 0.35 },
    )
    io.observe(v)
    return () => io.disconnect()
  }, [])

  return (
    <section id="solden" aria-labelledby="solden-title" className="scroll-mt-16 bg-[#0A0F0D] text-[#F2F5F3]">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-10 items-center">
        <div className="lg:col-span-7 min-w-0">
          <a href={SITE_URL} aria-label="Solden at solden.app" className="inline-block">
            <img src="/solden/solden-wordmark.svg" alt="Solden" width={789} height={150} className="h-8 md:h-10 w-auto" />
          </a>
          <h2 id="solden-title" className="mt-8 font-display font-extrabold text-[1.75rem] sm:text-5xl md:text-[3.25rem] leading-[0.98] tracking-[-0.04em] text-[#F2F5F3] [text-wrap:balance]">
            Everything health and wellness, in one app.
          </h2>
          <p className="mt-6 max-w-xl text-lg md:text-xl leading-relaxed">
            Solden is our own app, now on the App Store and Google Play. Workouts, runs, meals, sleep and friends in one
            place, with a built-in AI coach that knows your week.
          </p>

          <dl className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 max-w-2xl">
            {INSIDE.map((i) => (
              <div key={i.term} className="min-w-0">
                <dt className="font-display text-lg text-[#F2B544]">{i.term}</dt>
                <dd className="mt-1 leading-relaxed text-[#F2F5F3]">{i.line}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a href={APP_STORE_URL} className="inline-flex leading-none rounded-[10px] transition-transform hover:-translate-y-px active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B544]">
              <img src="/solden/app-store.svg" width={168} height={56} alt="Download Solden on the App Store" className="h-14 w-auto" />
            </a>
            <a href={PLAY_STORE_URL} className="inline-flex leading-none rounded-[10px] transition-transform hover:-translate-y-px active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F2B544]">
              <img src="/solden/google-play.png" width={215} height={83} alt="Get Solden on Google Play" className="h-[83px] w-auto -my-[13px]" />
            </a>
            <a href={SITE_URL} className="text-[#F2B544] hover:text-[#F7CB72] font-medium underline-offset-4 hover:underline">
              See everything at solden.app <span aria-hidden>→</span>
            </a>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-[#A9B9B1] max-w-xl">
            Free to try. Features vary by plan. AI coaching is not medical care. Designed, built and run by ANF Consulting
            in Northeast Ohio.
          </p>
        </div>

        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <div className="relative w-[min(72vw,300px)]">
            <div className="relative z-10 rounded-[2.25rem] bg-[#121B17] p-2">
              <video
                ref={video}
                className="block w-full aspect-[9/16] rounded-[1.75rem] bg-[#0E1511] object-cover"
                src="/solden/meet-solden-720.mp4"
                poster="/solden/meet-solden-poster.webp"
                width={720}
                height={1280}
                muted
                loop
                playsInline
                preload="none"
                aria-label="Meet Solden: a 20 second look at the app"
              />
            </div>
            <div className="hidden sm:block absolute -left-[46%] bottom-10 w-[58%] rounded-[1.9rem] bg-[#121B17] p-1.5" aria-hidden>
              <img src="/solden/food-720.webp" width={720} height={1564} alt="" loading="lazy" className="block w-full rounded-[1.5rem]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
