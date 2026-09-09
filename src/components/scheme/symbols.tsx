'use client'

import type { ReactNode } from 'react'
import type { SchemeNodeType } from '@/lib/types/scheme'

/**
 * IEC 60617-inspired scheme node symbols.
 *
 * All symbols render inside their def.width × def.height bounds. They use
 * dark strokes on transparent background so the outer card sets the visual
 * theme. Yellow / amber is reserved for the accent (fill highlights, LED
 * emission, etc.) to match the app palette.
 */

const STROKE = '#1b2740'
const STROKE_LIGHT = '#3f4a5f'
const ACCENT = '#f2bc2e'

interface SymProps { rotation?: 0 | 90 | 180 | 270 }

function SwitchSpst(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      {/* Wires */}
      <line x1={0} y1={24} x2={12} y2={24} />
      <line x1={68} y1={24} x2={80} y2={24} />
      {/* Contacts */}
      <circle cx={14} cy={24} r={2.5} fill={STROKE} />
      <circle cx={66} cy={24} r={2.5} fill={STROKE} />
      {/* Open lever */}
      <line x1={16} y1={24} x2={60} y2={10} strokeWidth={2.2} />
      {/* Tick to indicate an open switch */}
      <line x1={40} y1={30} x2={40} y2={38} strokeWidth={1} strokeDasharray="2 2" />
    </g>
  )
}

function Switch2Way(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <line x1={0} y1={28} x2={12} y2={28} />
      <circle cx={14} cy={28} r={2.5} fill={STROKE} />
      {/* Two throws */}
      <line x1={78} y1={16} x2={88} y2={16} />
      <line x1={78} y1={40} x2={88} y2={40} />
      <circle cx={76} cy={16} r={2.5} fill={STROKE} />
      <circle cx={76} cy={40} r={2.5} fill={STROKE} />
      {/* Lever in A position */}
      <line x1={16} y1={28} x2={70} y2={16} strokeWidth={2.2} />
    </g>
  )
}

function PushButton(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <line x1={0} y1={24} x2={16} y2={24} />
      <line x1={48} y1={24} x2={64} y2={24} />
      {/* Open contact bar above two dots */}
      <circle cx={18} cy={24} r={2.5} fill={STROKE} />
      <circle cx={46} cy={24} r={2.5} fill={STROKE} />
      <line x1={18} y1={18} x2={46} y2={18} strokeWidth={2.2} />
      {/* Push arm connecting bar to stem */}
      <line x1={32} y1={18} x2={32} y2={8} />
      <rect x={26} y={4} width={12} height={5} rx={1} fill={ACCENT} stroke={STROKE} strokeWidth={1.4} />
    </g>
  )
}

function LampInc(_: SymProps) {
  // IEC lamp: circle with X inside
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <circle cx={32} cy={32} r={20} fill="#fef9e7" />
      <line x1={17.86} y1={17.86} x2={46.14} y2={46.14} />
      <line x1={46.14} y1={17.86} x2={17.86} y2={46.14} />
      {/* Terminal wires */}
      <line x1={32} y1={0} x2={32} y2={12} />
      <line x1={32} y1={52} x2={32} y2={64} />
    </g>
  )
}

function Led(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Wires */}
      <line x1={32} y1={0} x2={32} y2={12} />
      <line x1={32} y1={52} x2={32} y2={64} />
      {/* Diode triangle */}
      <polygon points="22,14 42,32 22,50" fill={ACCENT} stroke={STROKE} strokeWidth={1.8} />
      {/* Cathode bar */}
      <line x1={42} y1={14} x2={42} y2={50} strokeWidth={2.3} />
      {/* Emission arrows */}
      <g stroke={STROKE_LIGHT} strokeWidth={1.4}>
        <line x1={46} y1={16} x2={56} y2={6} />
        <polyline points="53,6 56,6 56,9" />
        <line x1={50} y1={22} x2={60} y2={12} />
        <polyline points="57,12 60,12 60,15" />
      </g>
    </g>
  )
}

