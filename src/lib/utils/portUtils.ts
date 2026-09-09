import type { PanelElement, Phase, PortSide } from '../types/panel'
import type { ElementDef } from '../constants/elementDefs'
import {
  SLOT_WIDTH_PX, ELEMENT_HEIGHT_PX, RAIL_ROW_HEIGHT_PX,
  PANEL_PADDING_PX, SLOT_GAP, ELEMENT_TOP_Y,
} from '../constants/canvasLayout'

export function phasesForPoles(poles: number): Phase[] {
  if (poles === 0) return []
  if (poles === 1) return ['L1']
  if (poles === 2) return ['L1', 'N']
  if (poles === 3) return ['L1', 'L2', 'L3']
  return ['L1', 'L2', 'L3', 'N']
}

/**
 * Distribution bars (neutral_bar / earth_bar) have `poles: 0` for legacy
 * reasons but still need a single phase-tagged port so RCD/RCBO neutrals
 * can be terminated onto them in wiring.
 */
export function phasesForDef(def: ElementDef): Phase[] {
  if (def.id === 'neutral_bar') return ['N']
  if (def.id === 'earth_bar') return ['PE']
  return phasesForPoles(def.poles)
}

/** portId format: "elementId:side:phase" e.g. "abc:top:L1" */
export function getPortId(elementId: string, side: PortSide, phase: Phase): string {
  return `${elementId}:${side}:${phase}`
}

export function parsePortId(portId: string): { elementId: string; side: PortSide; phase: Phase } | null {
  const lastColon = portId.lastIndexOf(':')
  const secondLastColon = portId.lastIndexOf(':', lastColon - 1)
  if (lastColon === -1 || secondLastColon === -1) return null
  const phase = portId.slice(lastColon + 1) as Phase
  const side = portId.slice(secondLastColon + 1, lastColon) as PortSide
  const elementId = portId.slice(0, secondLastColon)
  if (side !== 'top' && side !== 'bottom') return null
  return { elementId, side, phase }
}

export function phaseLabel(phase: Phase): string {
  return phase === 'L1' ? 'L' : phase
}

export function phaseColor(phase: Phase): string {
  const colors: Record<Phase, string> = {
    L1: '#92400e',
    L2: '#1c1917',
    L3: '#71717a',
    N:  '#1e3a8a',
    PE: '#166534',
  }
  return colors[phase]
}

export interface RelativePort {
  portId: string
  phase: Phase
  side: PortSide
  relX: number
  relY: number
}

/** Returns port positions relative to the element Group's top-left corner. */
export function getRelativePorts(element: PanelElement, def: ElementDef): RelativePort[] {
  const phases = phasesForDef(def)
  if (phases.length === 0) return []
  const w = element.slotWidth * SLOT_WIDTH_PX - SLOT_GAP
  const ports: RelativePort[] = []
  for (const side of ['top', 'bottom'] as PortSide[]) {
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i]
      ports.push({
        portId: getPortId(element.id, side, phase),
        phase,
        side,
        relX: (w / phases.length) * (i + 0.5),
        relY: side === 'top' ? 0 : ELEMENT_HEIGHT_PX,
      })
    }
  }
  return ports
}

export interface PortPosition {
  x: number
  y: number
  portId: string
  phase: Phase
}

/** Absolute port positions in panel content space. Scale applies only to slot/element widths (for canvasRenderer). */
export function getPortPositions(
  element: PanelElement,
  def: ElementDef,
  railIndex: number,
  scale: number,
): PortPosition[] {
  const phases = phasesForDef(def)
  if (phases.length === 0) return []

  const railY = PANEL_PADDING_PX + railIndex * RAIL_ROW_HEIGHT_PX
  const elemX = PANEL_PADDING_PX + element.slotStart * SLOT_WIDTH_PX * scale
  const elemW = element.slotWidth * SLOT_WIDTH_PX * scale - SLOT_GAP
  const elemY = railY + ELEMENT_TOP_Y

  const positions: PortPosition[] = []
  for (const side of ['top', 'bottom'] as PortSide[]) {
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i]
      positions.push({
        x: elemX + (elemW / phases.length) * (i + 0.5),
        y: side === 'top' ? elemY : elemY + ELEMENT_HEIGHT_PX,
        portId: getPortId(element.id, side, phase),
        phase,
      })
    }
  }
  return positions
}
