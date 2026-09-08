import type { Panel, PanelElement, Rail } from '../types/panel'

interface TemplateElement extends Omit<PanelElement, 'id' | 'railId'> {
  railIndex: number
}

interface PanelTemplate {
  id: string
  name: string
  description: string
  icon: string
  rails: Omit<Rail, 'id'>[]
  elements: TemplateElement[]
}

export const PANEL_TEMPLATES: PanelTemplate[] = [
  {
    id: 'tpl_residential_24',
    name: 'Basic Residential',
    description: '24-slot consumer unit with main switch, RCD, and 8 MCBs',
    icon: '🏠',
    rails: [{ label: 'Main Rail', slotCount: 24 }],
    elements: [
      { railIndex: 0, typeId: 'main_switch_2p', slotStart: 0, slotWidth: 2, label: 'Main', notes: '', properties: { kind: 'isolator', rating: 100 } },
      { railIndex: 0, typeId: 'rcd_2p', slotStart: 2, slotWidth: 2, label: 'RCD', notes: '', properties: { kind: 'rcd', rating: 63, sensitivity: 30, type: 'A' } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 4, slotWidth: 1, label: 'Lighting 1', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 5, slotWidth: 1, label: 'Lighting 2', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 6, slotWidth: 1, label: 'Ring 1', notes: '', properties: { kind: 'mcb', rating: 32, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 7, slotWidth: 1, label: 'Ring 2', notes: '', properties: { kind: 'mcb', rating: 32, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 8, slotWidth: 1, label: 'Cooker', notes: '', properties: { kind: 'mcb', rating: 40, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 9, slotWidth: 1, label: 'Shower', notes: '', properties: { kind: 'mcb', rating: 40, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 10, slotWidth: 1, label: 'Garage', notes: '', properties: { kind: 'mcb', rating: 16, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 11, slotWidth: 1, label: 'Spare', notes: '', properties: { kind: 'mcb', rating: 16, curve: 'B', breakingCapacity: 6 } },
    ],
  },
  {
    id: 'tpl_lighting_circuit',
    name: 'Lighting Circuit',
    description: '2-rail lighting panel with RCBOs for individual protection',
    icon: '💡',
    rails: [
      { label: 'Ground Floor', slotCount: 12 },
      { label: 'First Floor', slotCount: 12 },
    ],
    elements: [
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 0, slotWidth: 1, label: 'Hall', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 1, slotWidth: 1, label: 'Lounge', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 2, slotWidth: 1, label: 'Kitchen', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'mcb_1p', slotStart: 3, slotWidth: 1, label: 'Dining', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 1, typeId: 'mcb_1p', slotStart: 0, slotWidth: 1, label: 'Bedroom 1', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 1, typeId: 'mcb_1p', slotStart: 1, slotWidth: 1, label: 'Bedroom 2', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 1, typeId: 'mcb_1p', slotStart: 2, slotWidth: 1, label: 'Bathroom', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
      { railIndex: 1, typeId: 'mcb_1p', slotStart: 3, slotWidth: 1, label: 'Landing', notes: '', properties: { kind: 'mcb', rating: 6, curve: 'B', breakingCapacity: 6 } },
    ],
  },
  {
    id: 'tpl_3phase',
    name: '3-Phase Distribution',
    description: 'Three-phase panel with 4-pole main switch and 3-pole MCBs',
    icon: '⚡',
    rails: [{ label: 'Main Rail', slotCount: 36 }],
    elements: [
      { railIndex: 0, typeId: 'main_switch_4p', slotStart: 0, slotWidth: 4, label: 'Main', notes: '', properties: { kind: 'isolator', rating: 125 } },
      { railIndex: 0, typeId: 'mcb_3p', slotStart: 4, slotWidth: 3, label: 'Motor 1', notes: '', properties: { kind: 'mcb', rating: 16, curve: 'D', breakingCapacity: 10 } },
      { railIndex: 0, typeId: 'mcb_3p', slotStart: 7, slotWidth: 3, label: 'Motor 2', notes: '', properties: { kind: 'mcb', rating: 16, curve: 'D', breakingCapacity: 10 } },
      { railIndex: 0, typeId: 'mcb_3p', slotStart: 10, slotWidth: 3, label: 'HVAC', notes: '', properties: { kind: 'mcb', rating: 32, curve: 'C', breakingCapacity: 10 } },
      { railIndex: 0, typeId: 'mcb_3p', slotStart: 13, slotWidth: 3, label: 'Power', notes: '', properties: { kind: 'mcb', rating: 32, curve: 'C', breakingCapacity: 10 } },
    ],
  },
  {
    id: 'tpl_small_office',
    name: 'Small Office',
    description: 'Office consumer unit with surge protection and RCBOs',
    icon: '🏢',
    rails: [{ label: 'Office Rail', slotCount: 18 }],
    elements: [
      { railIndex: 0, typeId: 'main_switch_2p', slotStart: 0, slotWidth: 2, label: 'Isolator', notes: '', properties: { kind: 'isolator', rating: 63 } },
      { railIndex: 0, typeId: 'surge_protector', slotStart: 2, slotWidth: 1, label: 'SPD', notes: '', properties: { kind: 'generic' } },
      { railIndex: 0, typeId: 'rcbo_1p', slotStart: 3, slotWidth: 2, label: 'Sockets', notes: '', properties: { kind: 'rcbo', rating: 20, curve: 'B', sensitivity: 30, type: 'A', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'rcbo_1p', slotStart: 5, slotWidth: 2, label: 'Lighting', notes: '', properties: { kind: 'rcbo', rating: 10, curve: 'B', sensitivity: 30, type: 'A', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'rcbo_1p', slotStart: 7, slotWidth: 2, label: 'Server', notes: '', properties: { kind: 'rcbo', rating: 16, curve: 'C', sensitivity: 30, type: 'A', breakingCapacity: 6 } },
      { railIndex: 0, typeId: 'rcbo_1p', slotStart: 9, slotWidth: 2, label: 'A/C', notes: '', properties: { kind: 'rcbo', rating: 16, curve: 'C', sensitivity: 30, type: 'A', breakingCapacity: 6 } },
    ],
  },
]

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function createPanelFromTemplate(
  template: PanelTemplate,
  panelName: string,
  voltage: 230 | 400,
  frequency: 50 | 60
): Omit<Panel, 'createdAt' | 'updatedAt'> {
  const rails: Rail[] = template.rails.map((r) => ({ ...r, id: uid() }))

  const elements: PanelElement[] = template.elements.map((e) => ({
    id: uid(),
    typeId: e.typeId,
    railId: rails[e.railIndex]?.id ?? rails[0].id,
    slotStart: e.slotStart,
    slotWidth: e.slotWidth,
    label: e.label,
    notes: e.notes,
    properties: { ...e.properties },
  }))

  return {
    id: uid(),
    name: panelName,
    description: template.description,
    location: '',
    notes: '',
    voltage,
    frequency,
    rails,
    elements,
    connections: [],
    annotations: [],
    inputCables: [],
  }
}
