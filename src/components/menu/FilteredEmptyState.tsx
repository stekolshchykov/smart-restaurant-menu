import { SearchX } from 'lucide-react'
import { Button } from '../ui/Button.tsx'
import { EmptyState } from '../ui/EmptyState.tsx'

export interface FilteredEmptyStateProps {
  onClear: () => void
}

export function FilteredEmptyState({ onClear }: FilteredEmptyStateProps) {
  return (
    <EmptyState
      icon={<SearchX className="h-8 w-8 text-[var(--color-accent)]" />}
      title="No dishes found"
      description="Try a different search term or adjust your dietary filters."
      action={
        <Button variant="primary" size="md" onClick={onClear}>
          Clear filters
        </Button>
      }
    />
  )
}
