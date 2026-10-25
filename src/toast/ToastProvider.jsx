import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext } from './context.js'

const DURATION_MS = 4000

const VARIANTS = {
  error: { Icon: AlertCircle, color: 'text-[var(--danger)]', border: 'border-[var(--danger)]' },
  success: { Icon: CheckCircle2, color: 'text-[var(--success)]', border: 'border-[var(--success)]' },
  info: { Icon: Info, color: 'text-[var(--accent)]', border: 'border-[var(--accent-border-30)]' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const show = useCallback((variant, message) => {
    const id = ++nextId.current
    setToasts(prev => [...prev.slice(-3), { id, variant, message }])
    timers.current[id] = setTimeout(() => dismiss(id), DURATION_MS)
  }, [dismiss])

  useEffect(() => {
    const running = timers.current
    return () => Object.values(running).forEach(clearTimeout)
  }, [])

  const value = useMemo(() => ({
    success: (message) => show('success', message),
    error: (message) => show('error', message),
    info: (message) => show('info', message),
    dismiss,
  }), [show, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="fixed z-[60] bottom-3 left-3 right-3 mx-auto max-w-sm flex flex-col-reverse gap-2 pointer-events-none lg:bottom-auto lg:top-4 lg:right-4 lg:left-auto lg:mx-0 lg:w-80 lg:flex-col"
      >
        {toasts.map(({ id, variant, message }) => {
          const { Icon, color, border } = VARIANTS[variant]
          return (
            <div
              key={id}
              className={`pointer-events-auto flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-[var(--surface-2-glass-80)] backdrop-blur-xl border ${border} shadow-2xl text-xs text-[var(--text)]`}
            >
              <Icon className={`w-4 h-4 mt-px shrink-0 ${color}`} aria-hidden="true" />
              <p className="flex-1 leading-snug">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="tap-target -m-2 rounded-md text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
