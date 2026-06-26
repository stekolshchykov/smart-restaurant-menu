import type { ReactNode } from 'react'

export interface SectionProps {
  children: ReactNode
  className?: string
  id?: string
  'aria-labelledby'?: string
}

export function Section({
  children,
  className = '',
  id,
  'aria-labelledby': ariaLabelledBy,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={`py-6 sm:py-8 lg:py-10 ${className}`}
    >
      {children}
    </section>
  )
}
