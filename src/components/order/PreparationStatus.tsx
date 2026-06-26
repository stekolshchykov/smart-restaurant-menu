import { CheckCircle2 } from 'lucide-react'
import { Text } from '../ui/Text.tsx'

const STEPS = ['Order received', 'Being prepared', 'Almost ready']

export interface PreparationStatusProps {
  elapsedSeconds: number
  totalSeconds: number
}

export function PreparationStatus({
  elapsedSeconds,
  totalSeconds,
}: PreparationStatusProps) {
  const clampedElapsed = Math.max(0, Math.min(elapsedSeconds, totalSeconds))
  const progress = totalSeconds > 0 ? clampedElapsed / totalSeconds : 0
  const activeIndex = progress < 0.25 ? 0 : progress < 0.75 ? 1 : 2

  return (
    <div className="w-full max-w-md">
      <div className="relative flex justify-between">
        <div className="absolute top-[0.6875rem] right-5 left-5 h-0.5 bg-[var(--color-border-on-surface-subtle)]" />
        <div
          className="absolute top-[0.6875rem] left-5 h-0.5 rounded-full bg-[var(--color-accent)] transition-all duration-700"
          style={{
            width: `calc(${(progress * 100).toFixed(1)}% - 2.5rem)`,
          }}
        />

        {STEPS.map((label, index) => {
          const isCompleted = index < activeIndex
          const isActive = index === activeIndex

          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-2.5">
              <div
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                  isCompleted || isActive
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]'
                    : 'border-[var(--color-border-on-surface-subtle)] bg-[var(--color-surface)]'
                }`}
              >
                {isCompleted && (
                  <CheckCircle2 className="h-2.5 w-2.5 text-[var(--color-surface)]" />
                )}
              </div>
              <Text
                variant="body-sm"
                onSurface
                className={`max-w-[5.5rem] text-center leading-snug ${
                  isActive || isCompleted
                    ? 'text-[var(--color-heading-on-surface)]'
                    : 'text-[var(--color-text-on-surface-muted)]'
                }`}
              >
                {label}
              </Text>
            </div>
          )
        })}
      </div>
    </div>
  )
}
