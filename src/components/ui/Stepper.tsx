import { Minus, Plus } from 'lucide-react'
import { IconButton } from './IconButton'

export interface StepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  size?: 'sm' | 'md' | 'lg'
  onSurface?: boolean
}

const valueSizes = {
  sm: 'w-8 text-sm',
  md: 'w-10 text-base',
  lg: 'w-12 text-lg',
}

export function Stepper({
  value,
  min = 0,
  max = 99,
  onChange,
  size = 'md',
  onSurface = true,
}: StepperProps) {
  const atMin = value <= min
  const atMax = value >= max

  const decrement = () => onChange(Math.max(min, value - 1))
  const increment = () => onChange(Math.min(max, value + 1))

  return (
    <div className="inline-flex items-center gap-1">
      <IconButton
        size={size}
        variant={onSurface ? 'outline' : 'outline-inverse'}
        aria-label="Decrease"
        onClick={decrement}
        disabled={atMin}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </IconButton>

      <span
        className={`inline-flex items-center justify-center text-center font-semibold tabular-nums ${onSurface ? 'text-[var(--color-heading-on-surface)]' : 'text-[var(--color-heading)]'} ${valueSizes[size]}`}
        aria-live="polite"
        aria-atomic="true"
      >
        {value}
      </span>

      <IconButton
        size={size}
        variant="primary"
        aria-label="Increase"
        onClick={increment}
        disabled={atMax}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </IconButton>
    </div>
  )
}
