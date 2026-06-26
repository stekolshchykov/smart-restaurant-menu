import { ArrowLeft, ShoppingBag } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { Heading } from '../ui/Heading'
import { IconButton } from '../ui/IconButton'
import { Image } from '../ui/Image'
import { SkipToContent } from '../ui/SkipToContent'

export interface HeaderProps {
  itemCount?: number
  onCartClick?: () => void
  onLogoClick?: () => void
  onBack?: () => void
  restaurantName?: string
  restaurantLogo?: string
  title?: string
  showCart?: boolean
}

export function Header({
  itemCount = 0,
  onCartClick,
  onLogoClick,
  onBack,
  restaurantName,
  restaurantLogo,
  title,
  showCart = true,
}: HeaderProps) {
  const displayTitle = restaurantName || title || 'Menu'

  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 border-b border-[var(--color-border-on-surface)] bg-[var(--color-surface)]/95 backdrop-blur-sm"
      style={{ paddingTop: 'var(--safe-area-top)' }}
    >
      <SkipToContent target="#main-content" />
      <Container className="flex h-[var(--header-height)] items-center justify-between">
        {onBack ? (
          <IconButton onClick={onBack} aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </IconButton>
        ) : (
          <Button
            variant="ghost"
            size="md"
            onClick={onLogoClick}
            iconLeft={
              restaurantLogo ? (
                <Image
                  src={restaurantLogo}
                  alt=""
                  aspectRatio="square"
                  className="h-9 w-9 rounded-full"
                />
              ) : undefined
            }
            className="gap-2.5 px-1"
          >
            <Heading level={5} variant="title" onSurface>
              {displayTitle}
            </Heading>
          </Button>
        )}

        {showCart && onCartClick && (
          <IconButton
            onClick={onCartClick}
            aria-label={`Shopping cart with ${itemCount} items`}
          >
            <span className="relative">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge
                  variant="primary"
                  className="absolute -top-2.5 -right-2.5 h-5 min-w-5 justify-center px-1 text-xs"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </Badge>
              )}
            </span>
          </IconButton>
        )}
      </Container>
    </header>
  )
}
