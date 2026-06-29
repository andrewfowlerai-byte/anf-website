import { type ReactNode } from 'react'

/**
 * Shared page hero: a status badge, a big display headline, an optional subtitle,
 * and optional CTAs (children), over the same layered backdrop (flame radial glow
 * plus a masked grid) used on the homepage. Keeps every inner page consistent.
 */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div
          className="absolute inset-x-0 top-0 h-[120%]"
          style={{ background: 'radial-gradient(ellipse 55% 50% at 50% 0%, rgba(242,107,29,0.13), transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 18%, #000, transparent 72%)',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 18%, #000, transparent 72%)',
          }}
        />
      </div>
      <div className="max-w-4xl mx-auto px-6 pt-20 md:pt-28 pb-10 md:pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[11px] sm:text-xs tracking-[0.22em] uppercase text-silver-300 mb-7">
          <span className="w-1.5 h-1.5 rounded-full bg-flame-500" /> {eyebrow}
        </div>
        <h1 className="text-4xl md:text-6xl font-display text-silver-100 leading-tight">{title}</h1>
        {subtitle && <p className="mt-6 text-lg md:text-xl text-silver-400 leading-relaxed max-w-2xl mx-auto">{subtitle}</p>}
        {children && <div className="mt-9">{children}</div>}
      </div>
    </section>
  )
}
