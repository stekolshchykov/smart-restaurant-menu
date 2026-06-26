import type { ReactNode } from 'react'
import { Surface } from './Surface'
import { Heading } from './Heading'
import { Text } from './Text'
import { Stack } from './Stack'

export interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <Surface className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className}`}>
      <Stack gap={4} align="center">
        {icon && (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-bg)]">
            {icon}
          </div>
        )}

        <Stack gap={1} align="center">
          <Heading level={3} variant="title" onSurface>
            {title}
          </Heading>
          {description && (
            <Text variant="body" onSurface className="max-w-xs">
              {description}
            </Text>
          )}
        </Stack>

        {action}
      </Stack>
    </Surface>
  )
}
