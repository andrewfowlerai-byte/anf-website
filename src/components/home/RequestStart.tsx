import { useNavigate } from 'react-router-dom'
import { useLocalDraft } from '../../hooks/useLocalDraft'
import { BEST_TIMES, EMPTY_DRAFT, REQUEST_DRAFT_KEY, type RequestDraft } from '../../lib/requestDraft'
import { Reveal } from '../Reveal'

/**
 * The page closes with the request already open (2026-11-23 redesign). These are the first two fields of the real
 * /book form, writing the same saved draft, so what a visitor types here is waiting in the form on the next screen
 * and survives a reload. Nothing is sent from this page: the button only carries them to the rest of the form.
 */
export function RequestStart() {
  const [draft, setDraft] = useLocalDraft<RequestDraft>(REQUEST_DRAFT_KEY, EMPTY_DRAFT)
  const navigate = useNavigate()

  return (
    <section className="ch ch-flame" aria-labelledby="start-title" data-quiet-chat>
      <div className="start">
        <div className="start-words">
          <Reveal>
            <h2 id="start-title" className="t-display">Send a<br />request.</h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="t-lead" style={{ marginTop: '1.5rem', maxWidth: '30ch' }}>
              Andrew reads every request and gets back to you within one business day. No pitch, no pressure.
            </p>
          </Reveal>
        </div>

        <Reveal delay={140} className="start-form">
          <form
            data-ui
            onSubmit={(e) => { e.preventDefault(); navigate('/book#request') }}
            style={{ display: 'grid', gap: '1.25rem' }}
          >
            <label style={{ display: 'grid', gap: '0.5rem' }}>
              <span className="t-lead" style={{ fontWeight: 800 }}>What are you trying to build?</span>
              <textarea
                className="field"
                rows={3}
                name="message"
                value={draft.message}
                onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                placeholder="A CRM for my HVAC company"
              />
            </label>

            <fieldset className="seg">
              <legend className="t-small" style={{ marginBottom: '0.5rem', padding: 0 }}>Best time for a call (Eastern)</legend>
              {BEST_TIMES.map((t) => (
                <label key={t.label}>
                  <input type="radio" name="bestTime" value={t.value} checked={draft.bestTime === t.value} onChange={() => setDraft((d) => ({ ...d, bestTime: t.value }))} />
                  <span>{t.label}</span>
                </label>
              ))}
            </fieldset>

            <button type="submit" className="btn btn-ink">Next: your name and number</button>
            <p className="t-small" style={{ fontWeight: 400 }}>Nothing is sent until you finish the form on the next screen.</p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}
