import { Check } from 'lucide-react'
import { Price } from './Price'
import { Surface } from './Surface'

export interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  price?: number
  className?: string
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  price,
  className = '',
}: CheckboxProps) {
  const toggle = () => onChange(!checked)

  return (
    <Surface
      className={`flex cursor-pointer items-center gap-3 p-4 transition-colors duration-[var(--transition-fast)] ${checked ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]' : ''} ${className}`}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggle()
        }
      }}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--radius-md)] border-2 transition-colors duration-[var(--transition-fast)] ${checked ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border-on-surface)] bg-[var(--color-surface)]'}`}
      >
        {checked && (
          <Check
            className="h-3.5 w-3.5 text-[var(--color-surface)]"
            aria-hidden="true"
          />
        )}
      </span>

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-[var(--color-text-on-surface)]">{label}</span>
          {price !== undefined && <Price amount={price} size="sm" />}
        </div>
        {description && (
          <p className="mt-0.5 text-sm text-[var(--color-text-on-surface-secondary)]">
            {description}
          </p>
        )}
      </div>
    </Surface>
  )
}
