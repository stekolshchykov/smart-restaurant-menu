import { motion, useReducedMotion } from 'framer-motion'

export interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
  trackColor?: string
  children?: React.ReactNode
}

export function CircularProgress({
  value,
  size = 112,
  strokeWidth = 6,
  className = '',
  color = 'var(--color-accent)',
  trackColor = 'var(--color-border-on-surface-subtle)',
  children,
}: CircularProgressProps) {
  const shouldReduceMotion = useReducedMotion()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.max(0, Math.min(1, value))
  const offset = circumference * (1 - progress)

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
          }
        />
      </svg>

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
