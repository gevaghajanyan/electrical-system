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
  | 'contactor_2p'
  | 'contactor_3p'
  | 'contactor_4p'
  | 'timer'
  | 'surge_protector'
  | 'neutral_bar'
  | 'earth_bar'
  | 'busbar_connector'
  | 'voltage_relay'
  | 'kwh_meter'
  | 'signal_lamp'
  | 'modular_socket'
  | 'push_button'
  | 'motor_starter'
  | 'buzzer'
  | 'dimmer'
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

export type ContactorPoles = 2 | 3 | 4
export type CoilVoltage = 12 | 24 | 110 | 230 | 400

export interface ContactorProperties {
  kind: 'contactor'
  rating: CurrentRating
  coilVoltage: CoilVoltage
  poles: ContactorPoles
  auxContacts?: number
}

export type SpdType = 'T1' | 'T2' | 'T3' | 'T1+T2' | 'T2+T3'

export interface SurgeProtectorProperties {
  kind: 'surge_protector'
  type: SpdType
  /** Nominal discharge current (kA) */
  nominalCurrent: number
  /** Voltage protection level (kV) */
  protectionLevel: number
  /** Maximum continuous operating voltage (V) */
  maxOperatingVoltage: number
}

export type TimerMode = 'astronomical' | 'weekly' | 'countdown' | 'staircase'

export interface TimerProperties {
  kind: 'timer'
  mode: TimerMode
  /** Rated switching current (A) */
  rating: CurrentRating
}

export interface MeterProperties {
  kind: 'meter'
  /** Rated current (A) */
  rating: CurrentRating
  /** true = three-phase 400V, false = single-phase 230V */
  threePhase: boolean
  /** MID class B, C, D */
  midClass?: 'B' | 'C' | 'D'
}

export type LampColor = 'red' | 'green' | 'amber' | 'blue' | 'white'

export interface SignalLampProperties {
  kind: 'signal_lamp'
  color: LampColor
  voltage: 24 | 230 | 400
}

export interface SocketProperties {
  kind: 'socket'
  rating: 10 | 16
  /** Schuko / French / IEC 60309 blue */
  standard: 'schuko' | 'fr' | 'iec_blue'
}

export interface ButtonProperties {
  kind: 'button'
  variant: 'push' | 'toggle' | 'emergency_stop'
  color: LampColor
}

export interface MotorStarterProperties {
  kind: 'motor_starter'
  /** Rated current (A) */
  rating: CurrentRating
  /** Motor power kW */
  powerKw: number
  overloadClass: '10A' | '10' | '20' | '30'
}

export interface BuzzerProperties {
  kind: 'buzzer'
  voltage: 12 | 24 | 230
}

export type DimmerLoad = 'incandescent' | 'halogen' | 'led' | 'universal'

export interface DimmerProperties {
  kind: 'dimmer'
  /** Rated load current (A) */
  rating: CurrentRating
  /** Maximum load in watts */
  maxWatts: number
  /** Compatible load type */
  loadType: DimmerLoad
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
  | ContactorProperties
  | SurgeProtectorProperties
  | TimerProperties
  | MeterProperties
  | SignalLampProperties
  | SocketProperties
  | ButtonProperties
  | MotorStarterProperties
  | BuzzerProperties
  | DimmerProperties
  | GenericProperties

export type ConductorType = 'L' | 'L1' | 'L2' | 'L3' | 'N' | 'PE'
export type CableCrossSection = 1.5 | 2.5 | 4 | 6 | 10 | 16

export interface CableInput {
  id: string
  conductor: ConductorType
  crossSection: CableCrossSection
  description: string
}

export interface PanelElement {
  id: string
  typeId: ElementTypeId
  railId: string
  slotStart: number
  slotWidth: number
  label: string
  notes: string
  circuitTag?: string
  phase?: 'L1' | 'L2' | 'L3'
  properties: ElementProperties
}

export interface Rail {
  id: string
  label: string
  slotCount: number
}

export interface Annotation {
  id: string
  x: number
  y: number
  text: string
}

export interface Panel {
  id: string
  name: string
  description: string
  location: string
  notes: string
  voltage: 230 | 400
  frequency: 50 | 60
  rails: Rail[]
  elements: PanelElement[]
  connections: Connection[]
  annotations: Annotation[]
  inputCables: CableInput[]
  createdAt: string
  updatedAt: string
}

export interface ValidationError {
  elementId?: string
  railId?: string
  message: string
  severity: 'error' | 'warning'
}
