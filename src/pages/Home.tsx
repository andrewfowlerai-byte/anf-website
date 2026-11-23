import { SoldenStrip } from '../components/SoldenFeature'
import { TypedBuilds } from '../components/home/TypedBuilds'
import { WorkMosaic } from '../components/home/WorkMosaic'
import { Story } from '../components/home/Story'
import { QuoteSpread } from '../components/home/QuoteSpread'
import { RequestStart } from '../components/home/RequestStart'

/**
 * The home page, redesigned 2026-11-23 ("Colour chapters", DESIGN.md). Each section is one flat field of a brand
 * colour, floor to ceiling, and each makes one claim with its proof:
 *
 *   hero      ANF builds around you (the claim, split across a paper and flame waterline)
 *   Solden    it ships its own app (Solden's own colours; kept right under the hero, his call of 2026-11-16)
 *   builds    it has built for a business like yours (type your trade, get the real build)
 *   mosaic    four kinds of work, one person
 *   story     who he is, in one paragraph
 *   spread    what a client said (live from the CRM)
 *   request   the first step, already open
 *
 * The old page said these things in nine sections of identical cards under small labels. The words that were true
 * are still here; the cards, labels, numbers, gradients and glows are gone.
 */
export function Home() {
  return (
    <div className="lean-stack">
      <section className="hero" aria-labelledby="hero-title">
        {/* The seam cuts through the middle of the second line: flame above it, ink below, as if under water. */}
        <h1 id="hero-title" className="hero-title">
          <span className="line"><span>Built</span></span>
          <span className="line line-split"><span data-text="around you">around you</span></span>
        </h1>
        <p className="hero-support">
          Websites, CRMs, AI helpers and classes, made for one business at a time. Clarity. Integration. Automation.
        </p>
      </section>

      <SoldenStrip />
      <TypedBuilds />
      <WorkMosaic />
      <Story />
      <QuoteSpread />
      <RequestStart />
    </div>
  )
}
