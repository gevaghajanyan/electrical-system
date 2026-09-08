'use client'

import type { ReactNode } from 'react'
import { Group, Rect, Circle, Line, Text } from 'react-konva'
import type { SymbolId } from '@/lib/constants/elementDefs'
import type { ElementProperties, LampColor } from '@/lib/types/panel'
import {
  DeviceTerminals, ToggleHandle, LedIndicator, LcdDisplay,
  StatusWindow, TestButton, LampDome, ButtonCap, Silkscreen,
} from './primitives'

export interface SymbolProps {
  /** center x within the element body */
  cx: number
  /** center y within the element body */
  cy: number
  /** body width in px */
  w: number
  /** body height in px */
  h: number
  /** foreground colour (used for silkscreen / text) */
  tc: string
  /** background/plastic colour of the element body */
  bg: string
  /** typed properties for showing rating/label details on the face */
  props: ElementProperties
}

type SymbolRenderer = (p: SymbolProps) => ReactNode

const OP = 0.6
const LAMP_HEX: Record<LampColor, string> = {
  red: '#ef4444',
  green: '#22c55e',
  amber: '#f59e0b',
  blue: '#3b82f6',
  white: '#f8fafc',
}

// ─────────────────────────────────────────────────────────────────────────────
// Protection devices
// ─────────────────────────────────────────────────────────────────────────────

const McbSymbol: SymbolRenderer = ({ w, h, tc, bg, props }) => {
  const cx = w / 2
  const spec = props.kind === 'mcb'
    ? `${props.curve}${props.rating}`
    : props.kind === 'rcbo' ? `${props.curve}${props.rating}` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Recessed rating window */}
      <Rect x={cx - 10} y={h / 2 - 12} width={20} height={11} cornerRadius={2}
            fill="#0f172a" opacity={0.35} />
      {spec && (
        <Silkscreen x={cx - 10} y={h / 2 - 10} w={20} text={spec} fontSize={8} color="#ffffff" opacity={0.95} />
      )}
      {/* Toggle handle */}
      <ToggleHandle cx={cx} cy={h / 2 + 8} on={true} faceBg={bg} />
    </Group>
  )
}

const RcdSymbol: SymbolRenderer = ({ w, h, tc, bg, props }) => {
  const cx = w / 2
  const sensitivity = props.kind === 'rcd' ? `${props.sensitivity}mA` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Rating window */}
      <Rect x={cx - 12} y={h / 2 - 13} width={24} height={10} cornerRadius={2}
            fill="#0f172a" opacity={0.35} />
      {sensitivity && (
        <Silkscreen x={cx - 12} y={h / 2 - 11} w={24} text={sensitivity} fontSize={7} color="#ffffff" opacity={0.95} />
      )}
      {/* Test button — the RCD signature */}
      <TestButton x={cx + w / 4 - 2} y={h / 2 + 5} color="#facc15" />
      {/* Reset toggle */}
      <ToggleHandle cx={cx - w / 4 + 2} cy={h / 2 + 8} on={true} faceBg={bg} />
    </Group>
  )
}

const RcboSymbol: SymbolRenderer = ({ w, h, tc, bg, props }) => {
  const cx = w / 2
  const spec = props.kind === 'rcbo' ? `${props.curve}${props.rating}` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      <Rect x={cx - 10} y={h / 2 - 13} width={20} height={10} cornerRadius={2}
            fill="#0f172a" opacity={0.35} />
      {spec && (
        <Silkscreen x={cx - 10} y={h / 2 - 11} w={20} text={spec} fontSize={7} color="#ffffff" opacity={0.95} />
      )}
      {/* Small test button top-right */}
      <TestButton x={cx + 8} y={h / 2 + 8} r={2.5} color="#facc15" />
      <ToggleHandle cx={cx - 3} cy={h / 2 + 8} on={true} faceBg={bg} />
    </Group>
  )
}

const IsolatorSymbol: SymbolRenderer = ({ w, h, bg, props }) => {
  const cx = w / 2
  const rating = props.kind === 'isolator' ? `${props.rating}A` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Big red isolation handle */}
      <ToggleHandle cx={cx} cy={h / 2 + 4} on={true} faceBg={bg} handleColor="#dc2626" />
      {rating && (
        <Silkscreen x={0} y={h / 2 - 14} w={w} text={rating} fontSize={7} color="#ffffff" opacity={0.9} />
      )}
    </Group>
  )
}

