import type { Panel, PanelElement, Rail } from '../types/panel'

/**
 * ─── Panel Templates ───────────────────────────────────────────────────────
 *
 * Five ready-made residential distribution boards, sized by apartment
 * "rooms" count (1..5). Layout follows common Armenia / Russia / Europe
 * residential practice:
 *
 *   ─ Master switch (2P Isolator 63–80 A) — the "master key"
 *   ─ Voltage relay — over/under-voltage protection for the whole panel
 *   ─ Non-disconnectable line — permanent MCB for fridge / WiFi / alarm
 *     (stays live even if any downstream RCD trips)
 *   ─ Dedicated stove line — 32 A MCB, 6 mm² cable
 *   ─ Dedicated air-conditioner line — 16 A MCB, 4 mm² cable
 *   ─ Per-area RCD groups (30 mA type A, 10 mA for bathrooms):
 *       ─ Sockets 16 A + Lights 10 A per room
 *   ─ Bathroom: 1 for 1–3 rooms, 2 for 4–5 rooms
 *   ─ Hallway: from 2 rooms upward
 *   ─ Cross module for L/N distribution when the panel gets busy (3+ rooms)
 *
 * Rails are auto-sized to a standard size (12/18/24/36/48) that comfortably
 * fits the elements without cramping.
 */

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

// ─── Element factory helpers (use a per-rail cursor for placement) ──────────

const cursors: Record<number, number> = {}
function place(railIndex: number, width: number): number {
  const c = cursors[railIndex] ?? 0
  cursors[railIndex] = c + width
  return c
}

function mcb(
  railIndex: number,
  rating: 6 | 10 | 13 | 16 | 20 | 25 | 32,
  label: string,
  curve: 'B' | 'C' | 'D' = 'C',
  circuitTag?: string,
): TemplateElement {
  return {
    railIndex,
    typeId: 'mcb_1p',
    slotStart: place(railIndex, 1),
    slotWidth: 1,
    label,
    notes: '',
    ...(circuitTag ? { circuitTag } : {}),
    properties: { kind: 'mcb', rating, curve, breakingCapacity: 6 },
  }
}

function rcd(
  railIndex: number,
  rating: 40 | 63,
  sensitivity: 10 | 30,
  label: string,
): TemplateElement {
  return {
    railIndex,
    typeId: 'rcd_2p',
    slotStart: place(railIndex, 2),
    slotWidth: 2,
    label,
    notes: sensitivity === 10 ? 'Bathroom / wet area · 10 mA' : 'Group RCD · 30 mA',
    properties: { kind: 'rcd', rating, sensitivity, type: 'A' },
  }
}

function masterSwitch(railIndex: number, rating: 63 | 80 | 100): TemplateElement {
  return {
    railIndex,
    typeId: 'main_switch_2p',
    slotStart: place(railIndex, 2),
    slotWidth: 2,
    label: `Master ${rating}A`,
    notes: 'Main isolator · master key',
    circuitTag: 'Input',
    properties: { kind: 'isolator', rating },
  }
}

function voltageRelay(railIndex: number): TemplateElement {
  return {
    railIndex,
    typeId: 'voltage_relay',
    slotStart: place(railIndex, 2),
    slotWidth: 2,
    label: 'Voltage Relay',
    notes: 'Over/under-voltage protection · 195–253 V',
    circuitTag: 'Input',
    properties: { kind: 'voltage_relay', minVoltage: 195, maxVoltage: 253, delaySeconds: 5 },
  }
}

function cross(railIndex: number): TemplateElement {
  return {
    railIndex,
    typeId: 'cross_2p',
    slotStart: place(railIndex, 4),
    slotWidth: 4,
    label: 'L / N cross',
    notes: 'Distribution — fans line & neutral to multiple circuits',
    properties: { kind: 'generic' },
  }
}

