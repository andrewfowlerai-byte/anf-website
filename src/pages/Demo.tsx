import { useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { BookCallButton } from '../components/BookCallButton'
import { DEMO_CONFIGS, type DemoCard } from '../demos/demoConfigs'

export function Demo() {
  const { slug } = useParams<{ slug: string }>()
  const config = slug ? DEMO_CONFIGS[slug] : undefined
  const [selected, setSelected] = useState<DemoCard | null>(null)
  if (!config) return <Navigate to="/demos" replace />
  const a = config.accent

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 md:py-14">
      <div className="mb-5 flex items-center justify-between gap-3 flex-wrap">
        <Link to="/demos" className="text-silver-400 hover:text-silver-100 text-sm">← All demos</Link>
        <span className="text-xs tracking-[0.2em] uppercase text-silver-500">{config.niche} · interactive demo</span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-midnight-700/40 bg-white text-slate-800 shadow-2xl">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shrink-0" style={{ background: a }}>{config.product[0]}</div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-800 text-sm leading-none truncate">{config.product}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{config.blurb}</p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full text-white shrink-0" style={{ background: a }}>Demo</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50">
          {config.kpis.map((k) => (
            <div key={k.label} className="rounded-xl bg-white border border-slate-200 p-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">{k.label}</p>
              <p className="text-xl font-bold text-slate-800 mt-1">{k.value}</p>
              {k.sub && <p className="text-[11px] text-slate-400 mt-0.5">{k.sub}</p>}
            </div>
          ))}
        </div>

        <div className="p-5">
          <p className="text-xs uppercase tracking-wider text-slate-400 mb-3">{config.boardTitle}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {config.columns.map((col) => (
              <div key={col.title} className="rounded-xl bg-slate-50 border border-slate-200 p-2.5">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold text-slate-600">{col.title}</span>
                  <span className="text-[11px] text-slate-400">{col.cards.length}</span>
                </div>
                <div className="space-y-2">
                  {col.cards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => setSelected(card)}
                      className="w-full text-left rounded-lg bg-white border border-slate-200 hover:border-slate-400 p-3 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-800 leading-tight">{card.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{card.subtitle}</p>
                      {card.tag && (
                        <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${a}1a`, color: a }}>{card.tag}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-4 text-center">Tap any card to open it. This is a live demo with sample data.</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-silver-300 mb-4">Want this, built for your business and your words?</p>
        <BookCallButton size="lg" />
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/50" />
          <div className="w-full max-w-sm bg-white text-slate-800 h-full overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-lg font-semibold text-slate-800 leading-tight">{selected.title}</p>
                <p className="text-sm text-slate-500">{selected.subtitle}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="text-slate-400 hover:text-slate-700 text-2xl leading-none">×</button>
            </div>
            {selected.tag && (
              <span className="inline-block mb-4 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: `${a}1a`, color: a }}>{selected.tag}</span>
            )}
            <dl className="space-y-0">
              {selected.fields.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-slate-100 py-2.5">
                  <dt className="text-sm text-slate-400">{label}</dt>
                  <dd className="text-sm text-slate-700 text-right">{value}</dd>
                </div>
              ))}
            </dl>
            {selected.note && <p className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3 leading-relaxed">{selected.note}</p>}
            <div className="mt-6">
              <div className="w-full py-2.5 rounded-lg text-white text-sm font-medium text-center" style={{ background: a }}>Sample record · demo only</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
