import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface StaggerContainerProps {
  children: ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
}

export function StaggerContainer({
  children,
  className = '',
  stagger = 0.08,
  delayChildren = 0,
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: { opacity: shouldReduceMotion ? 1 : 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : stagger,
            delayChildren: shouldReduceMotion ? 0 : delayChildren,
          },
        },
      }}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: shouldReduceMotion ? 1 : 0,
          y: shouldReduceMotion ? 0 : 16,
        },
        show: { opacity: 1, y: 0 },
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}