function Transformer(_: SymProps) {
  // Two coils with dashed core in the middle
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      {/* Primary bumps (left) */}
      <path d="M 40 20 Q 32 30 40 40 M 40 40 Q 32 50 40 60" />
      {/* Secondary bumps (right) */}
      <path d="M 88 20 Q 96 30 88 40 M 88 40 Q 96 50 88 60" />
      {/* Iron core */}
      <line x1={64} y1={16} x2={64} y2={64} strokeDasharray="4 3" strokeWidth={1.4} />
      {/* Primary terminals */}
      <line x1={0} y1={24} x2={30} y2={24} />
      <line x1={0} y1={56} x2={30} y2={56} />
      {/* Secondary terminals */}
      <line x1={98} y1={24} x2={128} y2={24} />
      <line x1={98} y1={56} x2={128} y2={56} />
    </g>
  )
}

function PowerAc(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none">
      <circle cx={40} cy={26} r={16} fill="#fff" />
      {/* Sine wave inside */}
      <path d="M 30 26 Q 35 18 40 26 T 50 26" strokeLinecap="round" />
      {/* Terminals */}
      <line x1={20} y1={64} x2={20} y2={54} strokeLinecap="round" />
      <line x1={40} y1={64} x2={40} y2={54} strokeLinecap="round" />
      <line x1={60} y1={64} x2={60} y2={54} strokeLinecap="round" />
      <text x={40} y={50} textAnchor="middle" fontSize={8} fill={STROKE_LIGHT} fontFamily="var(--font-sans, sans-serif)">
        AC
      </text>
    </g>
  )
}

function SocketOutlet(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      {/* Faceplate */}
      <circle cx={36} cy={30} r={20} fill="#fff" />
      {/* Pin sockets */}
      <line x1={26} y1={26} x2={26} y2={38} strokeWidth={2.5} />
      <line x1={46} y1={26} x2={46} y2={38} strokeWidth={2.5} />
      {/* Earth contact */}
      <line x1={30} y1={44} x2={42} y2={44} strokeWidth={1.6} />
      {/* Bottom terminal wires */}
      <line x1={20} y1={64} x2={20} y2={54} />
      <line x1={36} y1={64} x2={36} y2={54} />
      <line x1={52} y1={64} x2={52} y2={54} />
    </g>
  )
}

function Motor(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none">
      <circle cx={36} cy={36} r={26} fill="#fff" />
      <text
        x={36}
        y={44}
        textAnchor="middle"
        fontSize={22}
        fontWeight={800}
        fill={STROKE}
        fontFamily="var(--font-sans, sans-serif)"
      >
        M
      </text>
      {/* Three phase terminals top */}
      <line x1={20} y1={0} x2={20} y2={12} strokeLinecap="round" strokeWidth={2.2} />
      <line x1={36} y1={0} x2={36} y2={12} strokeLinecap="round" strokeWidth={2.2} />
      <line x1={52} y1={0} x2={52} y2={12} strokeLinecap="round" strokeWidth={2.2} />
      {/* PE terminal bottom */}
      <line x1={36} y1={62} x2={36} y2={72} strokeLinecap="round" strokeWidth={2.2} />
    </g>
  )
}

function Junction(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.5} fill={STROKE}>
      <circle cx={8} cy={8} r={5} />
    </g>
  )
}

function SwitchIntermediate(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      {/* Four terminals */}
      <line x1={0}  y1={20} x2={18} y2={20} />
      <line x1={0}  y1={44} x2={18} y2={44} />
      <line x1={78} y1={20} x2={96} y2={20} />
      <line x1={78} y1={44} x2={96} y2={44} />
      <circle cx={20} cy={20} r={2.5} fill={STROKE} />
      <circle cx={20} cy={44} r={2.5} fill={STROKE} />
      <circle cx={76} cy={20} r={2.5} fill={STROKE} />
      <circle cx={76} cy={44} r={2.5} fill={STROKE} />
      {/* Cross (X) linkage between the two contact pairs — the whole assembly rotates as one */}
      <line x1={22} y1={20} x2={74} y2={44} strokeWidth={2.2} />
      <line x1={22} y1={44} x2={74} y2={20} strokeWidth={2.2} />
    </g>
  )
}

