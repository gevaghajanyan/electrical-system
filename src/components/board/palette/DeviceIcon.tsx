'use client'

import type { ReactNode } from 'react'
import type { SymbolId, ElementDef } from '@/lib/constants/elementDefs'

/**
 * ABB S200 / Schneider iC60-inspired SVG icon for the palette.
 *
 * Approach:
 *  - Fixed 48×72 viewBox — matches DIN device aspect ratio (~18mm × 90mm)
 *  - White/off-white plastic body with subtle side highlights
 *  - Coloured header strip = brand/type accent
 *  - Two silver terminal screws top & bottom
 *  - Symbol-specific face art (toggle, test button, LCD, dome…)
 *
 * The whole file is presentational — no state, no store — so it can be reused
 * anywhere (palette, drag preview, BOM cell, tooltip).
 */

interface Props {
  def: ElementDef
  className?: string
  /** override face width in modules (1..4). Defaults to def.defaultSlotWidth. */
  poles?: number
  /** localized aria-label; defaults to the untranslated def.label */
  label?: string
}

const W_BASE = 34  // per-module width
const H = 72
const HEADER_H = 10
const TERMINAL_INSET = 6

export function DeviceIcon({ def, className = '', poles, label }: Props) {
  const modules = Math.max(1, poles ?? def.defaultSlotWidth)
  const w = W_BASE * modules
  return (
    <svg
      viewBox={`0 0 ${w} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      role="img"
      aria-label={label ?? def.label}
    >
      <defs>
        <linearGradient id={`plastic-${def.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#f4f4f5" />
          <stop offset="1" stopColor="#d4d4d8" />
        </linearGradient>
        <linearGradient id={`plastic-side-${def.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgba(0,0,0,0.18)" />
          <stop offset="0.06" stopColor="rgba(0,0,0,0)" />
          <stop offset="0.94" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>
        <linearGradient id={`brand-${def.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={def.color} stopOpacity="0.95" />
          <stop offset="1" stopColor={def.color} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Plastic body */}
      <rect x="0" y="0" width={w} height={H} rx="2.5" fill={`url(#plastic-${def.id})`} />
      <rect x="0" y="0" width={w} height={H} rx="2.5" fill={`url(#plastic-side-${def.id})`} />

      {/* Module dividers */}
      {modules > 1 && Array.from({ length: modules - 1 }).map((_, i) => (
        <line
          key={i}
          x1={W_BASE * (i + 1)}
          x2={W_BASE * (i + 1)}
          y1={HEADER_H}
          y2={H - 4}
          stroke="#a1a1aa"
          strokeWidth="0.6"
          opacity="0.55"
        />
      ))}

      {/* Coloured brand header */}
      <rect x="0" y="0" width={w} height={HEADER_H} rx="2.5" fill={`url(#brand-${def.id})`} />
      <rect x="0" y={HEADER_H - 1} width={w} height="1" fill="rgba(0,0,0,0.35)" />
      <text
        x={w / 2}
        y={HEADER_H - 2.6}
        textAnchor="middle"
        fontFamily="var(--font-sans, sans-serif)"
        fontSize="6"
        fontWeight="700"
        fill={def.textColor}
      >
        {def.shortLabel}
      </text>

      {/* Terminal screws */}
      <TerminalRow y={TERMINAL_INSET + HEADER_H - 2} count={modules} w={w} />
      <TerminalRow y={H - TERMINAL_INSET - 1} count={modules} w={w} />

      {/* Symbol-specific face */}
      <g transform={`translate(0, ${HEADER_H})`}>
        <DeviceFace symbolId={def.symbolId} w={w} h={H - HEADER_H} modules={modules} />
      </g>

      {/* Rating label at very bottom right */}
      <text
        x={w - 2}
        y={H - 1.5}
        textAnchor="end"
        fontFamily="var(--font-mono, monospace)"
        fontSize="5"
        fill="#71717a"
      >
        {def.poles > 0 ? `${def.poles}P` : ''}
      </text>
    </svg>
  )
}

function TerminalRow({ y, count, w }: { y: number; count: number; w: number }) {
  return (
    <g>
      {Array.from({ length: count }).map((_, i) => (
        <TerminalScrew key={i} cx={W_BASE * (i + 0.5)} cy={y} />
      ))}
    </g>
  )
}

function TerminalScrew({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="3" fill="#e5e7eb" stroke="#71717a" strokeWidth="0.4" />
      <line x1={cx - 2} y1={cy} x2={cx + 2} y2={cy} stroke="#1f2937" strokeWidth="0.6" />
      <line x1={cx} y1={cy - 2} x2={cx} y2={cy + 2} stroke="#1f2937" strokeWidth="0.6" />
    </g>
  )
}

// ─── Per-symbol face art ────────────────────────────────────────────────────

function DeviceFace({ symbolId, w, h, modules }: { symbolId: SymbolId; w: number; h: number; modules: number }) {
  const cx = w / 2
  const cy = h / 2
  switch (symbolId) {
    case 'mcb':
      return <McbFace cx={cx} cy={cy} />
    case 'rcd':
      return <RcdFace cx={cx} cy={cy} modules={modules} />
    case 'rcbo':
      return <RcboFace cx={cx} cy={cy} />
    case 'isolator':
      return <IsolatorFace cx={cx} cy={cy} color="#374151" />
    case 'main_switch':
      return <MainSwitchFace cx={cx} cy={cy} />
    case 'contactor':
      return <ContactorFace cx={cx} cy={cy} />
    case 'timer':
      return <TimerFace cx={cx} cy={cy} w={w} />
    case 'surge_protector':
      return <SpdFace cx={cx} cy={cy} />
    case 'cross':
      return <CrossFace w={w} h={h} />
    case 'neutral_bar':
      return <BarFace w={w} h={h} label="N" color="#3b82f6" />
    case 'earth_bar':
      return <BarFace w={w} h={h} label="PE" color="#facc15" striped />
    case 'busbar':
      return <BusbarFace w={w} h={h} />
    case 'voltage_relay':
      return <VoltageRelayFace cx={cx} cy={cy} w={w} />
    case 'kwh_meter':
      return <KwhFace cx={cx} cy={cy} w={w} />
    case 'signal_lamp':
      return <LampFace cx={cx} cy={cy} color="#22c55e" />
    case 'modular_socket':
      return <SocketFace cx={cx} cy={cy} />
    case 'push_button':
      return <ButtonFace cx={cx} cy={cy} color="#22c55e" />
    case 'motor_starter':
      return <MotorFace cx={cx} cy={cy} />
    case 'buzzer':
      return <BuzzerFace cx={cx} cy={cy} />
    case 'dimmer':
      return <DimmerFace cx={cx} cy={cy} />
    case 'blank':
      return <BlankFace w={w} h={h} />
    default:
      return null
  }
}

// ─── Face primitives ────────────────────────────────────────────────────────

function Toggle({ cx, cy, color = '#111827' }: { cx: number; cy: number; color?: string }) {
  return (
    <g>
      {/* Cavity */}
      <rect x={cx - 6} y={cy - 8} width="12" height="16" rx="1.5" fill="#0f172a" opacity="0.75" />
      {/* Handle in ON position — subtle shine via inline linear gradient overlay drawn twice */}
      <rect x={cx - 4.5} y={cy - 6} width="9" height="10" rx="1" fill={color} />
      <rect x={cx - 4.5} y={cy - 6} width="4.5" height="10" rx="1" fill="#ffffff" opacity="0.18" />
      <rect x={cx} y={cy - 6} width="4.5" height="10" rx="1" fill="#000000" opacity="0.2" />
      <text x={cx} y={cy + 1.5} textAnchor="middle"
            fontFamily="var(--font-sans, sans-serif)" fontSize="6" fontWeight="800" fill="#f8fafc">I</text>
    </g>
  )
}

function TestButton({ cx, cy, r = 4, color = '#facc15', label = 'T' }: {
  cx: number; cy: number; r?: number; color?: string; label?: string
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 0.6} fill="#0f172a" opacity="0.6" />
      <circle cx={cx} cy={cy} r={r} fill={color} stroke="#78350f" strokeWidth="0.5" />
      <text x={cx} y={cy + r * 0.55} textAnchor="middle"
            fontFamily="var(--font-sans, sans-serif)" fontSize={r * 1.3} fontWeight="800" fill="#1f2937">
        {label}
      </text>
    </g>
  )
}

function Lcd({ x, y, w, h, text }: { x: number; y: number; w: number; h: number; text: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="1.5" fill="#052e16" stroke="#022c22" strokeWidth="0.5" />
      <text x={x + w / 2} y={y + h - h * 0.25} textAnchor="middle"
            fontFamily="var(--font-mono, monospace)" fontSize={h * 0.6} fontWeight="700" fill="#4ade80">
        {text}
      </text>
    </g>
  )
}

function Led({ cx, cy, color, on = true }: { cx: number; cy: number; color: string; on?: boolean }) {
  return (
    <g>
      {on && <circle cx={cx} cy={cy} r="3" fill={color} opacity="0.35" />}
      <circle cx={cx} cy={cy} r="1.4" fill={on ? color : '#3f3f46'} stroke="#0f172a" strokeWidth="0.3" />
    </g>
  )
}

function DomeLamp({ cx, cy, r = 9, color = '#22c55e' }: { cx: number; cy: number; r?: number; color?: string }) {
  return (
    <g>
      {/* Cavity shadow */}
      <circle cx={cx} cy={cy} r={r + 0.8} fill="#111827" opacity="0.4" />
      {/* Base body */}
      <circle cx={cx} cy={cy} r={r} fill={color} />
      {/* Darkening on the far side */}
      <circle cx={cx} cy={cy} r={r} fill="#0f172a" opacity="0.35"
              clipPath={`inset(0 0 0 50%)`} />
      {/* Central bright disc */}
      <circle cx={cx} cy={cy} r={r * 0.65} fill="#ffffff" opacity="0.35" />
      {/* Specular highlight */}
      <circle cx={cx - r * 0.35} cy={cy - r * 0.35} r={r * 0.28} fill="#ffffff" opacity="0.75" />
    </g>
  )
}

// ─── Faces ──────────────────────────────────────────────────────────────────

function McbFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Rating window */}
      <rect x={cx - 11} y={cy - 20} width="22" height="10" rx="1.5" fill="#0f172a" opacity="0.15" />
      <text x={cx} y={cy - 12} textAnchor="middle"
            fontFamily="var(--font-mono, monospace)" fontSize="7" fontWeight="800" fill="#111827">
        C16
      </text>
      <Toggle cx={cx} cy={cy + 4} />
    </g>
  )
}

