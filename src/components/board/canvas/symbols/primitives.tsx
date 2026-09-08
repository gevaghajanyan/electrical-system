'use client'

import { Group, Rect, Circle, Line, Text } from 'react-konva'

/** Small torx-style terminal screw. */
export function TerminalScrew({ x, y, r = 3, color = '#111827' }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <Group x={x} y={y} listening={false}>
      <Circle radius={r} fill="#d4d4d8" stroke={color} strokeWidth={0.6} />
      <Line points={[-r * 0.7, 0, r * 0.7, 0]} stroke={color} strokeWidth={0.8} lineCap="round" />
      <Line points={[0, -r * 0.7, 0, r * 0.7]} stroke={color} strokeWidth={0.8} lineCap="round" />
    </Group>
  )
}

/** Two terminal screws (top & bottom center) spaced by height h. */
export function DeviceTerminals({ w, h, inset = 6, r = 3 }: { w: number; h: number; inset?: number; r?: number }) {
  return (
    <Group listening={false}>
      <TerminalScrew x={w / 2} y={inset} r={r} />
      <TerminalScrew x={w / 2} y={h - inset} r={r} />
    </Group>
  )
}

/** Toggle handle emerging from the device face — the classic breaker lever. */
export function ToggleHandle({
  cx, cy, on = true, faceBg = '#1d4ed8', handleColor,
}: { cx: number; cy: number; on?: boolean; faceBg?: string; handleColor?: string }) {
  const hw = 8
  const hh = 12
  const off = on ? -2 : 4
  const bodyColor = handleColor ?? (on ? '#f8fafc' : '#e5e7eb')
  const shade = 'rgba(0,0,0,0.35)'
  return (
    <Group listening={false}>
      {/* Recessed cavity */}
      <Rect x={cx - hw / 2 - 1.5} y={cy - hh / 2 - 1} width={hw + 3} height={hh + 2} cornerRadius={2}
            fill="#0f172a" opacity={0.55} />
      {/* Handle body */}
      <Rect
        x={cx - hw / 2} y={cy - hh / 2 + off}
        width={hw} height={hh - Math.abs(off)}
        cornerRadius={1.5}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: hw, y: 0 }}
        fillLinearGradientColorStops={[0, bodyColor, 1, shade]}
      />
      {/* I / 0 indicator */}
      <Text
        text={on ? 'I' : '0'}
        x={cx - hw / 2}
        y={cy - hh / 2 + off + (on ? 0 : 1)}
        width={hw}
        align="center"
        fontSize={7}
        fontStyle="bold"
        fill={faceBg}
      />
    </Group>
  )
}

/** LED indicator dot (with subtle glow when `on`). */
export function LedIndicator({ x, y, color, on = true }: { x: number; y: number; color: string; on?: boolean }) {
  return (
    <Group x={x} y={y} listening={false}>
      {on && <Circle radius={3.5} fill={color} opacity={0.35} />}
      <Circle radius={1.7} fill={on ? color : '#3f3f46'} stroke="#0f172a" strokeWidth={0.4} />
    </Group>
  )
}

/** Small LCD-style panel with monospace digits. */
export function LcdDisplay({
  x, y, w, h, text, fontSize = 7,
}: { x: number; y: number; w: number; h: number; text: string; fontSize?: number }) {
  return (
    <Group x={x} y={y} listening={false}>
      <Rect width={w} height={h} cornerRadius={1.5} fill="#0f2b1f" stroke="#052e16" strokeWidth={0.5} />
      <Text
        text={text}
        width={w}
        y={(h - fontSize) / 2}
        align="center"
        fontFamily="monospace"
        fontStyle="bold"
        fontSize={fontSize}
        fill="#4ade80"
      />
    </Group>
  )
}

/** Status window (used by SPD to show green/red flag). */
export function StatusWindow({ x, y, w, h, ok = true }: { x: number; y: number; w: number; h: number; ok?: boolean }) {
  return (
    <Group x={x} y={y} listening={false}>
      <Rect width={w} height={h} fill="#f8fafc" stroke="#374151" strokeWidth={0.5} cornerRadius={1} />
      <Rect width={w} height={h} fill={ok ? '#22c55e' : '#ef4444'} opacity={0.85} cornerRadius={1} />
    </Group>
  )
}

/** Test button (RCD / RCBO). */
export function TestButton({ x, y, r = 3.5, color = '#facc15', label = 'T' }: {
  x: number; y: number; r?: number; color?: string; label?: string
}) {
  return (
    <Group x={x} y={y} listening={false}>
      <Circle radius={r + 0.5} fill="rgba(0,0,0,0.4)" />
      <Circle radius={r} fill={color} stroke="#78350f" strokeWidth={0.4} />
      <Text
        text={label}
        x={-r} y={-r + 0.5}
        width={r * 2}
        align="center"
        fontSize={r * 1.4}
        fontStyle="bold"
        fill="#1f2937"
      />
    </Group>
  )
}

/** Signal lamp dome — colored glass button. */
export function LampDome({ cx, cy, r = 7, color = '#22c55e' }: { cx: number; cy: number; r?: number; color?: string }) {
  return (
    <Group x={cx} y={cy} listening={false}>
      <Circle radius={r + 0.8} fill="#0f172a" opacity={0.55} />
      <Circle
        radius={r}
        fillRadialGradientStartPoint={{ x: -r / 3, y: -r / 3 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={r}
        fillRadialGradientColorStops={[0, '#ffffff', 0.4, color, 1, '#1f2937']}
      />
      {/* Specular highlight */}
      <Circle x={-r / 3} y={-r / 3} radius={r / 3} fill="#ffffff" opacity={0.55} />
    </Group>
  )
}

/** Push-button cap. */
export function ButtonCap({ cx, cy, r = 6, color = '#22c55e' }: { cx: number; cy: number; r?: number; color?: string }) {
  return (
    <Group x={cx} y={cy} listening={false}>
      <Circle radius={r + 1.2} fill="#0f172a" opacity={0.4} />
      <Circle radius={r} fill={color} stroke="rgba(0,0,0,0.35)" strokeWidth={0.6} />
      <Circle radius={r * 0.55} fill="#ffffff" opacity={0.25} />
    </Group>
  )
}

/** Small silkscreen label (e.g. "C16", "40A", "Ω"). */
export function Silkscreen({
  x, y, w, text, fontSize = 6, color = '#ffffff', opacity = 0.85,
}: { x: number; y: number; w: number; text: string; fontSize?: number; color?: string; opacity?: number }) {
  return (
    <Text
      x={x} y={y} width={w}
      text={text}
      fontSize={fontSize}
      fontStyle="bold"
      align="center"
      fill={color}
      opacity={opacity}
      listening={false}
    />
  )
}
