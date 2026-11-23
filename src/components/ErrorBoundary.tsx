import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}
interface State {
  hasError: boolean
}

/**
 * Catches render errors in the page tree so one broken page shows a recover-and-
 * go-home fallback instead of white-screening the whole SPA. Layout keys this by
 * pathname, so navigating away clears the error automatically.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    // No external logging is wired up; surface it to the console for debugging.
    console.error('Page render error:', error)
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="max-w-xl px-[var(--edge)] py-24">
        <h1 className="t-head font-extrabold tracking-[-0.03em] mb-3">This page hit a snag</h1>
        <p className="mb-8">
          An unexpected error stopped this page from loading. Try reloading, or head back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center bg-flame-500 hover:bg-flame-400 font-medium px-6 py-3 transition-colors"
          >
            Reload the page
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    )
  }
}
