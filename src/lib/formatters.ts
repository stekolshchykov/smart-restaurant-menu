export function formatCurrency(value: number): string {
  return `€${value.toFixed(2)}`
}

export function formatTimeMMSS(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function formatOrderNumber(orderId: string): string {
  return orderId.slice(-6).toUpperCase()
}
