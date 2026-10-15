import { supabase } from '../supabase'
import type {
  AnswerState, CellWrite, ChangesOk, Fail, FileItem, GetFormOk, MarkSectionOk, PlainOk, RowRemovedOk,
  SaveAnswerOk, SaveCellsOk, SubmitOk,
} from './types'

/**
 * Data layer for the public onboarding form (/onboard/:token).
 *
 * Every read and write goes through the token RPCs named in the contract
 * (onboarding_get_form, onboarding_save_answer, ...). Anon has no table access,
 * so there is nothing else to call. Files go through the CRM's upload endpoint,
 * which signs the upload and records the file; the bytes go straight to Storage.
 *
 * Errors come back two ways:
 *   - an expected refusal is a value: { ok: false, code } (never thrown);
 *   - a network failure, timeout or server error throws NetError, which the
 *     outbox retries with backoff.
 *
 * Local development: `npm run dev:onboard` (vite --mode onboard-mock), or
 * VITE_ONBOARD_MOCK=1 with the dev server, serves the same interface from
 * src/lib/onboarding/dev/mockServer.ts instead. That branch is guarded by
 * import.meta.env.DEV, so a production build drops it entirely.
 * Never log a token or an upload token.
 */

export class NetError extends Error {
  status: number
  constructor(message: string, status = 0) {
    super(message)
    this.name = 'NetError'
    this.status = status
  }
}

export interface UploadStartOk { ok: true; path: string; uploadToken: string; contentType: string }
export interface UploadFinishOk { ok: true; file: FileItem }
export interface UploadFail { ok: false; code: string; message: string }

export interface Backend {
  getForm(token: string, preview: boolean, templateHash: string | null): Promise<GetFormOk | Fail>
  getChanges(token: string, since: string): Promise<ChangesOk | Fail>
  hello(token: string, name: string): Promise<PlainOk | Fail>
  saveAnswer(token: string, key: string, value: unknown, state: AnswerState, name: string): Promise<SaveAnswerOk | Fail>
  saveCells(token: string, key: string, cells: CellWrite[], name: string): Promise<SaveCellsOk | Fail>
  setRowRemoved(token: string, key: string, row: string, removed: boolean, name: string): Promise<RowRemovedOk | Fail>
  removeFile(token: string, fileId: string, name: string): Promise<PlainOk | Fail>
  markSection(token: string, section: string, ready: boolean, name: string): Promise<MarkSectionOk | Fail>
  submit(token: string, name: string): Promise<SubmitOk | Fail>
  keepEditing(token: string, name: string): Promise<PlainOk | Fail>
  uploadStart(token: string, key: string, fileName: string, size: number): Promise<UploadStartOk | UploadFail>
  uploadPut(start: UploadStartOk, file: File): Promise<void>
  uploadFinish(token: string, key: string, path: string, fileName: string, by: string): Promise<UploadFinishOk | UploadFail>
  /** Best effort on pagehide: fire-and-forget answer saves with keepalive. Unsent ops stay queued. */
  beaconAnswers(token: string, name: string, ops: { key: string; value: unknown; state: AnswerState }[]): void
}

// ---------------------------------------------------------------------------
// Upload types: must equal the bucket's allowed_mime_types and the endpoint map.
// ---------------------------------------------------------------------------

export const UPLOAD_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  heic: 'image/heic', heif: 'image/heif', svg: 'image/svg+xml', psd: 'image/vnd.adobe.photoshop',
  pdf: 'application/pdf', ai: 'application/postscript', eps: 'application/postscript',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  csv: 'text/csv', txt: 'text/plain', zip: 'application/zip',
  mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/x-m4v', mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav',
  otf: 'font/otf', ttf: 'font/ttf', woff: 'font/woff', woff2: 'font/woff2',
}

export const UPLOAD_ACCEPT = Object.keys(UPLOAD_TYPES).map((e) => `.${e}`).join(',')
export const BAD_FILE_TYPE_MESSAGE = 'Please send this as a PDF, an image, or a Word, Excel or PowerPoint file.'

export function extensionOf(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

// ---------------------------------------------------------------------------
// Real backend (Supabase RPCs + CRM upload endpoint)
// ---------------------------------------------------------------------------

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'http://localhost:54321'
const SUPABASE_ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'placeholder'
const UPLOAD_URL = (import.meta.env.VITE_ONBOARD_UPLOAD_URL as string) || 'https://crm.anfconsult.com/api/onboarding-upload'

const READ_TIMEOUT_MS = 15000
const WRITE_TIMEOUT_MS = 20000

async function rpc<T>(name: string, args: Record<string, unknown>, timeoutMs = WRITE_TIMEOUT_MS): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const { data, error, status } = await supabase.rpc(name, args).abortSignal(ctrl.signal)
    if (error) throw new NetError(`${name} failed`, status ?? 0)
    if (data == null || typeof data !== 'object') throw new NetError(`${name} returned nothing`, status ?? 0)
    return data as T
  } catch (e) {
    if (e instanceof NetError) throw e
    throw new NetError(ctrl.signal.aborted ? `${name} timed out` : `${name} could not reach the server`)
  } finally {
    clearTimeout(timer)
  }
}