const MainSwitchSymbol: SymbolRenderer = ({ w, h, bg, props }) => {
  const cx = w / 2
  const rating = props.kind === 'isolator' ? `${props.rating}A` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Large red rotary-style handle */}
      <Rect x={cx - 12} y={h / 2 - 8} width={24} height={22} cornerRadius={4}
            fill="#7f1d1d" opacity={0.5} />
      <Circle x={cx} y={h / 2 + 3} radius={9}
              fillRadialGradientStartPoint={{ x: -3, y: -3 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={9}
              fillRadialGradientColorStops={[0, '#fca5a5', 0.5, '#dc2626', 1, '#7f1d1d']} />
      <Line points={[cx, h / 2 - 3, cx, h / 2 + 9]} stroke="#fef2f2" strokeWidth={2} lineCap="round" />
      {rating && <Silkscreen x={0} y={h - 12} w={w} text={rating} fontSize={7} color="#ffffff" opacity={0.9} />}
    </Group>
  )
}

const MotorStarterSymbol: SymbolRenderer = ({ w, h, bg, props }) => {
  const cx = w / 2
  const spec = props.kind === 'motor_starter' ? `${props.rating}A` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* M badge */}
      <Circle x={cx} y={h / 2 - 3} radius={7} stroke="#f8fafc" strokeWidth={1} fill="rgba(0,0,0,0.4)" />
      <Text text="M" x={cx - 4} y={h / 2 - 8} width={8} fontSize={10} fontStyle="bold" fill="#f8fafc" align="center" />
      {/* Rotary set knob */}
      <Circle x={cx} y={h / 2 + 10} radius={4.5} fill="#111827" stroke="#f8fafc" strokeWidth={0.6} />
      <Line points={[cx, h / 2 + 6, cx, h / 2 + 10]} stroke="#f8fafc" strokeWidth={1} lineCap="round" />
      {spec && <Silkscreen x={0} y={h - 12} w={w} text={spec} fontSize={7} color="#ffffff" opacity={0.9} />}
    </Group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Switching / control
// ─────────────────────────────────────────────────────────────────────────────

const ContactorSymbol: SymbolRenderer = ({ w, h, bg, props }) => {
  const cx = w / 2
  const spec = props.kind === 'contactor' ? `${props.rating}A` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Coil housing */}
      <Rect x={cx - 10} y={h / 2 - 8} width={20} height={14} cornerRadius={2}
            fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.35)" strokeWidth={0.6} />
      {/* Coil hatching */}
      {[-6, -3, 0, 3, 6].map((dx) => (
        <Line key={dx} points={[cx + dx, h / 2 - 7, cx + dx, h / 2 + 5]} stroke="#f8fafc" strokeWidth={0.7} opacity={0.5} />
      ))}
      <LedIndicator x={cx + w / 3} y={h / 2 - 12} color="#22c55e" on />
      {spec && <Silkscreen x={0} y={h - 12} w={w} text={spec} fontSize={7} color="#ffffff" opacity={0.9} />}
    </Group>
  )
}

