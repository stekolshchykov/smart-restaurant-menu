export interface SkipToContentProps {
  target?: string
  children?: string
}

export function SkipToContent({
  target = '#main-content',
  children = 'Skip to content',
}: SkipToContentProps) {
  return (
    <a
      href={target}
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--radius-lg)] focus:bg-[var(--color-accent)] focus:px-4 focus:py-3 focus:text-[var(--color-surface)] focus:shadow-[var(--shadow-lg)]"
    >
      {children}
    </a>
  )
}
