import type { HTMLAttributes, ReactNode } from 'react'

export interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  gap?: 0 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
}

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const gapClasses = {
  0: 'gap-0',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
  12: 'gap-12',
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
  ...props
}: FlexProps) {
  return (
    <div
      className={`flex flex-row ${gapClasses[gap]} ${alignClasses[align]} ${justifyClasses[justify]} ${wrap ? 'flex-wrap' : 'flex-nowrap'} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
