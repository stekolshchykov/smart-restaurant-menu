import { formatCurrency } from '../../lib/formatters'

export interface PriceProps {
  amount: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onSurface?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
}

export function Price({
  amount,
  size = 'md',
  onSurface = false,
  className = '',
}: PriceProps) {
  const colorClass = onSurface
    ? 'text-[var(--color-heading-on-surface)]'
    : 'text-[var(--color-primary)]'

  return (
    <span
      className={`font-semibold ${colorClass} ${sizeClasses[size]} ${className}`}
    >
      {formatCurrency(amount)}
    </span>
  )
}
