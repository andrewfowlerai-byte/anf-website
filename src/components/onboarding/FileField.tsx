import { useRef, useState } from 'react'
import type { OnboardingQuestion } from '../../lib/onboarding/types'
import { ONBOARD_LIMITS } from '../../lib/onboarding/types'
import { UPLOAD_ACCEPT } from '../../lib/onboarding/api'
import { btnQuiet, formatBytes, formatWhen, inputBase, Spinner, useOnboardCtx } from './ui'

/**
 * A file question: drop zone and "Choose files", this question's files, and a
 * share-link box for anything over 50 MB or already in a shared folder. Files
 * go straight to private storage through a signed upload; the CRM records them.
 */

/** The note for forms and templates; brand, photo and screenshot questions carry their own (fileNote). */
const BLANK_FORMS_NOTE = 'Blank forms and templates only. Never upload anything about a client.'

export function FileField({ q }: { q: OnboardingQuestion }) {
  const c = useOnboardCtx()
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const [link, setLink] = useState('')
  const [linkMsg, setLinkMsg] = useState<string | null>(null)
  const files = c.filesList.filter((f) => f.key === q.key)
  const uploads = c.uploads.filter((u) => u.key === q.key)
  const links = c.fileLinks(q.key)
  const disabled = c.readOnly || c.preview

  const addLink = () => {
    const t = link.trim()
    if (!t) return
    if (!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(t)) {
      setLinkMsg('That does not look like a link yet. Copy the share link from Google Drive, Dropbox or iCloud and paste it here.')
      return
    }
    if (links.length >= ONBOARD_LIMITS.linksMax) {
      setLinkMsg('That is the most links one question takes. Put the files in one shared folder and paste its link.')
      return
    }
    if (t.length > ONBOARD_LIMITS.linkMax) {
      setLinkMsg('That link is too long. Try a shorter share link.')
      return
    }
    setLinkMsg(null)
    c.setLinks(q.key, [...links, t])
    setLink('')
  }

  return (
    <div className="min-w-0">
      <p className="mb-2 text-[13px] text-silver-400">{q.fileNote ?? BLANK_FORMS_NOTE}</p>

      <div
        onDragOver={(e) => { if (disabled) return; e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          if (!disabled && e.dataTransfer.files?.length) c.uploadFiles(q.key, e.dataTransfer.files)
        }}
        className={`flex flex-col items-start gap-2 rounded-md border border-dashed px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${
          drag ? 'border-flame-400 bg-flame-500/10' : 'border-midnight-500 bg-midnight-900/30'
        }`}
      >
        <div className="min-w-0 text-sm text-silver-400">
          <p className="text-silver-200">Drop files here, or choose them.</p>
          <p className="mt-0.5 text-[13px] text-silver-500">PDF, images, Word, Excel or PowerPoint. Up to 50 MB each.</p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="shrink-0 rounded-md border border-midnight-500 px-3.5 py-2 text-sm font-medium text-silver-100 hover:border-silver-500 disabled:opacity-50"
        >
          Choose files
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={UPLOAD_ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) c.uploadFiles(q.key, e.target.files)
            e.target.value = ''
          }}
        />
      </div>
      {c.preview && <p className="mt-2 text-[13px] text-silver-500">Uploads are off in preview.</p>}

      {(files.length > 0 || uploads.length > 0) && (
        <ul className="mt-3 divide-y divide-midnight-800 rounded-md border border-midnight-700/70">
          {files.map((f) => {
            const removing = c.outbox?.has(`file:${f.id}`)
            return (
              <li key={f.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2.5 text-sm">
                <div className={`min-w-0 ${removing ? 'opacity-50' : ''}`}>
                  <p className={`truncate text-silver-100 ${removing ? 'line-through' : ''}`}>{f.name}</p>
                  <p className="text-[12px] tabular-nums text-silver-500">
                    {[formatBytes(f.size), f.by, formatWhen(f.at)].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {removing ? (
                  <p className="text-[13px] text-silver-400">
                    Removed.{' '}
                    <button type="button" className="font-medium text-flame-300 underline-offset-4 hover:underline" onClick={() => c.undoRemoveFile(f.id)}>Undo</button>
                  </p>
                ) : (
                  !disabled && <button type="button" className={btnQuiet} onClick={() => c.removeFile(f)}>Remove</button>
                )}
              </li>
            )
          })}
          {uploads.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate text-silver-100">{u.name}</p>
                {u.status === 'uploading' && (
                  <p className="flex items-center gap-1.5 text-[12px] text-silver-400">
                    <Spinner className="h-3 w-3" /> Uploading {formatBytes(u.size)}. Keep this page open.
                  </p>
                )}
                {u.status === 'failed' && <p className="text-[12px] text-rose-300">{u.message}</p>}
                {u.status === 'lost' && <p className="text-[12px] text-amber-200">Not uploaded. Choose the file again.</p>}
              </div>
              <div className="flex gap-1">
                {u.status === 'failed' && !/50 MB|PDF, an image|empty/.test(u.message ?? '') && (
                  <button type="button" className={btnQuiet} onClick={() => c.retryUpload(u.id)}>Try again</button>
                )}
                {u.status !== 'uploading' && <button type="button" className={btnQuiet} onClick={() => c.dismissUpload(u.id)}>Dismiss</button>}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <label className="block text-[13px] text-silver-400" htmlFor={`${q.key}-link`}>Or paste a share link (Google Drive, Dropbox, iCloud)</label>
        <div className="mt-1.5 flex gap-2">
          <input
            id={`${q.key}-link`}
            type="text"
            inputMode="url"
            autoComplete="off"
            value={link}
            disabled={c.readOnly}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLink() } }}
            placeholder="https://"
            className={`${inputBase} min-w-0 flex-1`}
          />
          <button type="button" disabled={c.readOnly || !link.trim()} onClick={addLink} className="shrink-0 rounded-md border border-midnight-500 px-3.5 text-sm font-medium text-silver-100 hover:border-silver-500 disabled:opacity-50">
            Add link
          </button>
        </div>
        {linkMsg && <p className="mt-1.5 text-[13px] text-silver-400">{linkMsg}</p>}
        {links.length > 0 && (
          <ul className="mt-2 space-y-1">
            {links.map((l, i) => (
              <li key={`${l}-${i}`} className="flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-silver-300">{l}</span>
                {!c.readOnly && (
                  <button type="button" className={btnQuiet} onClick={() => c.setLinks(q.key, links.filter((_, j) => j !== i))}>Remove</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
