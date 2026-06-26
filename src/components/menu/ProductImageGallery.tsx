import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Image } from '../ui/Image.tsx'
import { ProductGalleryThumb } from './ProductGalleryThumb.tsx'

export interface ProductImageGalleryProps {
  images: string[]
  alt: string
}

export function ProductImageGallery({
  images,
  alt,
}: ProductImageGalleryProps) {
  const shouldReduceMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)

  const safeImages = images.length > 0 ? images : []
  const mainImage = safeImages[activeIndex] ?? safeImages[0]
  const thumbs = safeImages.slice(0, 6)

  if (safeImages.length === 0) {
    return (
      <div className="aspect-video rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)]" />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mainImage}
            initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          >
            <Image
              src={mainImage}
              alt={alt}
              aspectRatio="video"
              priority
              className="max-h-[55vh] w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {thumbs.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-4">
          {thumbs.map((src, index) => (
            <ProductGalleryThumb
              key={`${src}-${index}`}
              src={src}
              alt={`${alt} view ${index + 1}`}
              selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
