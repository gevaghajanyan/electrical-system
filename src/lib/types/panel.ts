export type ElementTypeId =
  | 'mcb_1p'
  | 'mcb_2p'
  | 'mcb_3p'
  | 'mcb_4p'
  | 'rcd_2p'
  | 'rcd_4p'
  | 'rcbo_1p'
  | 'rcbo_2p'
  | 'rcbo_4p'
  | 'isolator_1p'
  | 'isolator_2p'
  | 'isolator_3p'
  | 'isolator_4p'
  | 'main_switch_2p'
  | 'main_switch_4p'
  | 'cross_2p'
  | 'contactor_3p'
  | 'timer'
  | 'surge_protector'
  | 'neutral_bar'
  | 'earth_bar'
  | 'busbar_connector'
  | 'voltage_relay'
  | 'blank'

export type ElementCategory = 'protection' | 'switching' | 'distribution' | 'accessory'

export type Poles = 1 | 2 | 3 | 4

export type CurrentRating = 6 | 10 | 13 | 16 | 20 | 25 | 32 | 40 | 50 | 63 | 80 | 100 | 125

export type TripCurve = 'B' | 'C' | 'D'

export type RcdSensitivity = 10 | 30 | 100 | 300

export type RcdType = 'AC' | 'A' | 'F' | 'B'

export type Phase = 'L1' | 'L2' | 'L3' | 'N' | 'PE'

export type PortSide = 'top' | 'bottom'

export interface Port {
  id: string
  elementId: string
  side: PortSide
  index: number
  phase: Phase
}

export interface Connection {
  id: string
  fromPortId: string
  toPortId: string
  label: string
}

export interface McbProperties {
  kind: 'mcb'
  rating: CurrentRating
  curve: TripCurve
  breakingCapacity: number
}

export interface RcdProperties {
  kind: 'rcd'
  rating: CurrentRating
  sensitivity: RcdSensitivity
  type: RcdType
}

export interface RcboProperties {
  kind: 'rcbo'
  rating: CurrentRating
  curve: TripCurve
  sensitivity: RcdSensitivity
  type: RcdType
  breakingCapacity: number
}

export interface IsolatorProperties {
  kind: 'isolator'
  rating: CurrentRating
}

export interface VoltageRelayProperties {
  kind: 'voltage_relay'
  minVoltage: number
  maxVoltage: number
  delaySeconds: number
}

export interface GenericProperties {
  kind: 'generic'
  [key: string]: unknown
}

export type ElementProperties =
  | McbProperties
  | RcdProperties
  | RcboProperties
  | IsolatorProperties
  | VoltageRelayProperties
  | GenericProperties

export interface PanelElement {
  id: string
  typeId: ElementTypeId
  railId: string
  slotStart: number
  slotWidth: number
  label: string
  notes: string
  properties: ElementProperties
}

export interface Rail {
  id: string
  label: string
  slotCount: number
}

export interface Panel {
  id: string
  name: string
  description: string
  location: string
  voltage: 230 | 400
  frequency: 50 | 60
  rails: Rail[]
  elements: PanelElement[]
  connections: Connection[]
  createdAt: string
  updatedAt: string
}

export interface ValidationError {
  elementId?: string
  railId?: string
  message: string
  severity: 'error' | 'warning'
}
