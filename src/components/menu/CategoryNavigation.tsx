import type { Category } from '../../types'
import { Container } from '../ui/Container'
import { ToggleGroup } from '../ui/ToggleGroup'

export interface CategoryNavigationProps {
  categories: Category[]
  activeCategory: string
  onSelect: (id: string) => void
  visibleCategoryIds?: Set<string>
}

export function CategoryNavigation({
  categories,
  activeCategory,
  onSelect,
  visibleCategoryIds,
}: CategoryNavigationProps) {
  return (
    <nav
      className="py-3"
      aria-label="Category navigation"
    >
      <Container size="xl">
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
          <ToggleGroup
            items={categories.map((category) => {
              const disabled =
                visibleCategoryIds && !visibleCategoryIds.has(category.id)
              return {
                value: category.id,
                label: category.name,
                disabled,
                ariaLabel: disabled
                  ? `${category.name}: no dishes match the current filters`
                  : category.name,
              }
            })}
            value={activeCategory}
            onChange={onSelect}
            className="shrink-0"
          />
        </div>
      </Container>
    </nav>
  )
}