const TimerSymbol: SymbolRenderer = ({ w, h, bg, props }) => {
  const cx = w / 2
  const timeText = props.kind === 'timer' ? props.mode.slice(0, 4).toUpperCase() : '----'
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      <LcdDisplay x={cx - 14} y={h / 2 - 10} w={28} h={12} text={timeText} fontSize={7} />
      <Circle x={cx - 6} y={h / 2 + 8} radius={3.5} stroke="#f8fafc" strokeWidth={0.7} fill="rgba(0,0,0,0.3)" />
      <Circle x={cx + 6} y={h / 2 + 8} radius={3.5} stroke="#f8fafc" strokeWidth={0.7} fill="rgba(0,0,0,0.3)" />
      <Text text="MODE" x={cx - 6} y={h / 2 + 6.5} width={12} fontSize={3.5} fill="#f8fafc" align="center" opacity={0.7} />
      <Text text="SET"  x={cx + 6} y={h / 2 + 6.5} width={12} fontSize={3.5} fill="#f8fafc" align="center" opacity={0.7} />
    </Group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Distribution / passive
// ─────────────────────────────────────────────────────────────────────────────

const CrossSymbol: SymbolRenderer = ({ w, h }) => {
  const cx = w / 2
  const cy = h / 2
  return (
    <Group listening={false}>
      {/* Distribution comb: multiple output terminals */}
      {[0.15, 0.35, 0.55, 0.75].map((f, i) => (
        <TerminalScrewLite key={`t${i}`} x={f * w} y={7} />
      ))}
      {[0.15, 0.35, 0.55, 0.75].map((f, i) => (
        <TerminalScrewLite key={`b${i}`} x={f * w} y={h - 7} />
      ))}
      {/* Copper busbar */}
      <Rect x={w * 0.1} y={cy - 3} width={w * 0.8} height={6} fill="#f59e0b" opacity={0.55}
            stroke="#78350f" strokeWidth={0.4} cornerRadius={1} />
      <Text text="L / N" x={0} y={cy + 6} width={w} align="center" fontSize={6} fontStyle="bold" fill="#ffffff" opacity={0.85} />
    </Group>
  )
}

// helper used only here
function TerminalScrewLite({ x, y }: { x: number; y: number }) {
  return (
    <Group x={x} y={y} listening={false}>
      <Circle radius={2.4} fill="#d4d4d8" stroke="#111827" strokeWidth={0.4} />
      <Line points={[-1.5, 0, 1.5, 0]} stroke="#111827" strokeWidth={0.5} />
    </Group>
  )
}

const NeutralBarSymbol: SymbolRenderer = ({ w, h }) => {
  const cy = h / 2
  return (
    <Group listening={false}>
      {/* Row of terminal screws */}
      {[0.15, 0.35, 0.55, 0.75].map((f, i) => (
        <TerminalScrewLite key={i} x={f * w} y={cy - 5} />
      ))}
      {[0.15, 0.35, 0.55, 0.75].map((f, i) => (
        <TerminalScrewLite key={`b${i}`} x={f * w} y={cy + 5} />
      ))}
      <Rect x={w * 0.08} y={cy - 2} width={w * 0.84} height={4} fill="#3b82f6" opacity={0.65}
            stroke="#1e3a8a" strokeWidth={0.4} cornerRadius={1} />
      <Text text="N" x={0} y={h - 11} width={w} align="center" fontSize={7} fontStyle="bold" fill="#ffffff" opacity={0.9} />
    </Group>
  )
}

const EarthBarSymbol: SymbolRenderer = ({ w, h }) => {
  const cy = h / 2
  return (
    <Group listening={false}>
      {[0.15, 0.35, 0.55, 0.75].map((f, i) => (
        <TerminalScrewLite key={i} x={f * w} y={cy - 5} />
      ))}
      {[0.15, 0.35, 0.55, 0.75].map((f, i) => (
        <TerminalScrewLite key={`b${i}`} x={f * w} y={cy + 5} />
      ))}
      <Rect x={w * 0.08} y={cy - 2} width={w * 0.84} height={4} fill="#facc15" opacity={0.9}
            stroke="#166534" strokeWidth={0.4} cornerRadius={1} />
      {/* Green stripes */}
      {[0.15, 0.4, 0.65].map((f, i) => (
        <Rect key={i} x={w * f} y={cy - 2} width={w * 0.06} height={4} fill="#166534" />
      ))}
      <Text text="PE" x={0} y={h - 11} width={w} align="center" fontSize={7} fontStyle="bold" fill="#ffffff" opacity={0.9} />
    </Group>
  )
}

const BusbarSymbol: SymbolRenderer = ({ w, h }) => {
  const cy = h / 2
  return (
    <Group listening={false}>
      {/* Copper bar */}
      <Rect x={w * 0.05} y={cy - 4} width={w * 0.9} height={8}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: 8 }}
            fillLinearGradientColorStops={[0, '#fbbf24', 0.5, '#d97706', 1, '#78350f']}
            cornerRadius={1} />
      {/* Fork pins */}
      {[0.15, 0.32, 0.5, 0.68, 0.85].map((f, i) => (
        <Rect key={i} x={f * w - 1} y={cy + 4} width={2} height={10} fill="#d97706" />
      ))}
      <Text text="BUSBAR" x={0} y={cy - 12} width={w} align="center" fontSize={5} fontStyle="bold" fill="#ffffff" opacity={0.75} />
    </Group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Protection – SPD, voltage relay
// ─────────────────────────────────────────────────────────────────────────────

const SurgeProtectorSymbol: SymbolRenderer = ({ w, h, props }) => {
  const cx = w / 2
  const type = props.kind === 'surge_protector' ? props.type : 'T2'
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      <StatusWindow x={cx - 8} y={h / 2 - 12} w={16} h={5} ok />
      {/* Lightning */}
      <Line
        points={[cx + 3, h / 2 - 2, cx - 2, h / 2 + 4, cx + 2, h / 2 + 4, cx - 3, h / 2 + 10]}
        stroke="#facc15" strokeWidth={1.8} lineCap="round" lineJoin="round"
      />
      <Silkscreen x={0} y={h - 12} w={w} text={type} fontSize={7} color="#ffffff" opacity={0.9} />
    </Group>
  )
}