function RcdFace({ cx, cy, modules }: { cx: number; cy: number; modules: number }) {
  return (
    <g>
      <rect x={cx - 14} y={cy - 20} width="28" height="10" rx="1.5" fill="#0f172a" opacity="0.15" />
      <text x={cx} y={cy - 12} textAnchor="middle"
            fontFamily="var(--font-mono, monospace)" fontSize="7" fontWeight="800" fill="#111827">
        30mA
      </text>
      <Toggle cx={cx - (modules > 2 ? 16 : 8)} cy={cy + 4} />
      <TestButton cx={cx + (modules > 2 ? 16 : 8)} cy={cy + 6} r={4.5} />
    </g>
  )
}

function RcboFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 11} y={cy - 20} width="22" height="9" rx="1.5" fill="#0f172a" opacity="0.15" />
      <text x={cx} y={cy - 13} textAnchor="middle"
            fontFamily="var(--font-mono, monospace)" fontSize="6.5" fontWeight="800" fill="#111827">
        C16 30mA
      </text>
      <Toggle cx={cx - 4} cy={cy + 5} />
      <TestButton cx={cx + 9} cy={cy + 6} r={2.8} />
    </g>
  )
}

function IsolatorFace({ cx, cy, color = '#dc2626' }: { cx: number; cy: number; color?: string }) {
  return (
    <g>
      <text x={cx} y={cy - 15} textAnchor="middle"
            fontFamily="var(--font-mono, monospace)" fontSize="7" fontWeight="800" fill="#111827">
        63A
      </text>
      <Toggle cx={cx} cy={cy + 3} color={color} />
    </g>
  )
}

function MainSwitchFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Faux radial gradient built from stacked circles — no <defs> id to collide */}
      <rect x={cx - 14} y={cy - 12} width="28" height="28" rx="4" fill="#7f1d1d" opacity="0.35" />
      <circle cx={cx} cy={cy + 2} r="11" fill="#7f1d1d" />
      <circle cx={cx} cy={cy + 2} r="10" fill="#ef4444" />
      <circle cx={cx - 2.5} cy={cy - 0.5} r="7" fill="#fca5a5" opacity="0.8" />
      <circle cx={cx - 3.5} cy={cy - 1.5} r="3" fill="#fef2f2" opacity="0.9" />
      <rect x={cx - 1} y={cy - 8} width="2" height="12" rx="1" fill="#fef2f2" />
      <text x={cx} y={cy - 18} textAnchor="middle"
            fontFamily="var(--font-sans, sans-serif)" fontSize="6" fontWeight="800" fill="#111827">
        MAIN
      </text>
    </g>
  )
}

function ContactorFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <rect x={cx - 12} y={cy - 12} width="24" height="18" rx="2" fill="#0f172a" opacity="0.15" />
      {[-7, -3.5, 0, 3.5, 7].map((dx) => (
        <line key={dx} x1={cx + dx} x2={cx + dx} y1={cy - 10} y2={cy + 4}
              stroke="#111827" strokeWidth="0.7" opacity="0.55" />
      ))}
      <Led cx={cx + 8} cy={cy + 12} color="#22c55e" />
      <text x={cx - 8} y={cy + 14} textAnchor="middle"
            fontFamily="var(--font-mono, monospace)" fontSize="5" fill="#374151">A1</text>
    </g>
  )
}

