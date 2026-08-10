import { Link } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { BookCallButton } from '../components/BookCallButton'
import { JsonLd } from '../components/JsonLd'
import { ANSWERS } from '../lib/answers'

/**
 * The answers index. These are the "money pages": deep, specific answers to
 * the questions buyers actually type, written to be quotable by an answer
 * engine rather than to hit a word count.
 *
 * ItemList schema so the set is legible to a crawler as a collection rather
 * than six unrelated URLs.
 */
export function Answers() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Answers for small business owners',
          itemListElement: ANSWERS.map((a, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: a.question,
            url: `https://anfconsult.com/answers/${a.slug}`,
          })),
        }}
      />

      <PageHero
        eyebrow="Answers"
        title={
          <>
            Straight answers, <span className="text-flame-400">with the numbers</span>
          </>
        }
        subtitle="The questions owners actually ask us, answered properly. Real prices, real trade-offs, and the parts most people selling this will not tell you."
      />

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ANSWERS.map((a) => (
            <Link
              key={a.slug}
              to={`/answers/${a.slug}`}
              className="group rounded-2xl border border-midnight-700/60 bg-midnight-900/40 p-6 hover:border-flame-500/50 transition-colors"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-flame-400/80 mb-3">{a.audience}</p>
              <h2 className="text-xl font-display text-silver-100 leading-snug group-hover:text-white transition-colors">
                {a.question}
              </h2>
              <p className="mt-3 text-sm text-silver-400 leading-relaxed">{a.answer}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-flame-400">
                Read it <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-midnight-700/60 bg-midnight-900/40 p-8 text-center">
          <h2 className="text-2xl font-display text-silver-100">Not the question you had?</h2>
          <p className="mt-3 text-silver-400 max-w-xl mx-auto leading-relaxed">
            Send it over. If it is worth answering properly it probably belongs on this page, and you will get
            an answer either way.
          </p>
          <div className="mt-7">
            <BookCallButton />
          </div>
        </div>
      </section>
    </>
  )
}
