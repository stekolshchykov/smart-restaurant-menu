import { ChefHat } from 'lucide-react'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'

export interface ChefNoteProps {
  note: string
}

export function ChefNote({ note }: ChefNoteProps) {
  return (
    <Surface className="border-l-4 border-l-[var(--color-accent)] p-4">
      <div className="flex items-start gap-3">
        <ChefHat className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" />
        <Text variant="body" onSurface>
          {note}
        </Text>
      </div>
    </Surface>
  )
}
