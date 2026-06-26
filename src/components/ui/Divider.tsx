export interface DividerProps {
  className?: string
  onSurface?: boolean
}

export function Divider({ className = '', onSurface = false }: DividerProps) {
  return (
    <hr
      className={`h-px w-full border-0 ${onSurface ? 'bg-[var(--color-border-on-surface)]' : 'bg-[var(--color-border)]'} ${className}`}
    />
  )
}
