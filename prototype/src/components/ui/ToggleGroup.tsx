import { useCallback, useRef, type KeyboardEvent, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface ToggleGroupItem {
  value: string
  label: ReactNode
  disabled?: boolean
  ariaLabel?: string
}

export interface ToggleGroupProps {
  items: ToggleGroupItem[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ToggleGroup({
  items,
  value,
  onChange,
  className = '',
}: ToggleGroupProps) {
  const shouldReduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)

  const enabledItems = items.filter((item) => !item.disabled)
  const enabledValues = enabledItems.map((item) => item.value)
  const activeIndex = enabledValues.indexOf(value)

  const focusEnabled = useCallback((direction: 'next' | 'prev' | 'first' | 'last') => {
    if (enabledValues.length === 0) return
    let nextIndex: number
    switch (direction) {
      case 'first':
        nextIndex = 0
        break
      case 'last':
        nextIndex = enabledValues.length - 1
        break
      case 'prev':
        nextIndex = activeIndex <= 0 ? enabledValues.length - 1 : activeIndex - 1
        break
      case 'next':
      default:
        nextIndex = activeIndex === -1 || activeIndex >= enabledValues.length - 1 ? 0 : activeIndex + 1
        break
    }
    onChange(enabledValues[nextIndex])
    const button = containerRef.current?.querySelector<HTMLButtonElement>(`[data-value="${enabledValues[nextIndex]}"]`)
    button?.focus()
  }, [activeIndex, enabledValues, onChange])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusEnabled('prev')
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusEnabled('next')
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusEnabled('first')
    } else if (event.key === 'End') {
      event.preventDefault()
      focusEnabled('last')
    }
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 p-1 backdrop-blur-sm ${className}`}
      role="tablist"
      aria-orientation="horizontal"
    >
      {items.map((item) => {
        const isActive = item.value === value
        const isDisabled = item.disabled ?? false
        return (
          <button
            key={item.value}
            data-value={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={item.ariaLabel}
            disabled={isDisabled}
            tabIndex={isActive && !isDisabled ? 0 : -1}
            onClick={() => !isDisabled && onChange(item.value)}
            className={`relative z-10 flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-medium transition-colors duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] ${isActive ? 'text-[var(--color-surface)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'} ${isDisabled ? 'cursor-not-allowed opacity-40' : ''}`}
          >
            {isActive && (
              <motion.div
                layoutId={shouldReduceMotion ? undefined : 'toggle-indicator'}
                className="absolute inset-0 -z-10 rounded-full bg-[var(--color-accent)]"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 400, damping: 30 }
                }
              />
            )}
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
