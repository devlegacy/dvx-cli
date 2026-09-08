const UNITS = [
  'B',
  'KB',
  'MB',
  'GB',
] as const

export const formatBytes = (bytes: number) => {
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < UNITS.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${unit === 0 ? value : value.toFixed(1)} ${UNITS[unit]}`
}

export const formatSizeDelta = (bytesIn: number, bytesOut: number) => {
  const percent = bytesIn > 0 ? Math.round((1 - bytesOut / bytesIn) * 100) : 0
  const change = percent >= 0 ? `−${percent}%` : `+${-percent}%`
  return `${formatBytes(bytesIn)} → ${formatBytes(bytesOut)} (${change})`
}
