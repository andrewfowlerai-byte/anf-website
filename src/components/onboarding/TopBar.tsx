import { useEffect, useRef, useState } from 'react'
import { SaveStatusPill } from './SaveStatus'
import { teamLinkUrl, useCopy, useOnboardCtx } from './ui'

/**
 * Sticky top bar: wordmark, form title, save status, overall progress, and the
 * menu. Progress shows at every width (a compact percent on phones) and opens
 * "Your progress" where that panel is not already on screen. Sections live in
 * the bottom bar on phones and in the left column on desktop.
 */

export function TopBar({ onChangeName, onProgress, onSubmit }: {
  onChangeName: () => void
  onProgress: () => void
  onSubmit: () => void
}) {
  const c = useOnboardCtx()
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const { copy, copied } = useCopy()
  const p = c.progress?.overall
  const pct = p && p.total ? Math.round((p.answered / p.total) * 100) : 0

  useEffect(() => {
    if (!menu) return
    const close = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(false) }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [menu])

  const item = 'block w-full px-4 py-2.5 text-left text-sm text-silver-200 hover:bg-midnight-800 disabled:opacity-50'
  const progressLabel = p ? `${pct}% answered: ${p.answered.toLocaleString('en-US')} of ${p.total.toLocaleString('en-US')} questions. Open your progress.` : ''

  return (
    <header className="border-b border-midnight-800 bg-[#07102B]">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 md:px-6">
        <img src="/anf-wordmark.webp" alt="ANF Consulting" width={66} height={44} className="-my-2 h-11 w-auto shrink-0 mix-blend-lighten" />
        <span className="hidden h-5 w-px shrink-0 bg-midnight-700 sm:block" aria-hidden="true" />
        <p className="min-w-0 flex-1 truncate font-display text-[15px] font-medium text-silver-100">{c.server?.form.title ?? 'Onboarding'}</p>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {p && (
            <button
              type="button"
              onClick={onProgress}
              aria-label={progressLabel}
              title={`${p.answered.toLocaleString('en-US')} of ${p.total.toLocaleString('en-US')} answered`}
              className="flex h-8 items-center gap-2 rounded-md px-1.5 text-silver-400 hover:text-silver-200 xl:pointer-events-none"
            >
              <span className="h-1 w-8 overflow-hidden rounded-full bg-midnight-800 md:w-24" aria-hidden="true">
                <span className="block h-full rounded-full bg-silver-300" style={{ width: `${pct}%` }} />
              </span>
              <span className="text-[12px] tabular-nums md:hidden" aria-hidden="true">{pct}%</span>
              <span className="hidden text-[12px] tabular-nums md:inline" aria-hidden="true">{p.answered.toLocaleString('en-US')}/{p.total.toLocaleString('en-US')}</span>
            </button>
          )}
          <SaveStatusPill status={c.saveStatus} />
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={menu}
              onClick={() => setMenu((m) => !m)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-midnight-700 text-silver-300 hover:text-silver-100"
            >
              <span className="sr-only">Menu</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" /></svg>
            </button>
            {menu && (
              <div role="menu" className="absolute right-0 top-10 z-40 w-64 overflow-hidden rounded-md border border-midnight-700 bg-midnight-900 py-1 shadow-xl shadow-black/40">
                <p className="px-4 pb-2 pt-2 text-[12px] text-silver-500">Answering as <span className="text-silver-200">{c.displayName}</span></p>
                <button role="menuitem" type="button" className={item} onClick={() => { setMenu(false); onChangeName() }}>Change my name</button>
                <button role="menuitem" type="button" className={`${item} xl:hidden`} onClick={() => { setMenu(false); onProgress() }}>Your progress</button>
                {c.role === 'owner' && c.teamToken && (
                  <button role="menuitem" type="button" className={item} onClick={() => void copy(teamLinkUrl(c.teamToken!))}>
                    {copied ? 'Team link copied' : 'Copy the team link'}
                    <span className="mt-0.5 block text-[12px] text-silver-500">It hides the Owner only questions.</span>
                  </button>
                )}
                {c.role === 'owner' && c.status === 'open' && (
                  <button role="menuitem" type="button" className={item} disabled={c.preview} onClick={() => { setMenu(false); onSubmit() }}>We are done for now</button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
