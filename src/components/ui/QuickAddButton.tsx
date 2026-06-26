import { Plus, ShoppingBag } from 'lucide-react'
import { IconButton } from './IconButton.tsx'

export interface QuickAddButtonProps {
  onClick: () => void
  label?: string
  className?: string
  icon?: 'plus' | 'cart'
}

export function QuickAddButton({
  onClick,
  label = 'Quick add',
  className = '',
  icon = 'plus',
}: QuickAddButtonProps) {
  return (
    <IconButton
      size="md"
      variant="primary"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
      className={`shadow-[var(--shadow-md)] ${className}`}
    >
      {icon === 'cart' ? (
        <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Plus className="h-5 w-5" aria-hidden="true" />
      )}
    </IconButton>
  )
}