function neutralBar(railIndex: number): TemplateElement {
  return {
    railIndex,
    typeId: 'neutral_bar',
    slotStart: place(railIndex, 2),
    slotWidth: 2,
    label: 'N bar',
    notes: 'Neutral distribution bar',
    properties: { kind: 'generic' },
  }
}

// ─── Apartment builder ──────────────────────────────────────────────────────

interface Spec {
  id: string
  rooms: 1 | 2 | 3 | 4 | 5
  name: string
  icon: string
  description: string
}

/** Round a raw slot count up to the nearest standard rail size. */
function railSize(used: number): number {
  if (used <= 12) return 12
  if (used <= 18) return 18
  if (used <= 24) return 24
  if (used <= 36) return 36
  return 48
}

function buildApartment(spec: Spec): PanelTemplate {
  const { rooms } = spec
  const hasHallway = rooms >= 2
  const bathrooms = rooms >= 4 ? 2 : 1
  const useCross = rooms >= 3

  // Reset the per-rail cursors so successive builds are deterministic.
  cursors[0] = 0
  cursors[1] = 0
  cursors[2] = 0

  const elements: TemplateElement[] = []

  // ─── Rail 0: INPUT (main switch, relay, dedicated & non-disc. lines) ───
  elements.push(masterSwitch(0, rooms >= 4 ? 80 : 63))
  elements.push(voltageRelay(0))

  // Non-disconnectable — permanent MCB for essentials (bypasses group RCDs).
  elements.push({
    railIndex: 0,
    typeId: 'mcb_1p',
    slotStart: place(0, 1),
    slotWidth: 1,
    label: 'Fridge · WiFi',
    notes: 'Non-disconnectable — fridge, router, alarm, gas boiler',
    circuitTag: 'Essential',
    properties: { kind: 'mcb', rating: 16, curve: 'C', breakingCapacity: 6 },
  })

  // Dedicated kitchen stove — 32A / 6mm²
  elements.push({
    railIndex: 0,
    typeId: 'mcb_1p',
    slotStart: place(0, 1),
    slotWidth: 1,
    label: 'Stove 32A',
    notes: 'Kitchen electric stove · 6 mm² cable',
    circuitTag: 'Kitchen',
    properties: { kind: 'mcb', rating: 32, curve: 'C', breakingCapacity: 6 },
  })

  // Dedicated air-conditioner — 16A / 4mm²
  elements.push({
    railIndex: 0,
    typeId: 'mcb_1p',
    slotStart: place(0, 1),
    slotWidth: 1,
    label: 'A/C 16A',
    notes: 'Air conditioner · 4 mm² cable',
    circuitTag: 'HVAC',
    properties: { kind: 'mcb', rating: 16, curve: 'C', breakingCapacity: 6 },
  })

  // 4+ rooms → second air-conditioner
  if (rooms >= 4) {
    elements.push({
      railIndex: 0,
      typeId: 'mcb_1p',
      slotStart: place(0, 1),
      slotWidth: 1,
      label: 'A/C 2 · 16A',
      notes: 'Second air conditioner · 4 mm² cable',
      circuitTag: 'HVAC',
      properties: { kind: 'mcb', rating: 16, curve: 'C', breakingCapacity: 6 },
    })
  }

  // Neutral bar caps the input rail
  elements.push(neutralBar(0))

  // ─── Rail 1: ROOM & KITCHEN GROUPS ───
  const firstGroupSize = Math.min(rooms, 2)
  elements.push(rcd(1, 40, 30, `RCD Rooms 1–${firstGroupSize}`))
  for (let r = 1; r <= firstGroupSize; r++) {
    elements.push(mcb(1, 16, `Room ${r} sockets`, 'C', `Room ${r}`))
    elements.push(mcb(1, 10, `Room ${r} lights`,  'B', `Room ${r}`))
  }
  if (hasHallway) {
    elements.push(mcb(1, 10, 'Hallway light', 'B', 'Hallway'))
  }

  if (rooms >= 3) {
    elements.push(rcd(1, 40, 30, `RCD Rooms 3–${rooms}`))
    for (let r = 3; r <= rooms; r++) {
      elements.push(mcb(1, 16, `Room ${r} sockets`, 'C', `Room ${r}`))
      elements.push(mcb(1, 10, `Room ${r} lights`,  'B', `Room ${r}`))
    }
  }

  // Kitchen — its own RCD (dishwasher / dish drier are wet-area appliances)
  elements.push(rcd(1, 40, 30, 'RCD Kitchen'))
  elements.push(mcb(1, 16, 'Kitchen sockets', 'C', 'Kitchen'))
  elements.push(mcb(1, 10, 'Kitchen lights',  'B', 'Kitchen'))

  // ─── Rail 2: BATH & CROSS ───
  for (let b = 1; b <= bathrooms; b++) {
    const suffix = bathrooms > 1 ? ` ${b}` : ''
    elements.push(rcd(2, 40, 10, `RCD Bath${suffix}`))
    elements.push(mcb(2, 16, `Bath${suffix} sockets`, 'C', `Bath${suffix}`))
    elements.push(mcb(2, 10, `Bath${suffix} lights`,  'B', `Bath${suffix}`))
  }
  if (useCross) {
    elements.push(cross(2))
  }

  // Real DIN cabinets ship with all rails the same width. Size every rail to
  // the standard size that fits the busiest rail — matches how enclosures are
  // actually built and sold.
  const maxUsed = Math.max(cursors[0], cursors[1], cursors[2])
  const uniformSize = railSize(maxUsed)

  const rails: Omit<Rail, 'id'>[] = [
    { label: 'Input',  slotCount: uniformSize },
    { label: 'Groups', slotCount: uniformSize },
  ]
  if (cursors[2] > 0) {
    rails.push({
      label: bathrooms > 1 ? 'Bath & Cross' : 'Bath',
      slotCount: uniformSize,
    })
  }

  return {
    id: spec.id,
    name: spec.name,
    description: spec.description,
    icon: spec.icon,
    rails,
    elements,
  }
}

