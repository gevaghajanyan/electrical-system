import type { PanelElement, Rail } from '../types/panel'

export function getElementsOnRail(elements: PanelElement[], railId: string): PanelElement[] {
  return elements.filter((e) => e.railId === railId)
}

export function getOccupiedSlots(elements: PanelElement[], railId: string): Set<number> {
  const occupied = new Set<number>()
  for (const el of elements) {
    if (el.railId !== railId) continue
    for (let i = el.slotStart; i < el.slotStart + el.slotWidth; i++) {
      occupied.add(i)
    }
  }
  return occupied
}

export function hasSlotCollision(
  elements: PanelElement[],
  railId: string,
  slotStart: number,
  slotWidth: number,
  excludeId?: string
): boolean {
  for (const el of elements) {
    if (el.railId !== railId) continue
    if (el.id === excludeId) continue
    const elEnd = el.slotStart + el.slotWidth
    const newEnd = slotStart + slotWidth
    if (slotStart < elEnd && newEnd > el.slotStart) return true
  }
  return false
}

export function isWithinRail(rail: Rail, slotStart: number, slotWidth: number): boolean {
  return slotStart >= 0 && slotStart + slotWidth <= rail.slotCount
}

export function findFirstAvailableSlot(
  elements: PanelElement[],
  rail: Rail,
  slotWidth: number
): number | null {
  for (let start = 0; start <= rail.slotCount - slotWidth; start++) {
    if (!hasSlotCollision(elements, rail.id, start, slotWidth)) return start
  }
  return null
}

export function sortedElementsOnRail(elements: PanelElement[], railId: string): PanelElement[] {
  return getElementsOnRail(elements, railId).sort((a, b) => a.slotStart - b.slotStart)
}
