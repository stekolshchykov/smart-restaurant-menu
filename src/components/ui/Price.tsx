import { formatCurrency } from '../../lib/formatters'

export interface PriceProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  onSurface?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
}

export function Price({ amount, size = 'md', onSurface = false, className = '' }: PriceProps) {
  return (
    <span
      className={`font-semibold ${onSurface ? 'text-[var(--color-primary)]' : 'text-[var(--color-primary)]'} ${sizeClasses[size]} ${className}`}
    >
      {formatCurrency(amount)}
    </span>
  )
}
