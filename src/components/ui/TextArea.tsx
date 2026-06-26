import { forwardRef, useId } from 'react'

export interface TextAreaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  rows?: number
  maxLength?: number
  className?: string
  inputClassName?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      value,
      onChange,
      placeholder,
      label,
      rows = 3,
      maxLength,
      className = '',
      inputClassName = '',
    },
    ref,
  ) => {
    const id = useId()

    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-[var(--color-text-on-surface-secondary)]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`w-full resize-none rounded-[var(--radius-lg)] border border-[var(--color-border-on-surface)] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-text-on-surface)] placeholder-[var(--color-text-on-surface-muted)] transition-colors duration-[var(--transition-fast)] focus:border-[var(--color-accent)] focus:bg-[var(--color-surface-elevated)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] ${inputClassName}`}
        />
      </div>
    )
  },
)

TextArea.displayName = 'TextArea'
