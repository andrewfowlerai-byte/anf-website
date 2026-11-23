import { Link, Navigate, useParams } from 'react-router-dom'
import { PageHero } from '../components/PageHero'
import { BookCallButton } from '../components/BookCallButton'
import { JsonLd } from '../components/JsonLd'
import { useSeo } from '../lib/useSeo'
import { answerBySlug, ANSWERS } from '../lib/answers'

/**
 * A single answer page.
 *
 * Structured for answer engines as much as for readers: the question is the
 * H1, the direct answer sits immediately under it in its own block so it can
 * be lifted whole, and FAQPage plus Article schema go into the head. An
 * assistant asked "what does field service software cost" should be able to
 * quote a sentence from here and be correct.
 *
 * SEO is set here rather than in pageSeo.ts because the title and description
 * are per-slug and live with the content.
 */
export function AnswerDetail() {
  const { slug } = useParams<{ slug: string }>()
  const answer = slug ? answerBySlug(slug) : undefined

  // Unknown slug goes back to the index rather than rendering an empty shell.
  // Hooks below must not run conditionally, so this returns before any of them.
  if (!answer) return <Navigate to="/answers" replace />
  return <AnswerBody slug={answer.slug} />
}

function AnswerBody({ slug }: { slug: string }) {
  const a = answerBySlug(slug)!
  useSeo({ title: a.label, description: a.description, path: `/answers/${a.slug}` })

  const related = a.related.map(answerBySlug).filter(Boolean)

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: a.faqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: a.question,
          description: a.description,
          author: { '@type': 'Organization', name: 'ANF Consulting', url: 'https://anfconsult.com' },
          publisher: { '@type': 'Organization', name: 'ANF Consulting', url: 'https://anfconsult.com' },
          mainEntityOfPage: `https://anfconsult.com/answers/${a.slug}`,
        }}
      />

      <PageHero title={a.question} subtitle={a.audience} />

      <article className="max-w-3xl px-[var(--edge)] pb-20">
        {/* The direct answer, first and on its own, so it can be quoted whole. */}
        <div className="bg-midnight-100 p-6 md:p-7">
          <p className="t-lead leading-relaxed">{a.answer}</p>
        </div>

        {a.sections.map((s) => (
          <section key={s.heading} className="mt-12">
            <h2 className="t-lead font-extrabold tracking-[-0.03em] leading-snug">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-4 leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-5 space-y-2.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-3 leading-relaxed">
                    <span aria-hidden className="mt-2 w-1.5 h-1.5 bg-flame-500 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-14">
          <h2 className="t-lead font-extrabold tracking-[-0.03em]">Common questions</h2>
          <div className="mt-6 space-y-3">
            {a.faqs.map((f) => (
              <details key={f.q} className="group bg-silver-200">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-medium">{f.q}</span>
                  <span aria-hidden className="text-flame-700 transition-transform group-open:rotate-45 t-lead leading-none">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 bg-silver-200 p-8">
          <h2 className="t-lead font-extrabold tracking-[-0.03em]">Want this looked at for your business?</h2>
          <p className="mt-3 max-w-xl leading-relaxed">
            Send a request with what you are running now and what is not working. You will get a straight answer,
            including when the answer is that you do not need us.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <BookCallButton />
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 px-6 py-3 transition-colors"
            >
              Get a free audit
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="t-lead font-extrabold tracking-[-0.03em]">Related</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r!.slug}
                  to={`/answers/${r!.slug}`}
                  className="bg-silver-200 p-5 transition-colors"
                >
                  <p className="font-medium leading-snug">{r!.question}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12">
          <Link to="/answers" className="link">
            All answers ({ANSWERS.length})
          </Link>
        </p>
      </article>
    </>
  )
}
