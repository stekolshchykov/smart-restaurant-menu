import type { ReactNode } from 'react'

export interface FlexProps {
  children: ReactNode
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  className?: string
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

export function Flex({
  children,
  gap = 4,
  align = 'center',
  justify = 'start',
  wrap = false,
  className = '',
}: FlexProps) {
  return (
    <div
      className={`flex flex-row gap-${gap} ${alignClasses[align]} ${justifyClasses[justify]} ${wrap ? 'flex-wrap' : 'flex-nowrap'} ${className}`}
    >
      {children}
    </div>
  )
}