function TimerFace({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  return (
    <g>
      <Lcd x={cx - 16} y={cy - 18} w={32} h={12} text="12:34" />
      <circle cx={cx - 8} cy={cy + 5} r="3.5" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <circle cx={cx + 8} cy={cy + 5} r="3.5" fill="#e5e7eb" stroke="#374151" strokeWidth="0.5" />
      <text x={cx - 8} y={cy + 13} textAnchor="middle" fontSize="4" fill="#374151" fontWeight="700">M</text>
      <text x={cx + 8} y={cy + 13} textAnchor="middle" fontSize="4" fill="#374151" fontWeight="700">SET</text>
    </g>
  )
}

function SpdFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Status window */}
      <rect x={cx - 10} y={cy - 16} width="20" height="6" rx="1" fill="#22c55e" stroke="#374151" strokeWidth="0.5" />
      {/* Lightning */}
      <path d={`M ${cx + 3} ${cy - 4} L ${cx - 2} ${cy + 4} L ${cx + 2} ${cy + 4} L ${cx - 3} ${cy + 14}`}
            stroke="#facc15" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={cx} y={cy + 22} textAnchor="middle" fontSize="6" fontWeight="800" fill="#111827">T2</text>
    </g>
  )
}

function CrossFace({ w, h }: { w: number; h: number }) {
  const cy = h / 2
  const positions = [0.2, 0.4, 0.6, 0.8]
  return (
    <g>
      {positions.map((f, i) => (
        <g key={i}>
          <line x1={f * w} x2={f * w} y1={cy - 12} y2={cy + 12}
                stroke="#a1a1aa" strokeWidth="0.6" />
        </g>
      ))}
      <rect x={w * 0.08} y={cy - 3} width={w * 0.84} height="6" rx="1" fill="#f59e0b"
            stroke="#78350f" strokeWidth="0.4" opacity="0.85" />
      <text x={w / 2} y={cy + 14} textAnchor="middle" fontSize="6" fontWeight="800" fill="#374151">L/N</text>
    </g>
  )
}

