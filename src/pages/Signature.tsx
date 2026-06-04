import { useRef, useState } from 'react'

/**
 * Hosted email signature for ANF Consulting.
 *
 * Page sits at /signature (outside the marketing layout) so the
 * "select all" copy path grabs only the signature itself, with no
 * surrounding nav or footer.
 *
 * One-click copy puts the rich HTML on the clipboard. Pasting into
 * Gmail's signature editor preserves the layout exactly.
 */

const SIGNATURE_HTML = `<table cellpadding="0" cellspacing="0" border="0" style="font-family: 'Inter', Helvetica, Arial, sans-serif; color: #1F2937; line-height: 1.4; border-collapse: collapse;">
  <tr>
    <td style="padding-right: 18px; vertical-align: top;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background-color: #0B1A33; color: #F0F4F8; font-family: 'Space Grotesk', 'Helvetica Neue', Arial, sans-serif; font-weight: 700; font-size: 28px; text-align: center; line-height: 56px; letter-spacing: -1px;">A</div>
    </td>
    <td style="vertical-align: top; border-left: 1px solid #E2E8F0; padding-left: 18px;">
      <div style="font-size: 16px; font-weight: 600; color: #0B1A33; letter-spacing: -0.2px; margin-bottom: 2px;">Andrew Fowler</div>
      <div style="font-size: 13px; color: #6B7280; margin-bottom: 10px;">Founder, <span style="color: #0B1A33; font-weight: 600;">ANF Consulting</span></div>
      <div style="font-size: 13px; color: #1F2937; margin-bottom: 8px;">
        <a href="https://anfconsult.com" style="color: #F26B1D; text-decoration: none; font-weight: 500;">anfconsult.com</a>
        &nbsp;<span style="color: #CBD5E1;">|</span>&nbsp;
        <a href="tel:+15732769756" style="color: #1F2937; text-decoration: none;">(573) 276-9756</a>
        &nbsp;<span style="color: #CBD5E1;">|</span>&nbsp;
        <a href="mailto:anfaiconsulting@gmail.com" style="color: #1F2937; text-decoration: none;">anfaiconsulting@gmail.com</a>
      </div>
      <div style="font-size: 10px; color: #6B7280; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 500;">
        Marketing<span style="color: #F26B1D;"> · </span>Infrastructure<span style="color: #F26B1D;"> · </span>AI<span style="color: #F26B1D;"> · </span>Education
      </div>
    </td>
  </tr>
</table>`

export function Signature() {
  const signatureRef = useRef<HTMLDivElement>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const handleCopy = async () => {
    try {
      // Prefer the modern Clipboard API so the rich HTML lands intact in
      // Gmail's editor. The fallback selects the rendered node and uses
      // execCommand for older browsers / restrictive contexts.
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const blob = new Blob([SIGNATURE_HTML], { type: 'text/html' })
        const plain = new Blob(
          ['Andrew Fowler — Founder, ANF Consulting — anfconsult.com — (573) 276-9756 — anfaiconsulting@gmail.com'],
          { type: 'text/plain' },
        )
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': blob, 'text/plain': plain }),
        ])
      } else if (signatureRef.current) {
        const range = document.createRange()
        range.selectNodeContents(signatureRef.current)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
        document.execCommand('copy')
        sel?.removeAllRanges()
      } else {
        throw new Error('Clipboard not available')
      }
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2500)
    } catch (err) {
      console.error('[signature] copy failed', err)
      setCopyState('error')
      setTimeout(() => setCopyState('idle'), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-silver-100 text-charcoal flex items-center justify-center px-4 py-12" style={{ backgroundColor: '#F0F4F8' }}>
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-flame-500 mb-3" style={{ color: '#F26B1D', letterSpacing: '0.3em', fontSize: '11px', textTransform: 'uppercase', marginBottom: '12px' }}>
            ANF Consulting
          </p>
          <h1 className="text-3xl font-display text-midnight" style={{ color: '#0B1A33', fontSize: '28px', fontWeight: 600, marginBottom: '8px', fontFamily: "'Space Grotesk', sans-serif" }}>
            Email signature
          </h1>
          <p className="text-sm text-muted" style={{ color: '#6B7280', fontSize: '14px' }}>
            Click the button. Paste it into Gmail. Done.
          </p>
        </header>

        {/* Preview card */}
        <div
          className="bg-white rounded-2xl border border-line p-8 shadow-sm overflow-x-auto"
          style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '32px' }}
        >
          <div
            ref={signatureRef}
            dangerouslySetInnerHTML={{ __html: SIGNATURE_HTML }}
          />
        </div>

        {/* Copy button */}
        <div className="text-center">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-colors"
            style={{
              backgroundColor: copyState === 'copied' ? '#10B981' : copyState === 'error' ? '#DC2626' : '#0B1A33',
              color: '#F0F4F8',
              fontSize: '14px',
              fontWeight: 500,
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 200ms',
            }}
          >
            {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy signature'}
          </button>
        </div>

        {/* Instructions */}
        <ol
          className="space-y-2 text-sm text-charcoal max-w-md mx-auto"
          style={{ fontSize: '13px', color: '#1F2937', lineHeight: 1.7, listStyle: 'decimal', paddingLeft: '24px' }}
        >
          <li>Click <strong style={{ color: '#0B1A33' }}>Copy signature</strong> above.</li>
          <li>Open Gmail. Click the gear icon, then <strong style={{ color: '#0B1A33' }}>See all settings</strong>.</li>
          <li>In the <strong style={{ color: '#0B1A33' }}>General</strong> tab, scroll to <strong style={{ color: '#0B1A33' }}>Signature</strong>.</li>
          <li>Click <strong style={{ color: '#0B1A33' }}>Create new</strong> (or edit existing), then paste.</li>
          <li>Pick it as the default for new emails and replies. Save.</li>
        </ol>

        <p className="text-center text-xs" style={{ color: '#6B7280', fontSize: '11px', textAlign: 'center', marginTop: '40px' }}>
          Web fonts may not load inside Gmail. The layout, colors, and flame accents survive intact.
        </p>
      </div>
    </div>
  )
}
