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
      <div className="aspect-[4/3] rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)]" />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)] lg:aspect-[3/4] lg:max-h-[80vh]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mainImage}
            className="h-full w-full"
            initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: shouldReduceMotion ? 1 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
          >
            <Image
              src={mainImage}
              alt={alt}
              aspectRatio="auto"
              priority
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {thumbs.length > 1 && (
        <div className="overflow-x-auto snap-x snap-mandatory pb-1 scrollbar-hide">
          <div className="mx-auto flex w-max gap-3">
            {thumbs.map((src, index) => (
              <div key={`${src}-${index}`} className="w-24 shrink-0 snap-start sm:w-28 lg:w-32">
                <ProductGalleryThumb
                  src={src}
                  alt={`${alt} view ${index + 1}`}
                  selected={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
