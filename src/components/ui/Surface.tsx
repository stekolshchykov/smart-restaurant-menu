import type { HTMLAttributes, ReactNode } from 'react'

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
}

export function Surface({
  children,
  className = '',
  elevated = false,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={`rounded-[var(--radius-lg)] border border-[var(--color-border-on-surface)] bg-[var(--color-surface)] transition-shadow duration-[var(--transition-base)] ${elevated ? 'bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
