import { useEffect } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Esc to close, optional Tab focus trap, and focus return to the opener on close.
export default function useDialogA11y({ open, onClose, containerRef, trap = true }) {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    containerRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const container = containerRef.current
      if (!trap || e.key !== 'Tab' || !container) return
      const focusable = container.querySelectorAll(FOCUSABLE)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === container)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      opener?.focus?.()
    }
  }, [open, onClose, containerRef, trap])
}
