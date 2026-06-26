import type { ReactNode } from 'react'

export interface ProductDetailLayoutProps {
  visual: ReactNode
  info: ReactNode
}

export function ProductDetailLayout({ visual, info }: ProductDetailLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
      <div className="lg:sticky lg:top-[calc(var(--header-total-height)+1rem)] lg:self-start">
        {visual}
      </div>
      {info}
    </div>
  )
}
