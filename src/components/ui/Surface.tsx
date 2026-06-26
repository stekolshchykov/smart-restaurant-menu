import type { HTMLAttributes, ReactNode } from 'react'

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
  inverse?: boolean
}

export function Surface({
  children,
  className = '',
  elevated = false,
  inverse = false,
  ...props
}: SurfaceProps) {
  const borderColor = inverse
    ? 'border-[var(--color-border)]'
    : 'border-[var(--color-border-on-surface)]'

  return (
    <div
      className={`rounded-[var(--radius-lg)] ${borderColor} bg-[var(--color-surface)] transition-shadow duration-[var(--transition-base)] ${elevated ? 'bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
