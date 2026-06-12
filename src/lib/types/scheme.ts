export type SchemeNodeType =
  | 'switch_spst'
  | 'lamp_230'
  | 'led_220'
  | 'transformer_sd'
  | 'power_ac'
  | 'junction'

export interface SchemePort {
  index: number
  label: string
  x: number  // relative to node top-left
  y: number
}

export interface SchemeDef {
  label: string
  description: string
  width: number
  height: number
  color: string
  textColor: string
  ports: SchemePort[]
}

export interface SchemeNode {
  id: string
  type: SchemeNodeType
  x: number
  y: number
  label: string
}

export interface SchemeWire {
  id: string
  fromNodeId: string
  fromPortIndex: number
  toNodeId: string
  toPortIndex: number
  label: string
}

export interface Scheme {
  id: string
  name: string
  description: string
  nodes: SchemeNode[]
  wires: SchemeWire[]
  createdAt: string
  updatedAt: string
}
