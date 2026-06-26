import { useMemo, useState } from 'react'
import type { Category, MenuData, MenuItem } from '../types.ts'

export type DietaryFilter = 'spicy' | 'vegetarian' | 'vegan' | 'glutenFree'

export interface UseMenuFiltersResult {
  query: string
  setQuery: (value: string) => void
  activeFilters: DietaryFilter[]
  toggleFilter: (filter: DietaryFilter) => void
  clearFilters: () => void
  filteredCategories: Category[]
  resultCount: number
}

const DIETARY_FIELDS: Record<DietaryFilter, keyof MenuItem> = {
  spicy: 'isSpicy',
  vegetarian: 'isVegetarian',
  vegan: 'isVegan',
  glutenFree: 'isGlutenFree',
}

function matchesQuery(item: MenuItem, query: string): boolean {
  const term = query.trim().toLowerCase()
  if (!term) return true

  const haystack = [
    item.name,
    item.description,
    ...item.ingredients,
    ...item.allergens,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(term)
}

function matchesDietary(
  item: MenuItem,
  activeFilters: DietaryFilter[],
): boolean {
  return activeFilters.every((filter) => Boolean(item[DIETARY_FIELDS[filter]]))
}

export function useMenuFilters(menu: MenuData): UseMenuFiltersResult {
  const [query, setQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>([])

  const toggleFilter = (filter: DietaryFilter) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    )
  }

  const clearFilters = () => {
    setQuery('')
    setActiveFilters([])
  }

  const filteredCategories = useMemo(() => {
    return menu.categories
      .map((category) => ({
        ...category,
        items: category.items.filter(
          (item) =>
            matchesQuery(item, query) && matchesDietary(item, activeFilters),
        ),
      }))
      .filter((category) => category.items.length > 0)
  }, [menu.categories, query, activeFilters])

  const resultCount = useMemo(
    () => filteredCategories.reduce((sum, category) => sum + category.items.length, 0),
    [filteredCategories],
  )

  return {
    query,
    setQuery,
    activeFilters,
    toggleFilter,
    clearFilters,
    filteredCategories,
    resultCount,
  }
}
