import type { ReactNode } from 'react'

export interface StackProps {
  children: ReactNode
  direction?: 'row' | 'column'
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between'
  className?: string
}

const directionClasses = {
  row: 'flex-row',
  column: 'flex-col',
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
}

export function Stack({
  children,
  direction = 'column',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  className = '',
}: StackProps) {
  return (
    <div
      className={`flex ${directionClasses[direction]} gap-${gap} ${alignClasses[align]} ${justifyClasses[justify]} ${className}`}
    >
      {children}
    </div>
  )
}