function BarFace({ w, h, label, color, striped = false }: {
  w: number; h: number; label: string; color: string; striped?: boolean
}) {
  const cy = h / 2
  return (
    <g>
      <rect x={w * 0.08} y={cy - 3} width={w * 0.84} height="6" rx="1"
            fill={color} stroke="#374151" strokeWidth="0.4" opacity="0.9" />
      {striped && [0.15, 0.4, 0.65].map((f, i) => (
        <rect key={i} x={w * f} y={cy - 3} width={w * 0.05} height="6" fill="#166534" />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
        <circle key={i} cx={w * f} cy={cy - 12} r="2" fill="#e5e7eb" stroke="#71717a" strokeWidth="0.4" />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((f, i) => (
        <circle key={`b${i}`} cx={w * f} cy={cy + 12} r="2" fill="#e5e7eb" stroke="#71717a" strokeWidth="0.4" />
      ))}
      <text x={w / 2} y={cy + 20} textAnchor="middle" fontSize="7" fontWeight="800" fill="#111827">{label}</text>
    </g>
  )
}

function BusbarFace({ w, h }: { w: number; h: number }) {
  const cy = h / 2
  return (
    <g>
      {/* Stacked coppery strips to fake a vertical gradient without id collisions */}
      <rect x={w * 0.05} y={cy - 4} width={w * 0.9} height="8" rx="1" fill="#fbbf24" />
      <rect x={w * 0.05} y={cy - 1} width={w * 0.9} height="5" rx="0.5" fill="#d97706" />
      <rect x={w * 0.05} y={cy + 2} width={w * 0.9} height="2" fill="#78350f" opacity="0.85" />
      {[0.15, 0.32, 0.5, 0.68, 0.85].map((f, i) => (
        <rect key={i} x={w * f - 1} y={cy + 4} width="2" height="10" fill="#d97706" />
      ))}
      <text x={w / 2} y={cy - 8} textAnchor="middle" fontSize="5" fontWeight="700" fill="#374151">BUSBAR</text>
    </g>
  )
}

function VoltageRelayFace({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  return (
    <g>
      <Lcd x={cx - 16} y={cy - 18} w={32} h={11} text="230V" />
      <Led cx={cx - 8} cy={cy + 3} color="#22c55e" on />
      <Led cx={cx}     cy={cy + 3} color="#f59e0b" on={false} />
      <Led cx={cx + 8} cy={cy + 3} color="#ef4444" on={false} />
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="5" fill="#374151">OK  WRN  TRP</text>
    </g>
  )
}

function KwhFace({ cx, cy, w }: { cx: number; cy: number; w: number }) {
  return (
    <g>
      <Lcd x={cx - 22} y={cy - 18} w={44} h={12} text="00000.0" />
      <text x={cx + 20} y={cy - 9} textAnchor="end" fontSize="4.5" fill="#4ade80" fontWeight="700">kWh</text>
      <Led cx={cx - 12} cy={cy + 5} color="#ef4444" on />
      <text x={cx + 2} y={cy + 6.5} textAnchor="start" fontSize="5" fill="#374151">imp/kWh</text>
    </g>
  )
}

function LampFace({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return <DomeLamp cx={cx} cy={cy} r={13} color={color} />
}

function SocketFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="14" fill="#f4f4f5" stroke="#71717a" strokeWidth="0.6" />
      <circle cx={cx - 4.5} cy={cy - 1} r="2.2" fill="#0f172a" />
      <circle cx={cx + 4.5} cy={cy - 1} r="2.2" fill="#0f172a" />
      <rect x={cx - 6} y={cy + 6} width="12" height="1.6" fill="#0f172a" />
    </g>
  )
}

function ButtonFace({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="11" fill="#0f172a" opacity="0.4" />
      <circle cx={cx} cy={cy} r="9" fill={color} stroke="rgba(0,0,0,0.4)" strokeWidth="0.6" />
      <circle cx={cx - 3} cy={cy - 3} r="4" fill="#ffffff" opacity="0.35" />
    </g>
  )
}

function MotorFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy - 4} r="10" fill="#f4f4f5" stroke="#374151" strokeWidth="0.7" />
      <text x={cx} y={cy - 1} textAnchor="middle"
            fontFamily="var(--font-sans, sans-serif)" fontSize="12" fontWeight="800" fill="#111827">M</text>
      <circle cx={cx} cy={cy + 14} r="4.5" fill="#111827" stroke="#e5e7eb" strokeWidth="0.6" />
      <line x1={cx} y1={cy + 10} x2={cx} y2={cy + 14} stroke="#f8fafc" strokeWidth="1.2" />
    </g>
  )
}

function DimmerFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {/* Rotary knob body */}
      <circle cx={cx} cy={cy} r="14" fill="#e5e7eb" stroke="#71717a" strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r="11" fill="#f4f4f5" stroke="#a1a1aa" strokeWidth="0.4" />
      {/* Pointer notch */}
      <rect x={cx - 1} y={cy - 11} width="2" height="6" rx="1" fill="#111827" />
      {/* Tick marks */}
      {[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((a) => {
        const rad = (a * Math.PI) / 180
        const r1 = 14.5
        const r2 = a === 0 ? 17 : 16
        return (
          <line
            key={a}
            x1={cx + Math.cos(rad - Math.PI / 2) * r1}
            y1={cy + Math.sin(rad - Math.PI / 2) * r1}
            x2={cx + Math.cos(rad - Math.PI / 2) * r2}
            y2={cy + Math.sin(rad - Math.PI / 2) * r2}
            stroke="#374151"
            strokeWidth={a === 0 ? '1' : '0.5'}
          />
        )
      })}
    </g>
  )
}

function BuzzerFace({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="12" fill="#0f172a" opacity="0.15" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={cx} cy={cy} r={2 + i * 2.4} fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.65" />
      ))}
    </g>
  )
}

function BlankFace({ w, h }: { w: number; h: number }) {
  const stripes: ReactNode[] = []
  for (let i = -h; i < w + h; i += 6) {
    stripes.push(<line key={i} x1={i} y1={h} x2={i + h} y2={0} stroke="#a1a1aa" strokeWidth="0.5" opacity="0.5" />)
  }
  return <g>{stripes}</g>
}
