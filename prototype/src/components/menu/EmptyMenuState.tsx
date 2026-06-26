import { useCallback } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '../ui/Button.tsx'
import { Flex } from '../ui/Flex.tsx'
import { Heading } from '../ui/Heading.tsx'
import { Stack } from '../ui/Stack.tsx'
import { Surface } from '../ui/Surface.tsx'
import { Text } from '../ui/Text.tsx'

export interface SuggestedCategory {
  id: string
  name: string
}

export interface EmptyMenuStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  suggestions?: SuggestedCategory[]
  onSuggestionClick?: (categoryId: string) => void
  onResetFilters?: () => void
  onShowAll?: () => void
}

export function EmptyMenuState({
  title = 'We couldn’t find a match',
  description = 'Don’t worry — there’s plenty more on the menu. Reset your filters or jump to a category below.',
  icon,
  suggestions,
  onSuggestionClick,
  onResetFilters,
  onShowAll,
}: EmptyMenuStateProps) {
  const shouldReduceMotion = useReducedMotion()

  const handleSuggestionClick = useCallback(
    (categoryId: string) => {
      onSuggestionClick?.(categoryId)
    },
    [onSuggestionClick],
  )

  return (
    <Surface
      elevated
      className="flex flex-col items-center px-6 py-16 text-center sm:px-8 sm:py-20"
    >
      <Stack gap={6} align="center" className="max-w-md">
        <motion.div
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            scale: shouldReduceMotion ? 1 : 0.8,
            y: shouldReduceMotion ? 0 : 16,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 260, damping: 20 }
          }
        >
          <Surface className="rounded-full border-0 bg-[var(--color-accent-bg)] p-5 shadow-[var(--shadow-glow)]">
            {icon ?? (
              <SearchX className="h-10 w-10 text-[var(--color-accent)]" />
            )}
          </Surface>
        </motion.div>

        <motion.div
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            y: shouldReduceMotion ? 0 : 20,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }
          }
        >
          <Stack gap={2} align="center">
            <Heading level={2} variant="section" onSurface>
              {title}
            </Heading>
            <Text variant="body" onSurface className="max-w-xs">
              {description}
            </Text>
          </Stack>
        </motion.div>

        {suggestions && suggestions.length > 0 && (
          <motion.div
            initial={{
              opacity: shouldReduceMotion ? 1 : 0,
              y: shouldReduceMotion ? 0 : 16,
            }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }
            }
            className="w-full"
          >
            <Stack gap={3} align="center">
              <Text variant="label" onSurface>
                Or jump to a category
              </Text>
              <Flex
                gap={2}
                justify="center"
                wrap
                className="w-full"
              >
                {suggestions.map((category) => (
                  <Button
                    key={category.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </Flex>
            </Stack>
          </motion.div>
        )}

        <motion.div
          initial={{
            opacity: shouldReduceMotion ? 1 : 0,
            y: shouldReduceMotion ? 0 : 16,
          }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : { duration: 0.5, delay: 0.3, ease: [0.4, 0, 0.2, 1] }
          }
        >
          <Flex
            gap={3}
            justify="center"
            wrap
            className="w-full"
          >
            {onResetFilters && (
              <Button
                variant="primary"
                size="md"
                onClick={onResetFilters}
              >
                Reset filters
              </Button>
            )}
            {onShowAll && (
              <Button
                variant="outline"
                size="md"
                onClick={onShowAll}
              >
                Show all dishes
              </Button>
            )}
          </Flex>
        </motion.div>
      </Stack>
    </Surface>
  )
}
