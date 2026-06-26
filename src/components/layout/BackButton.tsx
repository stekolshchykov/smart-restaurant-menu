import { ArrowLeft } from 'lucide-react'
import { Button } from '../ui/Button'

export interface BackButtonProps {
  onClick: () => void
  label?: string
}

export function BackButton({ onClick, label = 'Back to menu' }: BackButtonProps) {
  return (
    <Button
      variant="ghost-inverse"
      size="md"
      onClick={onClick}
      iconLeft={<ArrowLeft className="h-4 w-4" />}
      className="px-1"
    >
      {label}
    </Button>
  )
}
