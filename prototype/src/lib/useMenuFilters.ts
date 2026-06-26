import { useEffect, useMemo, useState } from 'react'
import type { Category, MenuData, MenuItem } from '../types.ts'

export type DietaryFilter = 'spicy' | 'vegetarian' | 'vegan' | 'glutenFree'

const FILTERS_KEY = 'digital-menu-filters'

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

const VALID_FILTERS: DietaryFilter[] = ['spicy', 'vegetarian', 'vegan', 'glutenFree']

function readSavedFilters(): { query: string; activeFilters: DietaryFilter[] } {
  try {
    const raw = localStorage.getItem(FILTERS_KEY)
    if (!raw) return { query: '', activeFilters: [] }
    const parsed = JSON.parse(raw) as { query?: string; activeFilters?: unknown[] }
    const activeFilters = (parsed.activeFilters ?? []).filter((f): f is DietaryFilter =>
      VALID_FILTERS.includes(f as DietaryFilter),
    )
    return { query: typeof parsed.query === 'string' ? parsed.query : '', activeFilters }
  } catch {
    return { query: '', activeFilters: [] }
  }
}

export function useMenuFilters(menu: MenuData): UseMenuFiltersResult {
  const saved = readSavedFilters()
  const [query, setQuery] = useState(saved.query)
  const [activeFilters, setActiveFilters] = useState<DietaryFilter[]>(saved.activeFilters)

  useEffect(() => {
    try {
      localStorage.setItem(
        FILTERS_KEY,
        JSON.stringify({ query, activeFilters }),
      )
    } catch {
      // ignore private-mode / quota errors
    }
  }, [query, activeFilters])

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
