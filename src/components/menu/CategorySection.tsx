import type { Category, MenuItem } from '../../types'
import { Container } from '../ui/Container'
import { Heading } from '../ui/Heading'
import { Section } from '../ui/Section'
import { StaggerContainer, StaggerItem } from '../ui/StaggerContainer'
import { MenuItemCard } from './MenuItemCard'

export interface CategorySectionProps {
  category: Category
  onItemClick: (item: MenuItem) => void
  onQuickAdd: (item: MenuItem) => void
}

export function CategorySection({
  category,
  onItemClick,
  onQuickAdd,
}: CategorySectionProps) {
  return (
    <Section
      id={category.id}
      className="scroll-mt-[calc(var(--header-total-height)+3.5rem)]"
      aria-labelledby={`category-heading-${category.id}`}
    >
      <Container size="xl">
        <span id={`category-heading-${category.id}`}>
          <Heading level={2} variant="section" className="mb-4">
            {category.name}
          </Heading>
        </span>

        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-6">
          {category.items.map((item) => (
            <StaggerItem key={item.id}>
              <MenuItemCard
                item={item}
                onClick={() => onItemClick(item)}
                onQuickAdd={() => onQuickAdd(item)}
              />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </Container>
    </Section>
  )
}
