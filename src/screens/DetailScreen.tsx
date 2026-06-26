import { useState } from 'react'
import type { MenuItem } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { MenuItemDetails } from '../components/menu/MenuItemDetails.tsx'
import { Container } from '../components/ui/Container.tsx'

export interface DetailScreenProps {
  item: MenuItem
  onAddToOrder: (
    item: MenuItem,
    quantity: number,
    addons: Record<string, number>,
  ) => void
  onBack: () => void
}

export function DetailScreen({
  item,
  onAddToOrder,
  onBack,
}: DetailScreenProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>(
    {},
  )

  const handleAddonChange = (addonId: string, qty: number) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: qty }))
  }

  const handleAddToOrder = () => {
    onAddToOrder(item, quantity, selectedAddons)
  }

  return (
    <Layout onBack={onBack} title={item.name}>
      <Container size="lg" className="py-4 sm:py-6 pb-8">
        <MenuItemDetails
          item={item}
          quantity={quantity}
          onQuantityChange={setQuantity}
          selectedAddons={selectedAddons}
          onAddonChange={handleAddonChange}
          onAddToOrder={handleAddToOrder}
        />
      </Container>
    </Layout>
  )
}
