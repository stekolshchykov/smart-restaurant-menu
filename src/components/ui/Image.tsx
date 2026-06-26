import { useState } from 'react'
import { ImageIcon } from 'lucide-react'

export interface ImageProps {
  src: string
  alt: string
  aspectRatio?: 'video' | 'square' | '4/3' | 'auto'
  className?: string
  hoverZoom?: boolean
  priority?: boolean
  fetchPriority?: 'high' | 'low' | 'auto'
}

const aspectClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  auto: '',
}

export function Image({
  src,
  alt,
  aspectRatio = 'video',
  className = '',
  hoverZoom = false,
  priority = false,
  fetchPriority,
}: ImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const showFallback = hasError || !src

  return (
    <div
      className={`relative overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)] ${aspectClasses[aspectRatio]} ${className}`}
    >
      {!loaded && !showFallback && (
        <div className="absolute inset-0 animate-pulse bg-[var(--color-border-subtle)]" />
      )}

      {showFallback ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[var(--color-text-muted)]">
          <ImageIcon className="h-8 w-8 opacity-50" />
          <span className="text-xs">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'auto' : 'async'}
          fetchPriority={priority ? 'high' : fetchPriority}
          onLoad={() => setLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-all duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'} ${hoverZoom ? 'transition-transform duration-500 hover:scale-105' : ''}`}
        />
      )}
    </div>
  )
}
