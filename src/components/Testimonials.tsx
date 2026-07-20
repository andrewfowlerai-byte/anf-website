import { useEffect, useState } from 'react'
import { fetchPublicReviews, type PublicReview } from '../lib/reviews'

function Stars({ n }: { n: number }) {
  const r = Math.max(0, Math.min(5, Math.round(n || 0)))
  return (
    <span className="text-flame-400 text-sm tracking-wide" aria-label={`${r} out of 5 stars`}>
      {'★'.repeat(r)}
      <span className="text-silver-700">{'★'.repeat(5 - r)}</span>
    </span>
  )
}

/**
 * Social proof on the marketing site: real client testimonials that consented to
 * be public (allow_public). Pulled from the CRM's public-reviews endpoint.
 * Renders nothing until there is at least one, so the page never shows an empty
 * shell.
 */
export function Testimonials({
  fiveStarOnly = false,
  limit = 6,
  eyebrow = 'In their words',
  title = 'What clients say',
  hideHeader = false,
}: {
  fiveStarOnly?: boolean
  limit?: number
  eyebrow?: string
  title?: string
  hideHeader?: boolean
} = {}) {
  const [reviews, setReviews] = useState<PublicReview[]>([])

  useEffect(() => {
    let on = true
    fetchPublicReviews().then((r) => {
      if (!on) return
      const kept = fiveStarOnly ? r.filter((x) => (x.rating ?? 0) >= 5) : r
      setReviews(kept.slice(0, limit))
    })
    return () => {
      on = false
    }
  }, [fiveStarOnly, limit])

  if (reviews.length === 0) return null

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      {!hideHeader && (
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3">{eyebrow}</p>
          <h2 className="text-3xl md:text-4xl font-display text-silver-100">{title}</h2>
        </div>
      )}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <figure
            key={i}
            className="flex flex-col rounded-2xl border border-midnight-700/30 bg-midnight-900/40 p-6"
          >
            {typeof r.rating === 'number' && r.rating > 0 && <Stars n={r.rating} />}
            <blockquote className="mt-3 flex-1 text-silver-300 leading-relaxed">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-medium text-silver-100">{r.name}</span>
              {r.business && <span className="text-silver-500">, {r.business}</span>}
              {r.service && <span className="mt-0.5 block text-xs text-flame-500/80">{r.service}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
