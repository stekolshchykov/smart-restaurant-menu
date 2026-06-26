import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface ToggleGroupItem {
  value: string
  label: ReactNode
  disabled?: boolean
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

  return (
    <div
      className={`relative inline-flex gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 p-1 backdrop-blur-sm ${className}`}
      role="tablist"
    >
      {items.map((item) => {
        const isActive = item.value === value
        const isDisabled = item.disabled ?? false
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={isDisabled}
            tabIndex={isDisabled ? -1 : undefined}
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
