import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  elevated?: boolean
  /** Use the dark-canvas border token instead of the light-surface border token. */
  borderInverse?: boolean
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  function Surface(
    { children, className = '', elevated = false, borderInverse = false, ...props },
    ref,
  ) {
    const borderColor = borderInverse
      ? 'border-[var(--color-border)]'
      : 'border-[var(--color-border-on-surface)]'

    return (
      <div
        ref={ref}
        className={`rounded-[var(--radius-lg)] ${borderColor} bg-[var(--color-surface)] transition-shadow duration-[var(--transition-base)] ${elevated ? 'bg-[var(--color-surface-elevated)] shadow-[var(--shadow-md)]' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  },
)
