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
import { CategoryNavigation } from '../components/menu/CategoryNavigation.tsx'
import { CategorySection } from '../components/menu/CategorySection.tsx'
import { EmptyMenuState } from '../components/menu/EmptyMenuState.tsx'
import { MenuFilterBar } from '../components/menu/MenuFilterBar.tsx'
import { ChefRecommends } from '../components/menu/ChefRecommends.tsx'
import { MenuIntroHeader } from '../components/menu/MenuIntroHeader.tsx'
import { Container } from '../components/ui/Container.tsx'
import { Section } from '../components/ui/Section.tsx'

export interface MenuScreenProps {
  menu: MenuData
  onItemClick: (item: MenuItem) => void
  onQuickAdd: (item: MenuItem) => void
}

export function MenuScreen({
  menu,
  onItemClick,
  onQuickAdd,
}: MenuScreenProps) {
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
  const stickyHeaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = stickyHeaderRef.current
    if (!element) return

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--sticky-header-height',
        `${element.offsetHeight}px`,
      )
    }

    updateHeight()
    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--sticky-header-height')
    }
  }, [])

  const visibleCategoryIds = useMemo(
    () => new Set(filteredCategories.map((category) => category.id)),
    [filteredCategories],
  )

  const featuredItems = useMemo(
    () =>
      menu.categories
        .flatMap((category) => category.items)
        .filter((item) => item.featured)
        .slice(0, 6),
    [menu.categories],
  )

  const priorityItemIds = useMemo(() => {
    const ids = new Set<string>()
    let count = 0
    for (const category of menu.categories) {
      for (const item of category.items) {
        if (count >= 8) break
        ids.add(item.id)
        count++
      }
      if (count >= 8) break
    }
    featuredItems.slice(0, 3).forEach((item) => ids.add(item.id))
    return ids
  }, [menu.categories, featuredItems])

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
  }

  const handleSuggestionClick = useCallback(
    (categoryId: string) => {
      clearFilters()
      setActiveCategory(categoryId)
      requestAnimationFrame(() => {
        const element = document.getElementById(categoryId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    },
    [clearFilters],
  )

  return (
    <Layout showHeader={false} restaurantName={menu.restaurant.name}>
      <MenuIntroHeader restaurant={menu.restaurant} />

      <ChefRecommends items={featuredItems} onItemClick={onItemClick} />

      <div
        ref={stickyHeaderRef}
        className="sticky top-[var(--safe-area-top)] z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm"
      >
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
      </div>

      {resultCount === 0 ? (
        <Section className="py-12">
          <Container size="md">
            <EmptyMenuState
              title="No dishes found"
              description="We couldn’t find anything in this selection. Try another category or reset filters."
              suggestions={menu.categories.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              onSuggestionClick={handleSuggestionClick}
              onResetFilters={clearFilters}
              onShowAll={clearFilters}
            />
          </Container>
        </Section>
      ) : (
        filteredCategories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onItemClick={onItemClick}
            onQuickAdd={handleQuickAdd}
            priorityItemIds={priorityItemIds}
          />
        ))
      )}
    </Layout>
  )
}
