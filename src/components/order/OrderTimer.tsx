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
}

export function OrderTimer({
  secondsRemaining,
  totalSeconds = secondsRemaining,
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

  const statusText =
    clamped === 0
      ? 'Time is up'
      : isLow
        ? 'Hurry, time is running out!'
        : 'Time remaining to place your order'

  return (
    <Surface className="flex flex-col items-center gap-4 p-6">
      <Heading level={2} variant="section" onSurface>
        Time Remaining
      </Heading>

      <CircularProgress
        value={progress}
        size={110}
        strokeWidth={6}
        color={ringColor}
      >
        <Stack align="center" gap={1}>
          <Clock size={20} className={textColor} />
          <span
            className={`text-3xl font-bold tabular-nums tracking-tight ${textColor}`}
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
        {statusText}
      </Text>
    </Surface>
  )
}
