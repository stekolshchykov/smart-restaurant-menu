import { Image } from '../ui/Image.tsx'

export interface ProductGalleryThumbProps {
  src: string
  alt: string
  selected?: boolean
  onClick?: () => void
}

export function ProductGalleryThumb({
  src,
  alt,
  selected = false,
  onClick,
}: ProductGalleryThumbProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative overflow-hidden rounded-[var(--radius-md)] border-2 transition-all duration-[var(--transition-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] ${
        selected
          ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)] ring-offset-2 ring-offset-[var(--color-bg)]'
          : 'border-transparent opacity-80 hover:border-[var(--color-border-strong)] hover:opacity-100'
      }`}
    >
      <Image
        src={src}
        alt={alt}
        aspectRatio="square"
        className="h-full w-full transition-transform duration-500 group-hover:scale-105"
      />
    </button>
  )
}
