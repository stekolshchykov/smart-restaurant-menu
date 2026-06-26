import type { HTMLMotionProps } from 'framer-motion'
import { motion, useReducedMotion } from 'framer-motion'

export interface IconButtonProps extends HTMLMotionProps<'button'> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'secondary-inverse'
    | 'outline-inverse'
    | 'ghost-inverse'
  size?: 'sm' | 'md' | 'lg'
}

export function IconButton({
  children,
  className = '',
  variant = 'ghost',
  size = 'md',
  disabled = false,
  ...props
}: IconButtonProps) {
  const shouldReduceMotion = useReducedMotion()

  const variants = {
    primary:
      'bg-[var(--color-accent)] text-[var(--color-surface)] hover:bg-[var(--color-accent-dark)] disabled:hover:bg-[var(--color-accent)]',
    secondary:
      'bg-[var(--color-surface)] text-[var(--color-text-on-surface)] border border-[var(--color-border-on-surface)] hover:bg-[var(--color-surface-hover)] disabled:hover:bg-[var(--color-surface)]',
    outline:
      'bg-transparent text-[var(--color-text-on-surface)] border border-[var(--color-border-on-surface)] hover:bg-[var(--color-surface-hover)] disabled:hover:bg-transparent',
    ghost:
      'bg-transparent text-[var(--color-text-on-surface)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-heading-on-surface)] disabled:hover:bg-transparent disabled:hover:text-[var(--color-text-on-surface)]',
    'secondary-inverse':
      'bg-[var(--color-bg-elevated)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] disabled:hover:bg-[var(--color-bg-elevated)]',
    'outline-inverse':
      'bg-transparent text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-heading)] disabled:hover:bg-transparent disabled:hover:text-[var(--color-text)]',
    'ghost-inverse':
      'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-border-subtle)] hover:text-[var(--color-heading)] disabled:hover:bg-transparent disabled:hover:text-[var(--color-text)]',
  }

  const sizes = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-12 w-12',
  }

  return (
    <motion.button
      type="button"
      disabled={disabled}
      whileTap={
        disabled || shouldReduceMotion ? undefined : { scale: 0.95 }
      }
      className={`inline-flex items-center justify-center rounded-full transition-colors duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  )
}
