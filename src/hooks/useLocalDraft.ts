import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Form-draft persistence backed by localStorage. Drop-in replacement for
 * useState wherever the value is something the user typed and would lose
 * progress on if the page unloaded (accidental refresh, tab switch coming
 * back to a reloaded view). Same pattern as the ANF CRM's hook.
 *
 * Each draft is scoped by a string key and TTL'd at 24h so abandoned
 * drafts get garbage-collected automatically. Returned tuple is
 * (value, setValue, clear); call clear() on successful submit.
 */
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000
const STORAGE_PREFIX = 'anfsite.draft.'

interface StoredDraft<T> { v: T; t: number }

function readDraft<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as StoredDraft<T>
    if (!parsed || typeof parsed.t !== 'number') return fallback
    if (Date.now() - parsed.t > DRAFT_TTL_MS) {
      window.localStorage.removeItem(STORAGE_PREFIX + key)
      return fallback
    }
    return parsed.v
  } catch {
    return fallback
  }
}

function writeDraft<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify({ v: value, t: Date.now() }))
  } catch {
    // quota exceeded etc; the draft just won't persist this round
  }
}

function removeDraft(key: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key)
  } catch {
    // ignore
  }
}

/** How long to wait after the last change before writing. */
const WRITE_DEBOUNCE_MS = 400

export function useLocalDraft<T>(
  key: string,
  defaultValue: T,
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(() => readDraft(key, defaultValue))

  // Why this is not a one-liner:
  //
  // The write used to happen INSIDE the setValue updater, which meant a
  // synchronous JSON.stringify plus localStorage.setItem on every single
  // keystroke, on the main thread. localStorage is synchronous, and on mobile
  // Safari that write blocks. Measured on a throttled phone profile with the
  // /start form open, typing cost 162ms PER CHARACTER. It also put a side
  // effect inside a state updater, which React is allowed to call twice.
  //
  // Now the write is debounced into an effect. The state still updates
  // immediately so typing stays instant; only the persistence is deferred.
  const latest = useRef(value)
  const dirty = useRef(false)
  latest.current = value

  const flush = useCallback(() => {
    if (!dirty.current) return
    dirty.current = false
    writeDraft(key, latest.current)
  }, [key])

  useEffect(() => {
    if (!dirty.current) return
    const t = setTimeout(flush, WRITE_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [value, flush])

  // A debounce that can drop the last few characters is worse than no
  // debounce, so force a write on the way out: unmount, tab hide, and the
  // page being closed or backgrounded. pagehide is the one that fires
  // reliably on iOS, where beforeunload often does not.
  useEffect(() => {
    const onHide = () => flush()
    const onVis = () => { if (document.visibilityState === 'hidden') flush() }
    window.addEventListener('pagehide', onHide)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('pagehide', onHide)
      document.removeEventListener('visibilitychange', onVis)
      flush()
    }
  }, [flush])

  const update = useCallback((next: T | ((prev: T) => T)) => {
    dirty.current = true
    setValue((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next))
  }, [])

  const clear = useCallback(() => {
    dirty.current = false
    removeDraft(key)
    setValue(defaultValue)
  }, [key, defaultValue])

  return [value, update, clear]
}

/** Clear several drafts at once (after a successful multi-field submit). */
export function clearLocalDrafts(...keys: string[]): void {
  for (const k of keys) removeDraft(k)
}
