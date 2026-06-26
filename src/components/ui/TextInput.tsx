import { forwardRef, useId } from 'react'

export interface TextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  type?: 'text' | 'password' | 'number' | 'email' | 'tel'
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal'
  autoComplete?: string
  autoFocus?: boolean
  className?: string
  inputClassName?: string
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      label = 'Input',
      type = 'text',
      inputMode,
      autoComplete,
      autoFocus,
      className = '',
      inputClassName = '',
      onKeyDown,
    },
    ref,
  ) => {
    const id = useId()

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <label
          htmlFor={id}
          className="text-sm font-medium text-[var(--color-text-on-surface-secondary)]"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={`h-12 w-full rounded-[var(--radius-lg)] border border-[var(--color-border-on-surface)] bg-[var(--color-surface)] px-4 text-base text-[var(--color-text-on-surface)] placeholder-[var(--color-text-on-surface-muted)] transition-colors duration-[var(--transition-fast)] focus:border-[var(--color-accent)] focus:bg-[var(--color-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] ${inputClassName}`}
        />
      </div>
    )
  },
)

TextInput.displayName = 'TextInput'
