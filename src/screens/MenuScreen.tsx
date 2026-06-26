import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { MenuData, MenuItem } from '../types.ts'
import { useMenuFilters } from '../lib/useMenuFilters.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { useToast } from '../lib/useToast.ts'
import { CategoryNavigation } from '../components/menu/CategoryNavigation.tsx'
import { CategorySection } from '../components/menu/CategorySection.tsx'
import { FilteredEmptyState } from '../components/menu/FilteredEmptyState.tsx'
import { MenuFilterBar } from '../components/menu/MenuFilterBar.tsx'
import { MenuHeader } from '../components/menu/MenuHeader.tsx'
import { Container } from '../components/ui/Container.tsx'
import { Section } from '../components/ui/Section.tsx'

export interface MenuScreenProps {
  menu: MenuData
  onItemClick: (item: MenuItem) => void
  onQuickAdd: (item: MenuItem) => void
  cartItemCount: number
  onCartClick: () => void
}

export function MenuScreen({
  menu,
  onItemClick,
  onQuickAdd,
  cartItemCount,
  onCartClick,
}: MenuScreenProps) {
  const { show } = useToast()
  const {
    query,
    setQuery,
    activeFilters,
    toggleFilter,
    clearFilters,
    filteredCategories,
    resultCount,
  } = useMenuFilters(menu)

  const [activeCategory, setActiveCategory] = useState(
    menu.categories[0]?.id ?? '',
  )
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isManualScroll = useRef(false)

  const visibleCategoryIds = useMemo(
    () => new Set(filteredCategories.map((category) => category.id)),
    [filteredCategories],
  )

  useEffect(() => {
    if (filteredCategories.length === 0) return
    if (!visibleCategoryIds.has(activeCategory)) {
      setActiveCategory(filteredCategories[0].id)
    }
  }, [filteredCategories, visibleCategoryIds, activeCategory])

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      if (!visibleCategoryIds.has(categoryId)) return

      setActiveCategory(categoryId)
      isManualScroll.current = true
      const element = document.getElementById(categoryId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        setTimeout(() => {
          isManualScroll.current = false
        }, 1000)
      }
    },
    [visibleCategoryIds],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScroll.current) return
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            visibleCategoryIds.has(entry.target.id)
          ) {
            setActiveCategory(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-40% 0px -55% 0px',
        threshold: 0,
      },
    )

    filteredCategories.forEach((category) => {
      const element = document.getElementById(category.id)
      if (element) observer.observe(element)
    })

    observerRef.current = observer
    return () => observer.disconnect()
  }, [filteredCategories, visibleCategoryIds])

  const handleQuickAdd = (item: MenuItem) => {
    onQuickAdd(item)
    if (item.addons.length === 0) {
      show(`Added ${item.name} to order`)
    }
  }

  return (
    <Layout
      showCartButton
      cartItemCount={cartItemCount}
      onCartClick={onCartClick}
      restaurantName={menu.restaurant.name}
      restaurantLogo={menu.restaurant.logo}
    >
      <MenuHeader restaurant={menu.restaurant} />

      <MenuFilterBar
        query={query}
        onQueryChange={setQuery}
        activeFilters={activeFilters}
        onToggleFilter={toggleFilter}
        resultCount={resultCount}
        onClear={clearFilters}
      />

      {resultCount > 0 && (
        <CategoryNavigation
          categories={menu.categories}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
          visibleCategoryIds={visibleCategoryIds}
        />
      )}

      {resultCount === 0 ? (
        <Section className="py-12">
          <Container size="md">
            <FilteredEmptyState onClear={clearFilters} />
          </Container>
        </Section>
      ) : (
        filteredCategories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onItemClick={onItemClick}
            onQuickAdd={handleQuickAdd}
          />
        ))
      )}
    </Layout>
  )
}
