import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export function ScrollToTop() {
  const { pathname } = useLocation()
  const firstRender = useRef(true)
  useEffect(() => {
    window.scrollTo(0, 0)
    // After a client-side navigation, move focus to the main landmark so keyboard
    // and screen-reader users land on the new page instead of a now-unmounted
    // control. Skip the first render so we don't steal focus on initial load.
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    document.getElementById('main')?.focus()
  }, [pathname])
  return null
}
