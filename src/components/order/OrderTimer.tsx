import { Clock } from 'lucide-react'
import { formatTimeMMSS } from '../../lib/formatters'
import { CircularProgress } from '../ui/CircularProgress'
import { Heading } from '../ui/Heading'
import { Stack } from '../ui/Stack'
import { Surface } from '../ui/Surface'
import { Text } from '../ui/Text'

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
  label = 'Time Remaining',
  size = 140,
  statusText,
}: OrderTimerProps) {
  const clamped = Math.max(0, Math.floor(secondsRemaining))
  const progress = totalSeconds > 0 ? clamped / totalSeconds : 0
  const isLow = clamped < 60
  const isCritical = clamped < 30

  const ringColor = isCritical
    ? 'var(--color-error)'
    : isLow
      ? 'var(--color-warning)'
      : 'var(--color-primary)'

  const textColor = isCritical
    ? 'text-[var(--color-error)]'
    : isLow
      ? 'text-[var(--color-warning)]'
      : 'text-[var(--color-primary)]'

  const resolvedStatusText =
    statusText !== undefined
      ? typeof statusText === 'function'
        ? statusText(clamped)
        : statusText
      : clamped === 0
        ? 'Time is up'
        : isLow
          ? 'Hurry, time is running out!'
          : 'Time remaining to place your order'

  return (
    <Surface className="flex flex-col items-center gap-4 p-6">
      <Heading level={2} variant="section" onSurface>
        {label}
      </Heading>

      <CircularProgress
        value={progress}
        size={size}
        strokeWidth={8}
        color={ringColor}
      >
        <Stack align="center" gap={1}>
          <Clock size={22} className={textColor} />
          <span
            className={`text-4xl font-bold tabular-nums tracking-tight ${textColor}`}
            aria-live="polite"
          >
            {formatTimeMMSS(clamped)}
          </span>
        </Stack>
      </CircularProgress>

      <Text
        variant="body-sm"
        onSurface
        className={`text-center ${isLow ? '!text-[var(--color-error)]' : ''}`}
      >
        {resolvedStatusText}
      </Text>
    </Surface>
  )
}
