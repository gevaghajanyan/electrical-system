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

/** Registry — one entry per SchemeNodeType. */
const REGISTRY: Record<SchemeNodeType, (props: SymProps) => ReactNode> = {
  switch_spst: SwitchSpst,
  switch_2way: Switch2Way,
  push_button: PushButton,
  lamp_230: LampInc,
  led_220: Led,
  transformer_sd: Transformer,
  power_ac: PowerAc,
  socket_outlet: SocketOutlet,
  motor: Motor,
  junction: Junction,
}

export function renderSchemeSymbol(type: SchemeNodeType, props: SymProps = {}): ReactNode {
  const R = REGISTRY[type]
  return R ? R(props) : null
}
