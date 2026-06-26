import type { MenuItem } from '../../types.ts'
import { ProductImageGallery } from './ProductImageGallery.tsx'

export interface ProductVisualPanelProps {
  item: MenuItem
}

export function ProductVisualPanel({ item }: ProductVisualPanelProps) {
  const images = item.images && item.images.length > 0
    ? item.images
    : [item.image]

  return (
    <ProductImageGallery images={images} alt={item.name} />
  )
}
