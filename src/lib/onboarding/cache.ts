import type { AnswerMap, FileItem, FormMeta, OnboardingSnapshot, Role } from './types'

/**
 * Best-effort IndexedDB cache of one form's template and last known server
 * state, keyed by the token hash (never the token). It lets a return visit skip
 * the large template download and lets the form open offline. Any failure here
 * only means a fresh download, so every call resolves (never rejects) and gives
 * up after a short timeout.
 *
 * Only server state is stored: answers as the server confirmed them. Unsent
 * edits live in the outbox's device record, and text flagged as a card, Social
 * Security or bank number is never stored anywhere.
 */

export interface CachedForm {
  hash16: string
  role: Role
  templateHash: string
  template: OnboardingSnapshot
  form: FormMeta
  answers: AnswerMap
  files: FileItem[]
  serverTime: string
  savedAt: number
}

const DB = 'anf-onboard'
const STORE = 'forms'
const TIMEOUT_MS = 1500

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    let done = false
    const finish = (db: IDBDatabase | null) => {
      if (done) return
      done = true
      resolve(db)
    }
    setTimeout(() => finish(null), TIMEOUT_MS)
    try {
      if (typeof indexedDB === 'undefined') return finish(null)
      const req = indexedDB.open(DB, 1)
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'hash16' })
      }
      req.onsuccess = () => finish(req.result)
      req.onerror = () => finish(null)
      req.onblocked = () => finish(null)
    } catch {
      finish(null)
    }
  })
}

export async function readCache(hash16: string): Promise<CachedForm | null> {
  const db = await open()
  if (!db) return null
  return new Promise((resolve) => {
    let done = false
    const finish = (v: CachedForm | null) => {
      if (done) return
      done = true
      resolve(v)
    }
    setTimeout(() => finish(null), TIMEOUT_MS)
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(hash16)
      req.onsuccess = () => finish((req.result as CachedForm | undefined) ?? null)
      req.onerror = () => finish(null)
    } catch {
      finish(null)
    }
  })
}

export async function writeCache(entry: CachedForm): Promise<void> {
  const db = await open()
  if (!db) return
  await new Promise<void>((resolve) => {
    setTimeout(resolve, TIMEOUT_MS)
    try {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(entry)
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
      tx.onabort = () => resolve()
    } catch {
      resolve()
    }
  })
}
