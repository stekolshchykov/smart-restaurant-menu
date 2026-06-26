import type { ReactNode } from 'react'

export interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  variant?: 'display' | 'section' | 'title' | 'card'
  onSurface?: boolean
  className?: string
  id?: string
}

const levelClasses = {
  1: 'text-3xl sm:text-5xl lg:text-6xl',
  2: 'text-2xl sm:text-3xl lg:text-4xl',
  3: 'text-xl sm:text-2xl lg:text-3xl',
  4: 'text-lg sm:text-xl lg:text-2xl',
  5: 'text-base sm:text-lg lg:text-xl',
  6: 'text-sm sm:text-base lg:text-lg',
}

const variantClasses = {
  display: 'font-heading font-bold tracking-tight',
  section: 'font-heading font-semibold tracking-tight',
  title: 'font-semibold',
  card: 'font-semibold',
}

const colorSchemes = {
  canvas: {
    display: 'text-[var(--color-heading)]',
    section: 'text-[var(--color-heading)]',
    title: 'text-[var(--color-heading)]',
    card: 'text-[var(--color-heading)]',
  },
  onSurface: {
    display: 'text-[var(--color-heading-on-surface)]',
    section: 'text-[var(--color-heading-on-surface)]',
    title: 'text-[var(--color-heading-on-surface)]',
    card: 'text-[var(--color-heading-on-surface)]',
  },
}

export function Heading({
  children,
  level = 2,
  variant = 'section',
  onSurface = false,
  className = '',
  id,
}: HeadingProps) {
  const Component = `h${level}` as const
  const colors = onSurface ? colorSchemes.onSurface : colorSchemes.canvas

  return (
    <Component
      id={id}
      className={`leading-tight ${levelClasses[level]} ${variantClasses[variant]} ${colors[variant]} ${className}`}
    >
      {children}
    </Component>
  )
}
