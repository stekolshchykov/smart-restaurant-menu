import { useMemo, useState } from 'react'
import type { MenuData, MenuItem } from '../types.ts'
import { Layout } from '../components/layout/Layout.tsx'
import { MenuItemDetails } from '../components/menu/MenuItemDetails.tsx'
import { Container } from '../components/ui/Container.tsx'

export interface DetailScreenProps {
  item: MenuItem
  menu: MenuData
  onAddToOrder: (
    item: MenuItem,
    quantity: number,
    addons: Record<string, number>,
  ) => void
  onRelatedItemClick: (item: MenuItem) => void
  onPairingClick: (id: string) => void
  onBack: () => void
}

export function DetailScreen({
  item,
  menu,
  onAddToOrder,
  onRelatedItemClick,
  onPairingClick,
  onBack,
}: DetailScreenProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>(
    {},
  )

  const allItems = useMemo(
    () => menu.categories.flatMap((category) => category.items),
    [menu],
  )

  const relatedItems = useMemo(() => {
    const ids = item.relatedIds ?? []
    return ids
      .map((id) => allItems.find((i) => i.id === id))
      .filter((i): i is MenuItem => Boolean(i))
  }, [item, allItems])

  const handleAddonChange = (addonId: string, qty: number) => {
    setSelectedAddons((prev) => ({ ...prev, [addonId]: qty }))
  }

  const handleAddToOrder = () => {
    onAddToOrder(item, quantity, selectedAddons)
  }

  return (
    <Layout onBack={onBack} showCartButton={false}>
      <Container size="lg" className="py-4 sm:py-6 pb-8">
        <MenuItemDetails
          item={item}
          relatedItems={relatedItems}
          quantity={quantity}
          onQuantityChange={setQuantity}
          selectedAddons={selectedAddons}
          onAddonChange={handleAddonChange}
          onAddToOrder={handleAddToOrder}
          onRelatedItemClick={onRelatedItemClick}
          onPairingClick={onPairingClick}
        />
      </Container>
    </Layout>
  )
}