const VoltageRelaySymbol: SymbolRenderer = ({ w, h, props }) => {
  const cx = w / 2
  const spec = props.kind === 'voltage_relay'
    ? `${props.minVoltage}-${props.maxVoltage}`
    : '---'
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      <LcdDisplay x={cx - 14} y={h / 2 - 10} w={28} h={11} text={spec} fontSize={6} />
      <LedIndicator x={cx - 8} y={h / 2 + 6} color="#22c55e" on />
      <LedIndicator x={cx}     y={h / 2 + 6} color="#f59e0b" on={false} />
      <LedIndicator x={cx + 8} y={h / 2 + 6} color="#ef4444" on={false} />
    </Group>
  )
}

const KwhMeterSymbol: SymbolRenderer = ({ w, h, props }) => {
  const cx = w / 2
  const phase = props.kind === 'meter' && props.threePhase ? '3P' : '1P'
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      <LcdDisplay x={cx - 20} y={h / 2 - 12} w={40} h={11} text="00000.0 kWh" fontSize={6} />
      {/* Pulse LED */}
      <LedIndicator x={cx - 12} y={h / 2 + 5} color="#ef4444" on />
      <Text text="imp/kWh" x={cx - 8} y={h / 2 + 3.5} width={30} fontSize={4.5} fill="#f8fafc" opacity={0.8} />
      <Silkscreen x={0} y={h - 12} w={w} text={phase} fontSize={7} color="#ffffff" opacity={0.85} />
    </Group>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Accessories
// ─────────────────────────────────────────────────────────────────────────────

const SignalLampSymbol: SymbolRenderer = ({ w, h, props }) => {
  const cx = w / 2
  const color = props.kind === 'signal_lamp' ? LAMP_HEX[props.color] : '#22c55e'
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      <LampDome cx={cx} cy={h / 2 + 2} r={9} color={color} />
    </Group>
  )
}

const ModularSocketSymbol: SymbolRenderer = ({ w, h }) => {
  const cx = w / 2
  const cy = h / 2 + 2
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Faceplate ring */}
      <Circle x={cx} y={cy} radius={12} fill="rgba(0,0,0,0.35)" stroke="#f8fafc" strokeWidth={0.6} />
      {/* Pin holes */}
      <Circle x={cx - 4} y={cy - 1} radius={1.8} fill="#0f172a" />
      <Circle x={cx + 4} y={cy - 1} radius={1.8} fill="#0f172a" />
      {/* Earth contact */}
      <Rect x={cx - 5} y={cy + 5} width={10} height={1.5} fill="#0f172a" />
    </Group>
  )
}

const PushButtonSymbol: SymbolRenderer = ({ w, h, props }) => {
  const cx = w / 2
  const color = props.kind === 'button' ? LAMP_HEX[props.color] : '#22c55e'
  const isEStop = props.kind === 'button' && props.variant === 'emergency_stop'
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      <ButtonCap cx={cx} cy={h / 2 + 3} r={isEStop ? 10 : 6} color={isEStop ? '#dc2626' : color} />
      {isEStop && (
        <Text text="STOP" x={0} y={h / 2 - 2} width={w} fontSize={5} fontStyle="bold" fill="#ffffff" align="center" opacity={0.95} />
      )}
    </Group>
  )
}

