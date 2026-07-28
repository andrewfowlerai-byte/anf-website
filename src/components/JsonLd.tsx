import { useEffect } from 'react'

/**
 * Injects a <script type="application/ld+json"> into <head> for structured data.
 * Client-rendered, which Googlebot executes, so it drives rich results (FAQ,
 * Event, and so on). Removes itself on unmount so schema never leaks across routes.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data)
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = json
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
    }
  }, [json])
  return null
}
