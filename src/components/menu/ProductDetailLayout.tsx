import type { ReactNode } from 'react'

export interface ProductDetailLayoutProps {
  visual: ReactNode
  info: ReactNode
}

export function ProductDetailLayout({ visual, info }: ProductDetailLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8 lg:min-h-[calc(100svh-var(--header-total-height)-var(--footer-total-height)-1rem)]">
      <div className="lg:sticky lg:top-[calc(var(--header-total-height)+1rem)] lg:max-h-[calc(100svh-var(--header-total-height)-var(--footer-total-height)-1rem)] lg:self-start lg:overflow-y-auto scrollbar-hide">
        {visual}
      </div>
      <div className="flex w-full flex-col">
        {info}
      </div>
    </div>
  )
}
