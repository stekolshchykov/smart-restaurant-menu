import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className = '',
  direction = 'up',
  distance = 16,
}: FadeInProps) {
  const shouldReduceMotion = useReducedMotion()

  const offset = shouldReduceMotion
    ? {}
    : direction === 'up'
      ? { y: distance }
      : direction === 'down'
        ? { y: -distance }
        : direction === 'left'
          ? { x: distance }
          : direction === 'right'
            ? { x: -distance }
            : {}

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              duration,
              delay,
              ease: [0.4, 0, 0.2, 1],
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}
