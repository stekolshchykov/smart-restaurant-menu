import { motion, useReducedMotion } from 'framer-motion'

export interface CelebrationRingProps {
  active: boolean
}

export function CelebrationRing({ active }: CelebrationRingProps) {
  const shouldReduceMotion = useReducedMotion()
  if (!active || shouldReduceMotion) return null

  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.cos((i * Math.PI) / 4) * 48,
            y: Math.sin((i * Math.PI) / 4) * 48,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute h-2 w-2 rounded-full bg-[var(--color-accent)]"
        />
      ))}
    </>
  )
}
