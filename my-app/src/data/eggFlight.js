export function getEggFlightPoint(from, to, progress, arcHeight) {
  const t = Math.max(0, Math.min(1, progress))
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t - 4 * arcHeight * t * (1 - t),
  }
}