// ─── Specs → generated templates ────────────────────────────────────────────

const APARTMENT_SPECS: Spec[] = [
  {
    id: 'tpl_apartment_1room',
    rooms: 1,
    name: '1-room apartment',
    icon: '🏠',
    description: 'Studio: 1 room + kitchen + bathroom · master + relay + non-disc. + stove + A/C',
  },
  {
    id: 'tpl_apartment_2room',
    rooms: 2,
    name: '2-room apartment',
    icon: '🏘',
    description: '2 rooms + kitchen + hallway + bathroom · full protection with RCD groups',
  },
  {
    id: 'tpl_apartment_3room',
    rooms: 3,
    name: '3-room apartment',
    icon: '🏡',
    description: '3 rooms + kitchen + hallway + bathroom · cross module for line distribution',
  },
  {
    id: 'tpl_apartment_4room',
    rooms: 4,
    name: '4-room apartment',
    icon: '🏛',
    description: '4 rooms + kitchen + hallway + 2 bathrooms · 80A master, dual A/C, cross module',
  },
  {
    id: 'tpl_apartment_5room',
    rooms: 5,
    name: '5-room apartment',
    icon: '🏰',
    description: '5 rooms + kitchen + hallway + 2 bathrooms · large panel with full segregation',
  },
]

export const PANEL_TEMPLATES: PanelTemplate[] = APARTMENT_SPECS.map(buildApartment)

// ─── Panel materialiser (used by the "New Panel" modal) ─────────────────────

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function createPanelFromTemplate(
  template: PanelTemplate,
  panelName: string,
  voltage: 230 | 400,
  frequency: 50 | 60,
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
    ...(e.circuitTag ? { circuitTag: e.circuitTag } : {}),
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
