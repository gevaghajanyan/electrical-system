import type { SchemeNodeType, SchemeDef } from '../types/scheme'

export const SCHEME_DEFS: Record<SchemeNodeType, SchemeDef> = {
  switch_spst: {
    label: 'Switch (SPST)',
    description: 'Single-pole single-throw switch',
    width: 80,
    height: 48,
    color: '#1d4ed8',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'in', x: 0, y: 24 },
      { index: 1, label: 'out', x: 80, y: 24 },
    ],
  },
  lamp_230: {
    label: 'Lamp 230V',
    description: 'Incandescent lamp 230V',
    width: 64,
    height: 64,
    color: '#d97706',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'L', x: 32, y: 0 },
      { index: 1, label: 'N', x: 32, y: 64 },
    ],
  },
  led_220: {
    label: 'LED 220V',
    description: 'LED lamp 220V',
    width: 64,
    height: 64,
    color: '#059669',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: '+', x: 32, y: 0 },
      { index: 1, label: '-', x: 32, y: 64 },
    ],
  },
  transformer_sd: {
    label: 'Transformer',
    description: 'Step-down transformer',
    width: 128,
    height: 80,
    color: '#7c3aed',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'L1', x: 0, y: 24 },
      { index: 1, label: 'N1', x: 0, y: 56 },
      { index: 2, label: 'L2', x: 128, y: 24 },
      { index: 3, label: 'N2', x: 128, y: 56 },
    ],
  },
  power_ac: {
    label: 'AC Power',
    description: 'AC mains power inlet',
    width: 80,
    height: 64,
    color: '#dc2626',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'L', x: 20, y: 64 },
      { index: 1, label: 'N', x: 40, y: 64 },
      { index: 2, label: 'PE', x: 60, y: 64 },
    ],
  },
  junction: {
    label: 'Junction',
    description: 'Wire junction point',
    width: 16,
    height: 16,
    color: '#374151',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: '', x: 8, y: 0 },
      { index: 1, label: '', x: 16, y: 8 },
      { index: 2, label: '', x: 8, y: 16 },
      { index: 3, label: '', x: 0, y: 8 },
    ],
  },
  socket_outlet: {
    label: 'Socket 2P+E',
    description: 'Electrical socket (2P+E)',
    width: 72,
    height: 64,
    color: '#0891b2',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'L', x: 20, y: 64 },
      { index: 1, label: 'N', x: 36, y: 64 },
      { index: 2, label: 'PE', x: 52, y: 64 },
    ],
  },
  push_button: {
    label: 'Push Button',
    description: 'Momentary push button (NO)',
    width: 64,
    height: 48,
    color: '#0f766e',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'in', x: 0, y: 24 },
      { index: 1, label: 'out', x: 64, y: 24 },
    ],
  },
  switch_2way: {
    label: 'Switch 2-way',
    description: 'Two-way / staircase switch',
    width: 88,
    height: 56,
    color: '#7c3aed',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'C', x: 0, y: 28 },
      { index: 1, label: 'A', x: 88, y: 16 },
      { index: 2, label: 'B', x: 88, y: 40 },
    ],
  },
  motor: {
    label: 'Motor',
    description: 'Motor / pump load',
    width: 72,
    height: 72,
    color: '#b45309',
    textColor: '#ffffff',
    ports: [
      { index: 0, label: 'L', x: 20, y: 0 },
      { index: 1, label: 'N', x: 52, y: 0 },
      { index: 2, label: 'PE', x: 36, y: 72 },
    ],
  },
}

export const SCHEME_DEF_LIST = Object.entries(SCHEME_DEFS).map(([type, def]) => ({
  type: type as SchemeNodeType,
  ...def,
}))
