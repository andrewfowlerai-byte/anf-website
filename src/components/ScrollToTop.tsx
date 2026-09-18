import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const firstRender = useRef(true)
  useEffect(() => {
    // A hashed link (the header's "Book" points at /book#schedule) is asking for
    // a specific spot on the page. Effects run child first, so without this the
    // page would scroll to the anchor and then get yanked back to the top here.
    if (hash) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    // After a client-side navigation, move focus to the main landmark so keyboard
    // and screen-reader users land on the new page instead of a now-unmounted
    // control. Skip the first render so we don't steal focus on initial load.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    document.getElementById('main')?.focus()
  }, [pathname, hash])
  return null
}
