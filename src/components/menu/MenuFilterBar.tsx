import { Carrot, Flame, Leaf, WheatOff, X } from 'lucide-react'
import type { DietaryFilter } from '../../lib/useMenuFilters.ts'
import { Button } from '../ui/Button.tsx'
import { Container } from '../ui/Container.tsx'
import { FilterChip } from '../ui/FilterChip.tsx'
import { SearchInput } from '../ui/SearchInput.tsx'
import { Text } from '../ui/Text.tsx'

export interface MenuFilterBarProps {
  query: string
  onQueryChange: (value: string) => void
  activeFilters: DietaryFilter[]
  onToggleFilter: (filter: DietaryFilter) => void
  resultCount: number
  onClear: () => void
  className?: string
}

const FILTER_OPTIONS: { value: DietaryFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'spicy', label: 'Spicy', icon: <Flame className="h-4 w-4" /> },
  { value: 'vegetarian', label: 'Vegetarian', icon: <Leaf className="h-4 w-4" /> },
  { value: 'vegan', label: 'Vegan', icon: <Carrot className="h-4 w-4" /> },
  { value: 'glutenFree', label: 'Gluten-free', icon: <WheatOff className="h-4 w-4" /> },
]

export function MenuFilterBar({
  query,
  onQueryChange,
  activeFilters,
  onToggleFilter,
  resultCount,
  onClear,
  className = '',
}: MenuFilterBarProps) {
  const hasActiveFilters = query.length > 0 || activeFilters.length > 0

  return (
    <div className={`py-4 ${className}`}>
      <Container size="xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchInput
            value={query}
            onChange={onQueryChange}
            placeholder="Search dishes, ingredients…"
            className="w-full md:max-w-sm"
          />

          <div className="flex items-center gap-3">
            <div className="scrollbar-hide -mx-1 flex flex-1 gap-2 overflow-x-auto px-1 md:flex-none">
              {FILTER_OPTIONS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  icon={option.icon}
                  selected={activeFilters.includes(option.value)}
                  onClick={() => onToggleFilter(option.value)}
                />
              ))}
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost-inverse"
                size="sm"
                onClick={onClear}
                iconRight={<X className="h-4 w-4" />}
                className="shrink-0"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="mt-3" aria-live="polite" aria-atomic="true">
          <Text variant="caption">
            {resultCount} {resultCount === 1 ? 'dish' : 'dishes'} found
          </Text>
        </div>
      </Container>
    </div>
  )
}
