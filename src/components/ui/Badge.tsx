import type { ReactNode } from 'react'

export interface BadgeProps {
  children: ReactNode
  variant?:
    | 'default'
    | 'primary'
    | 'accent'
    | 'outline'
    | 'success'
    | 'warning'
    | 'error'
    | 'featured'
  className?: string
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'bg-[var(--color-accent-bg)] text-[var(--color-accent)]',
    primary: 'bg-[var(--color-accent)] text-[var(--color-surface)]',
    accent: 'bg-[var(--color-accent)] text-[var(--color-surface)]',
    outline:
      'border border-[var(--color-border-on-surface)] bg-[var(--color-surface)] text-[var(--color-text-on-surface-secondary)]',
    success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
    warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
    error: 'bg-[var(--color-error-bg)] text-[var(--color-error)]',
    featured:
      'bg-[var(--color-accent)] text-[var(--color-surface)] border border-[var(--color-accent-light)] shadow-[var(--shadow-sm)]',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
