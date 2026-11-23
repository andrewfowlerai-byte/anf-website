import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchPublicReviews, type PublicReview } from '../../lib/reviews'
import { pickSpread, twoLines } from '../../lib/spread'
import { Reveal } from '../Reveal'

/**
 * One real review, spread edge to edge (2026-11-23 redesign). The words come live from the CRM's public reviews
 * (people who agreed to be quoted), never from this file: the shortest five-star one is set large on two lines, its
 * first word against the left margin and its last against the right. Nothing renders until there is a real one.
 */

export function QuoteSpread() {
  const [review, setReview] = useState<PublicReview | null>(null)
  const [more, setMore] = useState(0)

  useEffect(() => {
    let on = true
    fetchPublicReviews().then((r) => {
      if (!on) return
      setReview(pickSpread(r))
      setMore(r.length)
    })
    return () => { on = false }
  }, [])

  if (!review) return null
  const quote = review.quote.trim().replace(/^["“]+|["”]+$/g, '')
  const [a, b] = twoLines(quote)

  return (
    <section className="ch ch-ink" aria-label="What a client said" style={{ display: 'grid', alignContent: 'center' }}>
      <figure className="spread">
        <blockquote style={{ margin: 0 }}>
          <Reveal>
            <p className="spread-line">{a.map((w, i) => <span key={i}>{i === 0 ? `“${w}` : w}</span>)}</p>
          </Reveal>
          {b.length > 0 && (
            <Reveal delay={90}>
              <p className="spread-line">{b.map((w, i) => <span key={i}>{i === b.length - 1 ? `${w}”` : w}</span>)}</p>
            </Reveal>
          )}
        </blockquote>
        <Reveal delay={180}>
          <figcaption className="spread-by">
            <span style={{ fontWeight: 600 }}>{review.name}</span>
            {review.service && <span>{review.service}</span>}
            <Link to="/reviews" className="link">{more > 1 ? `Read all ${more} reviews` : 'Read the reviews'}</Link>
          </figcaption>
        </Reveal>
      </figure>
    </section>
  )
}
