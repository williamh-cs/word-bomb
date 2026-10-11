export function getCountdownLabel(startedAt, now) {
  if (!Number.isFinite(startedAt)) return null
  const elapsed = Math.max(0, now - startedAt)
  if (elapsed < 1000) return 'Ready'
  if (elapsed < 2000) return '3'
  if (elapsed < 3000) return '2'
  if (elapsed < 4000) return '1'
  return null
}
