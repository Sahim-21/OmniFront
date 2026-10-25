import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Settings, X } from 'lucide-react'
import useMediaQuery from '../hooks/useMediaQuery.js'
import useDialogA11y from '../hooks/useDialogA11y.js'

function SpeechSettings({ speech }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const popoverRef = useRef(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const close = () => setOpen(false)

  // Esc closes; focus is trapped only when it is a modal bottom sheet (phones/tablets)
  useDialogA11y({ open, onClose: close, containerRef: popoverRef, trap: !isDesktop })

  // Anchored dropdown on laptops closes on outside click
  useEffect(() => {
    if (!open || !isDesktop) return
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open, isDesktop])

  if (!speech.supported) return null

  const panel = (
    <div
      ref={popoverRef}
      role="dialog"
      aria-modal={!isDesktop}
      aria-label="Read-aloud settings"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-3xl border-t border-x border-[var(--border-strong)] bg-[var(--surface)] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl space-y-4 outline-none lg:absolute lg:inset-x-auto lg:bottom-full lg:left-0 lg:mb-3 lg:w-64 lg:max-h-[60dvh] lg:rounded-2xl lg:border lg:bg-[var(--surface-2-glass-80)] lg:backdrop-blur-xl lg:pb-4 lg:p-4 lg:z-30"
    >
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-bold text-[var(--text-subtle)] tracking-wider uppercase">Read aloud</div>
        <button
          type="button"
          onClick={close}
          className="tap-target -m-2 rounded-lg text-[var(--text-subtle)] hover:text-[var(--text)] cursor-pointer lg:hidden"
          aria-label="Close read-aloud settings"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div>
        <label htmlFor="speech-voice" className="block text-[10px] text-[var(--text-muted)] mb-1.5">Voice</label>
        <select
          id="speech-voice"
          value={speech.selectedVoice?.voiceURI ?? ''}
          onChange={(e) => speech.setVoice(e.target.value)}
          className="w-full min-h-11 lg:min-h-0 bg-[var(--chip-fill)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-xs text-[var(--text)] outline-none focus:border-[var(--accent-border-40)]"
        >
          <option value="">Browser default</option>
          {speech.voices.map(v => (
            <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="speech-rate" className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1.5">
          <span>Speed</span>
          <span className="font-mono text-[var(--text)]">{speech.rate.toFixed(1)}x</span>
        </label>
        <input
          id="speech-rate"
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={speech.rate}
          onChange={(e) => speech.setRate(Number(e.target.value))}
          className="w-full h-8 lg:h-auto accent-[var(--accent)] cursor-pointer"
        />
      </div>

      <label className="flex items-center justify-between gap-3 min-h-11 lg:min-h-0 cursor-pointer">
        <span className="text-xs text-[var(--text)]">Auto-read new replies</span>
        <input
          type="checkbox"
          role="switch"
          checked={speech.autoRead}
          onChange={(e) => speech.setAutoRead(e.target.checked)}
          className="w-5 h-5 lg:w-4 lg:h-4 accent-[var(--accent)] cursor-pointer"
        />
      </label>
    </div>
  )

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`tap-target p-2 rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
          open
            ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
            : 'text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--chip-fill)]'
        }`}
        title="Read-aloud settings"
        aria-label="Read-aloud settings"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Settings className="w-4.5 h-4.5" />
      </button>

      {open && (isDesktop ? panel : createPortal(
        <>
          <div className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--bg)_60%,transparent)]" onClick={close} aria-hidden="true"></div>
          {panel}
        </>,
        document.body
      ))}
    </div>
  )
}

export default SpeechSettings
