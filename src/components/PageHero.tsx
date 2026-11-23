import { type ReactNode } from 'react'

/**
 * The header of every inner page (redesigned 2026-11-23, DESIGN.md): one flame field with the title set large and
 * left, a supporting sentence, and whatever the page wants beneath (a button, a form's first line). It replaced a
 * centred headline under a pill label over a glow and a grid. The field ends on the site's forward lean.
 *
 * A short title is set at the display size; a longer one steps down so it still fits two lines on a phone. A title
 * given as plain words arrives word by word, each from behind its own baseline. There is no label above the title
 * any more: `eyebrow` is still accepted so old call sites compile, and is not shown. What a label used to say
 * belongs in the title or the sentence under it.
 */
export function PageHero({
  title,
  subtitle,
  children,
}: {
  /** No longer shown. Fold anything it said into the title or subtitle. */
  eyebrow?: string
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}) {
  const plain = typeof title === 'string' ? title : null
  const length = plain ? plain.length : 36
  const size = length <= 28 ? 't-display page-hero-title is-short' : length <= 44 ? 't-head page-hero-title is-long' : 't-head page-hero-title is-xlong'
  const words = plain ? plain.split(/\s+/).filter(Boolean) : null
  return (
    <section className="page-hero on-flame">
      {words ? (
        // Read as one line by a screen reader; the moving pieces are for the eye.
        <h1 className={`${size} has-words`} aria-label={plain ?? undefined}>
          {words.map((w, i) => (
            <span key={`${w}-${i}`} aria-hidden="true">
              <span className="word" style={{ ['--w' as string]: i }}><span>{w}</span></span>
              {i < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </h1>
      ) : (
        <h1 className={size}>{title}</h1>
      )}
      {subtitle && <p className="t-lead page-hero-sub">{subtitle}</p>}
      {children && <div className="page-hero-more">{children}</div>}
    </section>
  )
}
