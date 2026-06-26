import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function useModalFocus(
  isOpen: boolean,
  onClose: () => void,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    previousActiveElement.current = document.activeElement as HTMLElement | null

    const container = containerRef.current
    if (!container) return

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
    )

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    // Focus the requested element, first focusable, or the container itself
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus()
    } else if (first) {
      first.focus()
    } else {
      container.focus()
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || focusable.length === 0) return

      const active = document.activeElement as HTMLElement
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousActiveElement.current?.focus()
    }
  }, [isOpen, onClose, initialFocusRef])

  return containerRef
}
