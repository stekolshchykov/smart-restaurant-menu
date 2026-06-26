import type { ReactNode } from 'react'

export interface FilterChipProps {
  label: string
  selected: boolean
  onClick: () => void
  icon?: ReactNode
  disabled?: boolean
  className?: string
  ariaLabel?: string
}

export function FilterChip({
  label,
  selected,
  onClick,
  icon,
  disabled = false,
  className = '',
  ariaLabel,
}: FilterChipProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={selected}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--color-border)] ${
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-surface)]'
          : 'border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:hover:bg-[var(--color-bg-elevated)]/60'
      } ${className}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </button>
  )
}