const DimmerSymbol: SymbolRenderer = ({ w, h, props }) => {
  const cx = w / 2
  const spec = props.kind === 'dimmer' ? `${props.maxWatts}W` : ''
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Rotary dial */}
      <Circle x={cx} y={h / 2} radius={10} fill="#0f172a" opacity={0.35} />
      <Circle x={cx} y={h / 2} radius={8.5}
              fillRadialGradientStartPoint={{ x: -3, y: -3 }}
              fillRadialGradientStartRadius={0}
              fillRadialGradientEndPoint={{ x: 0, y: 0 }}
              fillRadialGradientEndRadius={9}
              fillRadialGradientColorStops={[0, '#f8fafc', 0.6, '#a1a1aa', 1, '#3f3f46']} />
      {/* Pointer */}
      <Line points={[cx, h / 2, cx + 5, h / 2 - 5]} stroke="#0f172a" strokeWidth={1.5} lineCap="round" />
      {/* Tick marks */}
      {[-120, -60, 0, 60, 120].map((a) => {
        const rad = (a * Math.PI) / 180
        const r1 = 10.5, r2 = 12
        return (
          <Line
            key={a}
            points={[cx + Math.cos(rad - Math.PI / 2) * r1, h / 2 + Math.sin(rad - Math.PI / 2) * r1,
                     cx + Math.cos(rad - Math.PI / 2) * r2, h / 2 + Math.sin(rad - Math.PI / 2) * r2]}
            stroke="#f8fafc" strokeWidth={0.6}
          />
        )
      })}
      {spec && <Silkscreen x={0} y={h - 12} w={w} text={spec} fontSize={7} color="#ffffff" opacity={0.9} />}
    </Group>
  )
}

const BuzzerSymbol: SymbolRenderer = ({ w, h }) => {
  const cx = w / 2
  const cy = h / 2 + 3
  return (
    <Group listening={false}>
      <DeviceTerminals w={w} h={h} inset={7} />
      {/* Speaker grille */}
      <Circle x={cx} y={cy} radius={8} fill="#0f172a" opacity={0.5} stroke="#f8fafc" strokeWidth={0.5} />
      {[0, 1, 2, 3].map((i) => (
        <Circle key={i} x={cx} y={cy} radius={2 + i * 1.7} stroke="#f8fafc" strokeWidth={0.4} fill="transparent" opacity={0.55} />
      ))}
    </Group>
  )
}

const BlankSymbol: SymbolRenderer = ({ w, h }) => (
  <Group listening={false}>
    {/* Diagonal hatch for filler */}
    {[-6, 0, 6].map((off) => (
      <Line key={off} points={[off, h - 4, off + 12, 4]} stroke="#94a3b8" strokeWidth={0.6} opacity={0.4} />
    ))}
    <Line points={[w / 2, 6, w / 2, h - 6]} stroke="#94a3b8" strokeWidth={0.4} opacity={0.5} dash={[2, 3]} />
    <Text text="BLANK" x={0} y={h / 2 - 4} width={w} fontSize={5} fill="#4b5563" align="center" opacity={0.7} />
  </Group>
)

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// ─────────────────────────────────────────────────────────────────────────────

const REGISTRY: Record<SymbolId, SymbolRenderer> = {
  mcb: McbSymbol,
  rcd: RcdSymbol,
  rcbo: RcboSymbol,
  isolator: IsolatorSymbol,
  main_switch: MainSwitchSymbol,
  cross: CrossSymbol,
  contactor: ContactorSymbol,
  timer: TimerSymbol,
  surge_protector: SurgeProtectorSymbol,
  neutral_bar: NeutralBarSymbol,
  earth_bar: EarthBarSymbol,
  busbar: BusbarSymbol,
  voltage_relay: VoltageRelaySymbol,
  kwh_meter: KwhMeterSymbol,
  signal_lamp: SignalLampSymbol,
  modular_socket: ModularSocketSymbol,
  push_button: PushButtonSymbol,
  motor_starter: MotorStarterSymbol,
  buzzer: BuzzerSymbol,
  dimmer: DimmerSymbol,
  blank: BlankSymbol,
}

export function renderSymbol(symbolId: SymbolId, props: SymbolProps): ReactNode {
  const R = REGISTRY[symbolId]
  return R ? R(props) : null
}
