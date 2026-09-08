/** Circuit-tag colour palette (shared between canvas & properties panel). */
export const CIRCUIT_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
] as const

/** Deterministic colour for a free-text circuit tag. */
export function circuitTagColor(tag: string): string {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h)
  return CIRCUIT_PALETTE[Math.abs(h) % CIRCUIT_PALETTE.length]
}
