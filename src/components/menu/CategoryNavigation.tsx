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
      className="sticky top-[var(--header-total-height)] z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 py-3 backdrop-blur-sm"
      aria-label="Category navigation"
    >
      <Container size="full">
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 lg:-mx-0 lg:justify-center lg:overflow-visible lg:px-0">
          <ToggleGroup
            items={categories.map((category) => ({
              value: category.id,
              label: category.name,
              disabled:
                visibleCategoryIds && !visibleCategoryIds.has(category.id),
            }))}
            value={activeCategory}
            onChange={onSelect}
            className="shrink-0"
          />
        </div>
      </Container>
    </nav>
  )
}
