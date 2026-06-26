import { Clock } from 'lucide-react'
import { Badge } from '../ui/Badge.tsx'

export interface PrepTimeBadgeProps {
  minutes: number
}

export function PrepTimeBadge({ minutes }: PrepTimeBadgeProps) {
  if (!minutes || minutes <= 0) return null

  return (
    <Badge variant="outline" className="h-7 gap-1 px-2.5">
      <Clock className="h-3.5 w-3.5" />
      <span>{minutes} min</span>
    </Badge>
  )
}
