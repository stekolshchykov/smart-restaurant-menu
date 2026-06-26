import { ArrowLeft } from 'lucide-react'
import { Heading } from '../ui/Heading.tsx'
import { IconButton } from '../ui/IconButton.tsx'
import { SkipToContent } from '../ui/SkipToContent.tsx'

export interface HeaderProps {
  title?: string
  restaurantName?: string
  onBack?: () => void
}

export function Header({ title, restaurantName, onBack }: HeaderProps) {
  const displayTitle = title || restaurantName || 'Menu'

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md"
      style={{ paddingTop: 'var(--safe-area-top)' }}
    >
      <SkipToContent target="#main-content" />

      <div className="flex h-[var(--header-height)] items-center px-4 sm:px-6">
        <div className="flex w-10 items-center justify-start">
          {onBack && (
            <IconButton
              onClick={onBack}
              aria-label="Go back"
              variant="ghost-inverse"
              size="sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </IconButton>
          )}
        </div>

        <div className="flex-1 text-center">
          <Heading
            level={5}
            variant="title"
            className="text-sm sm:text-base"
          >
            {displayTitle}
          </Heading>
        </div>

        <div className="w-10" />
      </div>
    </header>
  )
}
