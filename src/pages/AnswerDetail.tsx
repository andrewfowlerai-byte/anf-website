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

      <PageHero eyebrow={a.audience} title={a.question} />

      <article className="max-w-3xl mx-auto px-6 pb-20">
        {/* The direct answer, first and on its own, so it can be quoted whole. */}
        <div className="rounded-2xl border border-flame-500/30 bg-flame-500/[0.06] p-6 md:p-7">
          <p className="text-[11px] uppercase tracking-[0.18em] text-flame-400 mb-3">The short answer</p>
          <p className="text-lg text-silver-100 leading-relaxed">{a.answer}</p>
        </div>

        {a.sections.map((s) => (
          <section key={s.heading} className="mt-12">
            <h2 className="text-2xl font-display text-silver-100 leading-snug">{s.heading}</h2>
            {s.body.map((p, i) => (
              <p key={i} className="mt-4 text-silver-400 leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets && (
              <ul className="mt-5 space-y-2.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-silver-400 leading-relaxed">
                    <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-flame-500 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="mt-14">
          <h2 className="text-2xl font-display text-silver-100">Common questions</h2>
          <div className="mt-6 space-y-3">
            {a.faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-midnight-700/60 bg-midnight-900/40">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-medium text-silver-100">{f.q}</span>
                  <span aria-hidden className="text-flame-400 transition-transform group-open:rotate-45 text-xl leading-none">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-5 text-silver-400 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mt-14 rounded-2xl border border-midnight-700/60 bg-midnight-900/40 p-8 text-center">
          <h2 className="text-2xl font-display text-silver-100">Want this looked at for your business?</h2>
          <p className="mt-3 text-silver-400 max-w-xl mx-auto leading-relaxed">
            Send a request with what you are running now and what is not working. You will get a straight answer,
            including when the answer is that you do not need us.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <BookCallButton />
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-midnight-700 text-silver-200 hover:border-flame-500/50 hover:text-white transition-colors"
            >
              Get a free audit
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-display text-silver-200">Related</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r!.slug}
                  to={`/answers/${r!.slug}`}
                  className="rounded-xl border border-midnight-700/60 bg-midnight-900/40 p-5 hover:border-flame-500/50 transition-colors"
                >
                  <p className="font-medium text-silver-100 leading-snug">{r!.question}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-12 text-center">
          <Link to="/answers" className="text-sm text-flame-400 hover:text-flame-300">
            All answers ({ANSWERS.length})
          </Link>
        </p>
      </article>
    </>
  )
}
