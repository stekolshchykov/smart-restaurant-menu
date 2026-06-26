export interface SkeletonProps {
  className?: string
  variant?: 'text' | 'rect' | 'circle'
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full rounded',
    rect: 'rounded-[var(--radius-md)]',
    circle: 'rounded-full',
  }

  return (
    <div
      className={`animate-pulse bg-[var(--color-border-on-surface-subtle)] ${variantClasses[variant]} ${className}`}
    />
  )
}
