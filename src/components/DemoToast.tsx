import { useEffect, useRef, useState } from 'react'

// Tiny transient toast for the demos: a pill that drops in at top-center for a
// few seconds, with a pulsing dot. Paired with a "simulate a new lead" button so
// the board visibly changes in front of the visitor.

export function useDemoToast(): [string | null, (msg: string) => void] {
  const [toast, setToast] = useState<string | null>(null)
  const ref = useRef<number | null>(null)
  const fire = (msg: string) => {
    setToast(msg)
    if (ref.current) clearTimeout(ref.current)
    ref.current = window.setTimeout(() => setToast(null), 3400)
  }
  useEffect(() => () => { if (ref.current) clearTimeout(ref.current) }, [])
  return [toast, fire]
}

export function DemoToast({ toast, accent }: { toast: string | null; accent: string }) {
  if (!toast) return null
  return (
    <div
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2.5 shadow-2xl text-white text-sm font-medium flex items-center gap-2.5"
      style={{ background: accent, boxShadow: `0 12px 32px -8px ${accent}cc` }}
      role="status"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-white" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>
      {toast}
    </div>
  )
}