async function postUpload<T>(body: Record<string, unknown>): Promise<T | UploadFail> {
  let res: Response
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), WRITE_TIMEOUT_MS)
  try {
    res = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    })
  } catch {
    throw new NetError('upload endpoint unreachable')
  } finally {
    clearTimeout(timer)
  }
  if (res.status >= 500) throw new NetError('upload endpoint error', res.status)
  let json: unknown
  try {
    json = await res.json()
  } catch {
    throw new NetError('upload endpoint sent no JSON', res.status)
  }
  const j = json as { ok?: boolean; code?: string; message?: string }
  if (!res.ok || !j || j.ok !== true) {
    return { ok: false, code: j?.code || 'error', message: j?.message || 'That file could not be uploaded.' }
  }
  return json as T
}

const realBackend: Backend = {
  getForm: (token, preview, templateHash) =>
    rpc('onboarding_get_form', { p_token: token, p_preview: preview, p_template_hash: templateHash }, READ_TIMEOUT_MS),
  getChanges: (token, since) => rpc('onboarding_get_changes', { p_token: token, p_since: since }, READ_TIMEOUT_MS),
  hello: (token, name) => rpc('onboarding_hello', { p_token: token, p_name: name }),
  saveAnswer: (token, key, value, state, name) =>
    rpc('onboarding_save_answer', { p_token: token, p_key: key, p_value: value === undefined ? null : value, p_state: state, p_name: name }),
  saveCells: (token, key, cells, name) => rpc('onboarding_save_cells', { p_token: token, p_key: key, p_cells: cells, p_name: name }),
  setRowRemoved: (token, key, row, removed, name) =>
    rpc('onboarding_set_row_removed', { p_token: token, p_key: key, p_row: row, p_removed: removed, p_name: name }),
  removeFile: (token, fileId, name) => rpc('onboarding_remove_file', { p_token: token, p_file_id: fileId, p_name: name }),
  markSection: (token, section, ready, name) =>
    rpc('onboarding_mark_section', { p_token: token, p_section: section, p_ready: ready, p_name: name }),
  submit: (token, name) => rpc('onboarding_submit', { p_token: token, p_name: name }),
  keepEditing: (token, name) => rpc('onboarding_keep_editing', { p_token: token, p_name: name }),
  uploadStart: (token, key, fileName, size) => postUpload<UploadStartOk>({ action: 'start', token, key, fileName, size }),
  uploadPut: async (start, file) => {
    // Force the endpoint's type onto the blob. Otherwise Storage checks the
    // browser's own guess, which is often empty for .ai or .heic files.
    const body = new File([file], file.name, { type: start.contentType })
    let error: unknown
    try {
      const res = await supabase.storage
        .from('onboarding-uploads')
        .uploadToSignedUrl(start.path, start.uploadToken, body, { contentType: start.contentType })
      error = res.error
    } catch (e) {
      error = e
    }
    if (error) throw new NetError('upload to storage failed')
  },
  uploadFinish: (token, key, path, fileName, by) => postUpload<UploadFinishOk>({ action: 'finish', token, key, path, fileName, by }),
  beaconAnswers: (token, name, ops) => {
    // keepalive bodies share a 64 KB budget, so send only what fits.
    let budget = 60000
    for (const op of ops) {
      const body = JSON.stringify({ p_token: token, p_key: op.key, p_value: op.value ?? null, p_state: op.state, p_name: name })
      if (body.length > budget) continue
      budget -= body.length
      try {
        void fetch(`${SUPABASE_URL}/rest/v1/rpc/onboarding_save_answer`, {
          method: 'POST',
          keepalive: true,
          headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, 'Content-Type': 'application/json' },
          body,
        }).catch(() => {})
      } catch {
        /* best effort only */
      }
    }
  },
}

let backendPromise: Promise<Backend> | null = null

/** The backend for this build: the real RPCs, or the local mock in a dev build with VITE_ONBOARD_MOCK=1. */
export function getBackend(): Promise<Backend> {
  if (!backendPromise) {
    if (import.meta.env.DEV && (import.meta.env.VITE_ONBOARD_MOCK === '1' || import.meta.env.MODE === 'onboard-mock')) {
      backendPromise = import('./dev/mockServer').then((m) => m.mockBackend)
    } else {
      backendPromise = Promise.resolve(realBackend)
    }
  }
  return backendPromise
}

/** True when this dev build serves the mock (shown as a small banner so nobody mistakes it for live). */
export const USING_MOCK = import.meta.env.DEV && (import.meta.env.VITE_ONBOARD_MOCK === '1' || import.meta.env.MODE === 'onboard-mock')