function Contactor(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      {/* Body outline */}
      <rect x={12} y={16} width={72} height={56} rx={4} fill="#fff" />
      {/* Three main pole contacts (open state) */}
      {[20, 48, 76].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={0} x2={x} y2={16} strokeWidth={2.2} />
          <line x1={x} y1={72} x2={x} y2={88} strokeWidth={2.2} />
          <circle cx={x} cy={20} r={2.5} fill={STROKE} />
          <circle cx={x} cy={68} r={2.5} fill={STROKE} />
          {/* Open contact arm */}
          <line x1={x - 6} y1={22} x2={x - 6} y2={66} strokeWidth={2.2} />
        </g>
      ))}
      {/* Coil rectangle on the left — driven by A1/A2 */}
      <line x1={0} y1={30} x2={12} y2={30} />
      <line x1={0} y1={58} x2={12} y2={58} />
      <rect x={12} y={30} width={4} height={28} fill={ACCENT} stroke={STROKE} strokeWidth={1.2} />
      <text x={40} y={54} textAnchor="middle" fontSize={11} fontWeight={700} fill={STROKE_LIGHT} fontFamily="var(--font-sans, sans-serif)">
        KM
      </text>
    </g>
  )
}

function Overload(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      {/* Body */}
      <rect x={12} y={10} width={72} height={52} rx={4} fill="#fff" />
      {/* Three heater elements — squiggly through the body */}
      {[20, 48, 76].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={0}  x2={x} y2={10} strokeWidth={2.2} />
          <line x1={x} y1={62} x2={x} y2={72} strokeWidth={2.2} />
          <path d={`M ${x} 12 l -4 6 l 8 8 l -8 8 l 8 8 l -4 6`} strokeWidth={1.6} />
        </g>
      ))}
      {/* 95-96 NC contact stub on the right */}
      <line x1={96} y1={22} x2={84} y2={22} />
      <line x1={96} y1={50} x2={84} y2={50} />
      <circle cx={82} cy={22} r={2} fill={STROKE} />
      <circle cx={82} cy={50} r={2} fill={STROKE} />
      <line x1={82} y1={22} x2={70} y2={36} strokeWidth={2} />
      <line x1={82} y1={50} x2={70} y2={36} strokeWidth={2} strokeDasharray="2 2" />
    </g>
  )
}

function DcSupply(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <circle cx={40} cy={26} r={16} fill="#fff" />
      {/* Straight bar over dashed = DC */}
      <line x1={30} y1={22} x2={50} y2={22} strokeWidth={2.2} />
      <line x1={30} y1={30} x2={50} y2={30} strokeWidth={1.6} strokeDasharray="3 3" />
      <text x={40} y={50} textAnchor="middle" fontSize={8} fill={STROKE_LIGHT} fontFamily="var(--font-sans, sans-serif)">
        DC
      </text>
      <line x1={20} y1={64} x2={20} y2={54} />
      <line x1={60} y1={64} x2={60} y2={54} />
      <text x={16} y={62} textAnchor="end" fontSize={10} fontWeight={800} fill="#dc2626">+</text>
      <text x={64} y={62} fontSize={10} fontWeight={800} fill={STROKE_LIGHT}>−</text>
    </g>
  )
}

function BatterySym(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      {/* Two IEC battery cells stacked */}
      <line x1={18} y1={0}  x2={18} y2={20} strokeWidth={2.2} />
      <line x1={54} y1={0}  x2={54} y2={20} strokeWidth={2.2} />
      {/* + long, − short — pair 1 */}
      <line x1={12} y1={22} x2={30} y2={22} strokeWidth={2.2} />
      <line x1={18} y1={28} x2={26} y2={28} strokeWidth={2.2} />
      {/* pair 2 */}
      <line x1={12} y1={36} x2={30} y2={36} strokeWidth={2.2} />
      <line x1={18} y1={42} x2={26} y2={42} strokeWidth={2.2} />
      {/* Body outline */}
      <rect x={10} y={18} width={52} height={40} rx={3} fill="none" stroke={STROKE_LIGHT} strokeDasharray="3 2" />
      <text x={40} y={60} textAnchor="middle" fontSize={9} fontWeight={700} fill={STROKE_LIGHT} fontFamily="var(--font-sans, sans-serif)">
        BATT
      </text>
    </g>
  )
}

