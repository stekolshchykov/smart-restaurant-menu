import type { ReactNode } from 'react'

export interface TextProps {
  children: ReactNode
  variant?: 'body' | 'body-sm' | 'body-lg' | 'muted' | 'lead' | 'label' | 'caption'
  as?: 'p' | 'span' | 'div' | 'label'
  onSurface?: boolean
  className?: string
}

const baseVariants: Record<NonNullable<TextProps['variant']>, string> = {
  body: 'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  'body-lg': 'text-lg leading-relaxed',
  muted: 'text-sm leading-relaxed',
  lead: 'text-lg leading-relaxed',
  label: 'text-xs font-semibold uppercase tracking-wider',
  caption: 'text-xs leading-relaxed',
}

const colorSchemes: Record<'canvas' | 'onSurface', Record<NonNullable<TextProps['variant']>, string>> = {
  canvas: {
    body: 'text-[var(--color-text)]',
    'body-sm': 'text-[var(--color-text-secondary)]',
    'body-lg': 'text-[var(--color-text)]',
    muted: 'text-[var(--color-text-muted)]',
    lead: 'text-[var(--color-text-secondary)]',
    label: 'text-[var(--color-text-muted)]',
    caption: 'text-[var(--color-text-muted)]',
  },
  onSurface: {
    body: 'text-[var(--color-text-on-surface)]',
    'body-sm': 'text-[var(--color-text-on-surface-secondary)]',
    'body-lg': 'text-[var(--color-text-on-surface)]',
    muted: 'text-[var(--color-text-on-surface-muted)]',
    lead: 'text-[var(--color-text-on-surface-secondary)]',
    label: 'text-[var(--color-text-on-surface-muted)]',
    caption: 'text-[var(--color-text-on-surface-muted)]',
  },
}

export function Text({
  children,
  variant = 'body',
  as: Component = 'p',
  onSurface = false,
  className = '',
}: TextProps) {
  const colors = onSurface ? colorSchemes.onSurface : colorSchemes.canvas
  return (
    <Component className={`${baseVariants[variant]} ${colors[variant]} ${className}`}>
      {children}
    </Component>
  )
}
