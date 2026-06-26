import type { ReactNode } from 'react'
import { Stack } from '../ui/Stack'
import { Header } from './Header'
import { ServiceRequestButton } from './ServiceRequestButton'

export interface LayoutProps {
  children: ReactNode
  showCartButton?: boolean
  cartItemCount?: number
  onCartClick?: () => void
  onLogoClick?: () => void
  restaurantName?: string
  restaurantLogo?: string
  title?: string
  onBack?: () => void
  showCart?: boolean
}

export function Layout({
  children,
  showCartButton,
  cartItemCount = 0,
  onCartClick,
  onLogoClick,
  restaurantName,
  restaurantLogo,
  title,
  onBack,
  showCart,
}: LayoutProps) {
  const showCartEffective = showCartButton ?? showCart ?? true

  return (
    <Stack direction="column" gap={0} className="min-h-svh">
      <Header
        itemCount={cartItemCount}
        onCartClick={onCartClick}
        onLogoClick={onLogoClick}
        onBack={onBack}
        restaurantName={restaurantName}
        restaurantLogo={restaurantLogo}
        title={title}
        showCart={showCartEffective}
      />

      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: 'var(--header-total-height)' }}
      >
        {children}
      </main>

      <ServiceRequestButton />
    </Stack>
  )
}
