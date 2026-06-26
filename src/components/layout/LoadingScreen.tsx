import { Loader2 } from 'lucide-react'
import { Stack } from '../ui/Stack'
import { Text } from '../ui/Text'

export interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = 'Loading menu…' }: LoadingScreenProps) {
  return (
    <Stack gap={4} align="center" justify="center" className="min-h-svh">
      <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
      <Text variant="muted">{message}</Text>
    </Stack>
  )
}
