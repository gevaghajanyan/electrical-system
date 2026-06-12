import type { Panel, PanelElement, ValidationError } from '../types/panel'
import { ELEMENT_DEFS_MAP } from '../constants/elementDefs'
import { hasSlotCollision, isWithinRail } from './slotUtils'
import { parsePortId } from './portUtils'

export function validateElement(element: PanelElement, panel: Panel): ValidationError[] {
  const errors: ValidationError[] = []
  const def = ELEMENT_DEFS_MAP.get(element.typeId)

  if (!def) {
    errors.push({ elementId: element.id, message: `Unknown element type: ${element.typeId}`, severity: 'error' })
    return errors
  }

  const rail = panel.rails.find((r) => r.id === element.railId)
  if (!rail) {
    errors.push({ elementId: element.id, message: 'Element references a non-existent rail', severity: 'error' })
    return errors
  }

  if (!isWithinRail(rail, element.slotStart, element.slotWidth)) {
    errors.push({
      elementId: element.id,
      message: `Element "${element.label || def.label}" exceeds rail bounds`,
      severity: 'error',
    })
  }

  if (
    hasSlotCollision(panel.elements, element.railId, element.slotStart, element.slotWidth, element.id)
  ) {
    errors.push({
      elementId: element.id,
      message: `Element "${element.label || def.label}" overlaps another element`,
      severity: 'error',
    })
  }

  return errors
}

export function validateConnections(panel: Panel): ValidationError[] {
  const errors: ValidationError[] = []
  const elementIds = new Set(panel.elements.map((e) => e.id))

  for (const conn of panel.connections) {
    const from = parsePortId(conn.fromPortId)
    const to = parsePortId(conn.toPortId)

    if (!from || !to) {
      errors.push({ message: `Invalid connection port IDs: ${conn.id}`, severity: 'error' })
      continue
    }
    if (!elementIds.has(from.elementId)) {
      errors.push({ message: `Connection references missing element: ${from.elementId}`, severity: 'error' })
    }
    if (!elementIds.has(to.elementId)) {
      errors.push({ message: `Connection references missing element: ${to.elementId}`, severity: 'error' })
    }
    if (from.elementId === to.elementId) {
      errors.push({ message: 'Connection between ports on the same element', severity: 'warning' })
    }
  }

  return errors
}

export function validatePanel(panel: Panel): ValidationError[] {
  const errors: ValidationError[] = []

  if (!panel.name.trim()) {
    errors.push({ message: 'Panel name is required', severity: 'error' })
  }

  if (panel.rails.length === 0) {
    errors.push({ message: 'Panel has no rails', severity: 'warning' })
  }

  for (const rail of panel.rails) {
    if (rail.slotCount < 1 || rail.slotCount > 120) {
      errors.push({ railId: rail.id, message: `Rail "${rail.label}" has invalid slot count`, severity: 'error' })
    }
  }

  for (const element of panel.elements) {
    errors.push(...validateElement(element, panel))
  }

  errors.push(...validateConnections(panel))

  return errors
}

export function hasErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.severity === 'error')
}

export function groupErrorsByElement(errors: ValidationError[]): Map<string, ValidationError[]> {
  const map = new Map<string, ValidationError[]>()
  for (const err of errors) {
    const key = err.elementId ?? '__panel__'
    const list = map.get(key) ?? []
    list.push(err)
    map.set(key, list)
  }
  return map
}
