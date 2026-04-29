export function formatVND(value: number): string {
  return Math.round(value).toLocaleString('vi-VN') + ' ₫'
}

export function formatPct(value: number): string {
  return (value >= 0 ? '+' : '') + value.toFixed(2) + '%'
}
