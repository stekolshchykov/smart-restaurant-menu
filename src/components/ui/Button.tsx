import type { MouseEvent, ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface ButtonProps {
  children?: ReactNode
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void
  className?: string
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'secondary-inverse'
    | 'outline-inverse'
    | 'ghost-inverse'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  fullWidth?: boolean
  disabled?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  'aria-label'?: string
}

export function Button({
  children,
  onClick,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  iconLeft,
  iconRight,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    primary:
      'bg-[var(--color-accent)] text-[var(--color-surface)] hover:bg-[var(--color-accent-dark)]',
    secondary:
      'bg-[var(--color-surface)] text-[var(--color-text-on-surface)] border border-[var(--color-border-on-surface)] hover:bg-[var(--color-surface-hover)]',
    outline:
      'bg-transparent text-[var(--color-text-on-surface)] border border-[var(--color-border-on-surface)] hover:bg-[var(--color-surface-hover)]',
    ghost:
      'bg-transparent text-[var(--color-text-on-surface)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-heading-on-surface)]',
    'secondary-inverse':
      'bg-[var(--color-bg-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)]',
    'outline-inverse':
      'bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-heading)]',
    'ghost-inverse':
      'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-heading)]',
  }

  const sizes = {
    sm: 'h-9 px-3 text-sm gap-1.5',
    md: 'h-11 px-4 text-base gap-2',
    lg: 'h-12 px-6 text-lg gap-2',
    icon: 'h-11 w-11 p-2 rounded-full',
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={
        disabled || shouldReduceMotion ? undefined : { scale: 0.97 }
      }
      className={`inline-flex items-center justify-center rounded-[var(--radius-lg)] font-medium transition-colors duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {iconLeft}
      {children}
      {iconRight}
    </motion.button>
  )
}
