import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export interface SlideUpProps {
  children: ReactNode
  delay?: number
  duration?: number
  distance?: number
  className?: string
}

export function SlideUp({
  children,
  delay = 0,
  duration = 0.5,
  distance = 24,
  className = '',
}: SlideUpProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{
        opacity: shouldReduceMotion ? 1 : 0,
        y: shouldReduceMotion ? 0 : distance,
      }}
      animate={{ opacity: 1, y: 0 }}
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
