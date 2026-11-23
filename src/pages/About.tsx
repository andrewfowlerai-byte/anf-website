import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { SoldenFeature } from '../components/SoldenFeature'
import { useMotion } from '../hooks/useMotion'

const values = [
  {
    title: 'Clarity',
    body: 'We believe clarity creates confidence. Clear communication and clear expectations help people move with purpose. We remove noise and confusion so every message, system, and routine feels simple and easy to follow.',
  },
  {
    title: 'Structure',
    body: 'Structure creates freedom. Strong systems reduce stress, support consistency, and make daily work easier to manage. We design routines that help people stay organized, focused, and in control of their time.',
  },
  {
    title: 'Integrity',
    body: 'We believe in honest guidance and meaningful support. We do not offer shortcuts or empty promises. Our work is built on trust, transparency, and a commitment to doing what is right for the long term.',
  },
  {
    title: 'Practicality',
    body: 'We value solutions that work in real life. Everything we create is simple, usable, and grounded in the way people actually operate. We focus on routines that make work feel lighter, not more complicated.',
  },
]

/**
 * About. Rebuilt 2026-11-23 (DESIGN.md): the same words, set as chapters instead of stacked boxes, with its own
 * motion (hooks/useMotion.ts). The portrait is uncovered and settles; paragraphs arrive in turn; the four beliefs
 * stand as large words on the dark field, with no boxes around them. Solden, ANF's own app, takes the place Everlee
 * had (Andrew, 2026-11-23).
 */
export function About() {
  const motion = useMotion()
  return (
    <div ref={motion} data-motion>
      <PageHero
        title="Built around your business."
        subtitle="Steady guidance through change. Simple systems that hold up. One partner, one roadmap, one team."
      />

      {/* The founder: portrait and name on the left, his story beside it. */}
      <section className="ch-grid px-[var(--edge)] py-[clamp(3.5rem,7vw,6.5rem)] gap-y-10">
        <div className="col-span-12 md:col-span-5 min-w-0">
          <div data-reveal="wipe" className="lean-pic">
            <img
              src="/founder.webp"
              alt="Andrew Fowler, founder of ANF Consulting"
              width={1536}
              height={1024}
              decoding="async"
              className="block w-full aspect-[4/5] object-cover object-[42%_30%]"
            />
          </div>
          <h2 data-reveal className="t-head mt-8">Andrew Fowler</h2>
        </div>
        <div data-stagger className="col-span-12 md:col-span-6 md:col-start-7 min-w-0 grid gap-5 content-start" style={{ ['--step' as string]: '110ms' }}>
          <p className="t-lead">
            ANF Consulting was founded by Andrew Fowler, a systems-minded professional with years of experience working directly with modern tools and emerging technology. Andrew built this company after seeing how quickly the landscape was changing and how unprepared many professionals felt as new tools became part of everyday work.
          </p>
          <p>
            His background includes real estate, communication, and workflow design, but his strongest experience comes from years spent learning how these new tools actually behave in real situations. That hands-on work became the foundation for the education and consulting we provide today.
          </p>
          <p>
            Andrew brings a practical and steady approach to every project. He focuses on understanding how people think, how they work, and where they feel stuck. This perspective shapes the way ANF Consulting creates systems that feel natural, simple, and easy to maintain.
          </p>
          <p>
            As the founder, Andrew leads with clarity, integrity, and a commitment to helping people move through change with confidence. His work reflects a belief that modern tools should support human strengths, not replace them, and that every person deserves systems that make their work feel lighter and more intentional.
          </p>
        </div>
      </section>

      {/* The mission, on mist. */}
      <section className="on-mist lean-both px-[var(--edge)]">
        <div className="ch-grid gap-y-8">
          <h2 data-reveal className="t-head col-span-12 md:col-span-5">What we exist to do</h2>
          <div data-stagger className="col-span-12 md:col-span-6 md:col-start-7 grid gap-5" style={{ ['--step' as string]: '110ms' }}>
            <p className="t-lead">
              ANF Consulting exists to help people navigate a world where modern technology is no longer optional. The tools around us are changing quickly and they are becoming a permanent part of how work gets done. We believe this shift should feel like an opening, not a burden.
            </p>
            <p>
              Our mission is to guide professionals and small businesses through this transition with clarity, structure, and confidence. We help people understand how to use new tools in a way that protects their voice, strengthens their message, and supports the work they already do well.
            </p>
            <p>
              We focus on simple systems, clear communication, and routines that make everyday work easier. Our purpose is to help people move forward with confidence as the world continues to evolve.
            </p>
          </div>
        </div>
      </section>

      {/* What we believe: four words set large on the dark field. No boxes. */}
      <section className="on-midnight lean-both px-[var(--edge)]" style={{ marginTop: 'calc(-1 * var(--lean))' }}>
        <h2 data-reveal className="t-head">What we believe</h2>
        <div data-reveal="draw" className="mt-6 h-2.5 bg-flame-500" aria-hidden="true" />
        <div data-stagger className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-x-[clamp(2rem,6vw,6rem)] gap-y-12" style={{ ['--step' as string]: '130ms' }}>
          {values.map((v) => (
            <div key={v.title}>
              <h3 className="belief text-flame-500">{v.title}</h3>
              <p className="mt-4 max-w-[46ch]">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The story. */}
      <section className="ch-grid px-[var(--edge)] py-[clamp(3.5rem,7vw,6.5rem)] gap-y-8">
        <h2 data-reveal className="t-head col-span-12 md:col-span-5">How ANF came to be</h2>
        <div data-stagger className="col-span-12 md:col-span-6 md:col-start-7 grid gap-5" style={{ ['--step' as string]: '110ms' }}>
          <p className="t-lead">
            ANF Consulting began inside the real estate world, where clear communication and strong systems are essential. Early in his real estate career, our founder, Andrew Fowler, saw how quickly modern tools were becoming part of everyday work. He realized that professionals who learned to use these tools with clarity and intention would have a real advantage, while those who avoided them would eventually fall behind.
          </p>
          <p>
            This understanding shaped the direction of ANF Consulting. Andrew spent years working directly with new technology, learning how it behaved in real situations, and discovering how it could support the work professionals were already doing. As he shared what he learned, more people began asking for guidance. That interest eventually led to an invitation to teach a Continuing Education course in Ohio, where he helped real estate agents understand how to bring structure and clarity to their communication and daily routines.
          </p>
          <p>
            From that experience, ANF Consulting grew into a company focused on helping people move through change with confidence. We saw that most professionals did not need more complexity. They needed calm guidance, simple systems, and a way to understand new tools without feeling overwhelmed.
          </p>
          <p>
            Today, ANF Consulting helps individuals and small businesses create routines that support growth, reduce friction, and make everyday work feel lighter. Our story continues to evolve, but our foundation remains the same. We believe in clarity. We believe in structure. We believe in honest support that helps people move forward with confidence as the world continues to change.
          </p>
        </div>
      </section>

      {/* Solden, ANF's own app, in its own colours (the same section the home page carries). */}
      <SoldenFeature />

      <section className="ch ch-flame" style={{ minHeight: 0 }}>
        <h2 data-reveal className="t-display">Work with us</h2>
        <p data-reveal className="t-lead mt-6 mb-8 max-w-2xl">
          Tell us what you're trying to build. Andrew reads every request and gets back to you within one business day. No pitch, no pressure.
        </p>
        <Link to="/book" className="btn btn-ink">Send a request</Link>
      </section>
    </div>
  )
}
