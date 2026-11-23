import { Link } from 'react-router-dom'
import { Reveal } from '../Reveal'

/**
 * Who is behind it: his portrait set into the first lines of two plain paragraphs, like a drop capital (2026-11-23
 * redesign, second pass). The first version ran the story through two justified columns with highlighted words;
 * Andrew did not like it ("I dont love the section"), and it read as noise. This one is a photograph, two short
 * paragraphs and three facts. Every fact is one the About and Work pages already state.
 */
export function Story() {
  return (
    <section className="ch ch-mist" aria-label="About Andrew Fowler and ANF Consulting" style={{ minHeight: 0 }}>
      <div className="founder">
        <Reveal className="founder-facts">
          <p>Northeast Ohio</p>
          <p>State of Ohio CE provider</p>
          <p>Replies within one business day</p>
        </Reveal>

        <div className="founder-text">
          <Reveal>
            <p>
              <img className="founder-portrait" src="/founder.webp" alt="Andrew Fowler" width={1536} height={1024} loading="lazy" decoding="async" />
              <strong>Andrew Fowler</strong> started ANF Consulting inside the real estate world, where a missed follow-up
              costs a sale. He learned the new tools by using them every day, and was then invited to teach them. ANF is
              certified by the State of Ohio to give real estate professionals Continuing Education credit.
            </p>
          </Reveal>
          <Reveal delay={90}>
            <p>
              Today he builds the systems small businesses run on, from a five-page website to a three-app field service
              platform, and ships two apps of his own, Solden and Everlee. The client list stays small on purpose, and
              every tier and package is published. <Link to="/book" className="link">Tell him what you are trying to build.</Link>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
