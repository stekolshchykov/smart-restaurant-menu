import { motion, useReducedMotion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { formatTimeMMSS } from '../../lib/formatters.ts'
import { CircularProgress } from '../ui/CircularProgress.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'

export interface OrderTimerProps {
  secondsRemaining: number
  totalSeconds?: number
  label?: string
  size?: number
  statusText?: string | ((seconds: number) => string)
}

export function OrderTimer({
  secondsRemaining,
  totalSeconds = secondsRemaining,
  label = 'Estimated waiting time',
  size = 220,
  statusText,
}: OrderTimerProps) {
  const shouldReduceMotion = useReducedMotion()
  const clamped = Math.max(0, Math.floor(secondsRemaining))
  const progress = totalSeconds > 0 ? clamped / totalSeconds : 0
  const isLow = clamped > 0 && clamped < 60
  const isCritical = clamped > 0 && clamped < 30
  const isReady = clamped === 0

  const ringColor = isReady
    ? 'var(--color-success)'
    : isCritical
      ? 'var(--color-error)'
      : isLow
        ? 'var(--color-warning)'
        : 'var(--color-primary)'

  const textColor = isReady
    ? 'text-[var(--color-success)]'
    : isCritical
      ? 'text-[var(--color-error)]'
      : isLow
        ? 'text-[var(--color-warning)]'
        : 'text-[var(--color-primary)]'

  const resolvedStatusText =
    statusText !== undefined
      ? typeof statusText === 'function'
        ? statusText(clamped)
        : statusText
      : isReady
        ? 'Your order is ready'
        : clamped < 120
          ? 'Almost ready'
          : 'Preparing your order'

  return (
    <Surface
      elevated
      className="relative flex flex-col items-center gap-5 overflow-hidden p-8"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, var(--color-primary-bg), transparent 60%)',
        }}
      />

      <Text variant="label" onSurface className="relative z-10 tracking-widest">
        {label}
      </Text>

      <div className="relative z-10">
        <CircularProgress
          value={progress}
          size={size}
          strokeWidth={10}
          color={ringColor}
          trackColor="var(--color-border-on-surface-subtle)"
        >
          <Stack align="center" gap={1}>
            <motion.div
              animate={isReady ? { scale: [1, 1.15, 1] } : {}}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <Clock size={26} className={textColor} />
            </motion.div>
            <span
              className={`font-heading text-5xl font-bold tabular-nums tracking-tight ${textColor}`}
              aria-live="polite"
            >
              {formatTimeMMSS(clamped)}
            </span>
          </Stack>
        </CircularProgress>
      </div>

      <Text
        variant="body-lg"
        onSurface
        aria-live="polite"
        className={`relative z-10 text-center font-medium ${textColor}`}
      >
        {resolvedStatusText}
      </Text>
    </Surface>
  )
}
