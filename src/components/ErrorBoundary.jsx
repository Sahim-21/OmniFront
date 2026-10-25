import { Component } from 'react'
import { AlertTriangle } from 'lucide-react'

// `fullScreen` is for the app root; otherwise the fallback is a compact inline card.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('UI error caught by ErrorBoundary:', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children

    const card = (
      <div role="alert" className="w-full max-w-sm bg-[var(--surface-glass-60)] backdrop-blur-2xl border border-[var(--border-strong)] shadow-2xl rounded-3xl p-6 text-center text-[var(--text)]">
        <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-[var(--warning)]" aria-hidden="true" />
        <h2 className="text-sm font-semibold mb-1">Something went wrong</h2>
        <p className="text-[11px] text-[var(--text-muted)] mb-5">
          {this.props.label ?? 'This part of the app crashed.'} Your saved data is safe.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={this.reset}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[11px] font-semibold text-[var(--text)] transition-colors cursor-pointer"
          >
            Try again
          </button>
          {this.props.fullScreen && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-[var(--chip-fill)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text)] hover:border-[var(--accent-border-30)] transition-colors cursor-pointer"
            >
              Reload
            </button>
          )}
        </div>
      </div>
    )

    return this.props.fullScreen ? (
      <div className="w-screen h-screen bg-[var(--bg)] flex items-center justify-center p-4">{card}</div>
    ) : (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_srgb,var(--bg)_70%,transparent)] backdrop-blur-sm">{card}</div>
    )
  }
}