function KwhMeterSym(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <rect x={12} y={14} width={72} height={44} rx={4} fill="#fff" />
      <text x={48} y={38} textAnchor="middle" fontSize={13} fontWeight={800} fill={STROKE} fontFamily="var(--font-sans, sans-serif)">
        kWh
      </text>
      <text x={48} y={51} textAnchor="middle" fontSize={7} fill={STROKE_LIGHT} fontFamily="var(--font-sans, sans-serif)">
        00000.0
      </text>
      {/* Terminals */}
      <line x1={24} y1={0}  x2={24} y2={14} strokeWidth={2.2} />
      <line x1={72} y1={0}  x2={72} y2={14} strokeWidth={2.2} />
      <line x1={24} y1={58} x2={24} y2={72} strokeWidth={2.2} />
      <line x1={72} y1={58} x2={72} y2={72} strokeWidth={2.2} />
    </g>
  )
}

function McbSym(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <rect x={14} y={14} width={28} height={36} rx={3} fill="#fff" />
      <line x1={28} y1={0}  x2={28} y2={14} strokeWidth={2.2} />
      <line x1={28} y1={50} x2={28} y2={64} strokeWidth={2.2} />
      {/* Open contact */}
      <line x1={28} y1={18} x2={22} y2={40} strokeWidth={2.2} />
      <circle cx={28} cy={18} r={2} fill={STROKE} />
      <circle cx={28} cy={44} r={2} fill={STROKE} />
      <text x={28} y={32} textAnchor="middle" fontSize={8} fontWeight={800} fill={STROKE_LIGHT} fontFamily="var(--font-sans, sans-serif)">
        MCB
      </text>
    </g>
  )
}

function RcdSym(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <rect x={12} y={14} width={56} height={44} rx={3} fill="#fff" />
      {/* Two open contacts */}
      <line x1={24} y1={0}  x2={24} y2={14} strokeWidth={2.2} />
      <line x1={56} y1={0}  x2={56} y2={14} strokeWidth={2.2} />
      <line x1={24} y1={58} x2={24} y2={72} strokeWidth={2.2} />
      <line x1={56} y1={58} x2={56} y2={72} strokeWidth={2.2} />
      <line x1={24} y1={20} x2={20} y2={52} strokeWidth={2.2} />
      <line x1={56} y1={20} x2={52} y2={52} strokeWidth={2.2} />
      {/* Iδ arrow */}
      <text x={40} y={40} textAnchor="middle" fontSize={11} fontWeight={800} fill={ACCENT} fontFamily="var(--font-sans, sans-serif)">
        Iδ
      </text>
    </g>
  )
}

function BellSym(_: SymProps) {
  return (
    <g stroke={STROKE} strokeWidth={1.8} fill="none" strokeLinecap="round">
      <line x1={20} y1={0}  x2={20} y2={18} strokeWidth={2.2} />
      <line x1={44} y1={0}  x2={44} y2={18} strokeWidth={2.2} />
      {/* Bell dome */}
      <path d="M 12 42 A 20 20 0 0 1 52 42 Z" fill="#fff" />
      <line x1={12} y1={42} x2={52} y2={42} />
      {/* Clapper */}
      <circle cx={32} cy={48} r={3} fill={STROKE} />
      <text x={32} y={62} textAnchor="middle" fontSize={9} fontWeight={700} fill={STROKE_LIGHT} fontFamily="var(--font-sans, sans-serif)">
        ♪
      </text>
    </g>
  )
}

/** Registry — one entry per SchemeNodeType. */
const REGISTRY: Record<SchemeNodeType, (props: SymProps) => ReactNode> = {
  switch_spst: SwitchSpst,
  switch_2way: Switch2Way,
  switch_intermediate: SwitchIntermediate,
  push_button: PushButton,
  lamp_230: LampInc,
  led_220: Led,
  transformer_sd: Transformer,
  power_ac: PowerAc,
  socket_outlet: SocketOutlet,
  motor: Motor,
  junction: Junction,
  contactor: Contactor,
  overload: Overload,
  dc_supply: DcSupply,
  battery: BatterySym,
  kwh_meter: KwhMeterSym,
  mcb: McbSym,
  rcd: RcdSym,
  bell: BellSym,
}

export function renderSchemeSymbol(type: SchemeNodeType, props: SymProps = {}): ReactNode {
  const R = REGISTRY[type]
  return R ? R(props) : null
}
