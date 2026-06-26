import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface CardProps {
  children: ReactNode
  onClick?: (event: MouseEvent<HTMLDivElement>) => void
  className?: string
  hover?: boolean
  focusable?: boolean
  'aria-label'?: string
  'aria-labelledby'?: string
}

export function Card({
  children,
  onClick,
  className = '',
  hover = false,
  focusable = true,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}: CardProps) {
  const shouldReduceMotion = useReducedMotion()

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick(event as unknown as MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <motion.div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && focusable ? 0 : undefined}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      whileHover={
        hover && !shouldReduceMotion
          ? { y: -4, boxShadow: 'var(--shadow-lg)' }
          : undefined
      }
      whileTap={
        onClick && !shouldReduceMotion ? { scale: 0.985 } : undefined
      }
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] transition-shadow duration-[var(--transition-base)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  )
}
