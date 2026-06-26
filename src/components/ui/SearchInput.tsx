import { forwardRef, useId } from 'react'
import { Search, X } from 'lucide-react'
import { IconButton } from './IconButton'
import { VisuallyHidden } from './VisuallyHidden'

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  label?: string
  clearLabel?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Search dishes…',
      className = '',
      label = 'Search',
      clearLabel = 'Clear search',
    },
    ref,
  ) => {
    const id = useId()
    const hasValue = value.length > 0

    return (
      <div className={`relative flex items-center ${className}`}>
        <VisuallyHidden>
          <label htmlFor={id}>{label}</label>
        </VisuallyHidden>

        <span className="pointer-events-none absolute left-4 text-[var(--color-text-muted)]">
          <Search className="h-5 w-5" aria-hidden="true" />
        </span>

        <input
          ref={ref}
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="h-11 w-full rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)]/60 pl-11 pr-11 text-base text-[var(--color-text)] placeholder-[var(--color-text-muted)] backdrop-blur-sm transition-colors duration-[var(--transition-fast)] focus:border-[var(--color-accent)] focus:bg-[var(--color-bg-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
        />

        {hasValue && (
          <span className="absolute right-2">
            <IconButton
              size="md"
              variant="ghost-inverse"
              aria-label={clearLabel}
              onClick={() => onChange('')}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </IconButton>
          </span>
        )}
      </div>
    )
  },
)

SearchInput.displayName = 'SearchInput'
