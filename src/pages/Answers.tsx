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
        title="Straight answers, with the numbers"
        subtitle="The questions owners actually ask us, answered properly. Real prices, real trade-offs, and the parts most people selling this will not tell you."
      />

      <section className="max-w-4xl px-[var(--edge)] pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ANSWERS.map((a) => (
            <Link
              key={a.slug}
              to={`/answers/${a.slug}`}
              className="group bg-silver-200 p-6 transition-colors"
            >
              <p className="text-[13px] text-flame-700 mb-3">{a.audience}</p>
              <h2 className="t-lead font-extrabold tracking-[-0.03em] leading-snug group-hover: transition-colors">
                {a.question}
              </h2>
              <p className="mt-3 leading-relaxed">{a.answer}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-flame-700">
                Read it
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-14 bg-silver-200 p-8">
          <h2 className="t-lead font-extrabold tracking-[-0.03em]">Not the question you had?</h2>
          <p className="mt-3 max-w-xl leading-relaxed">
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
