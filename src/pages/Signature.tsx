import { useRef, useState } from 'react'

/**
 * Hosted email signature for ANF Consulting.
 *
 * Page sits at /signature (outside the marketing layout) so the
 * "select all" copy path grabs only the signature itself, with no
 * surrounding nav or footer.
 *
 * The signature is a full-width banner image linked to the site, with the
 * phone, email and website underneath as live text. Anything inside an image
 * can't be tapped, and some mail clients block images, so the contact line
 * stays text.
 *
 * The banner lives in public/email at 1200 x 240 and is shown at 600 x 120, so
 * it stays sharp on retina screens. Gmail caches signature images by URL: when
 * the banner changes, save it under a new file name (-v2) instead of
 * overwriting this one.
 *
 * One-click copy puts the rich HTML on the clipboard. Pasting into
 * Gmail's signature editor keeps the banner and the links.
 */

const BANNER_URL = 'https://anfconsult.com/email/andrew-fowler-signature-v1.png'

const SIGNATURE_HTML = `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse: collapse;">
  <tr>
    <td style="padding: 0;">
      <a href="https://anfconsult.com" style="text-decoration: none;"><img src="${BANNER_URL}" width="600" height="120" alt="Andrew Fowler, Founder, ANF Consulting. Clarity. Integration. Automation." style="display: block; width: 600px; max-width: 100%; height: auto; border: 0;"></a>
    </td>
  </tr>
  <tr>
    <td style="padding: 9px 0 0 2px; font-family: Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.4; color: #1F2937;">
      <a href="tel:+15732769756" style="color: #1F2937; text-decoration: none;">(573) 276-9756</a>
      &nbsp;<span style="color: #CBD5E1;">|</span>&nbsp;
      <a href="mailto:admin@anfconsult.com" style="color: #1F2937; text-decoration: none;">admin@anfconsult.com</a>
      &nbsp;<span style="color: #CBD5E1;">|</span>&nbsp;
      <a href="https://anfconsult.com" style="color: #F26B1D; text-decoration: none; font-weight: 600;">anfconsult.com</a>
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
          // Separators match the rendered HTML above (pipes, not dashes) so the
          // plaintext fallback reads the same in clients that strip rich text.
          ['Andrew Fowler | Founder, ANF Consulting | (573) 276-9756 | admin@anfconsult.com | anfconsult.com'],
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
          <li>Click <strong style={{ color: '#0B1A33' }}>Create new</strong> (or open your current one), clear it out, then paste.</li>
          <li>Pick it as the default for new emails and replies. Scroll down and click <strong style={{ color: '#0B1A33' }}>Save Changes</strong>.</li>
        </ol>

        <p className="text-center text-xs" style={{ color: '#6B7280', fontSize: '11px', textAlign: 'center', marginTop: '40px' }}>
          The banner is an image, so it looks the same in every inbox. The phone, email and website under it stay tappable, and still show when an inbox blocks images.
        </p>
      </div>
    </div>
  )
}
