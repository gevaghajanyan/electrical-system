'use client'

import { Group, Rect, Text, Line } from 'react-konva'
import type { Rail, PanelElement, ElementTypeId } from '@/lib/types/panel'
import {
  SLOT_WIDTH_PX, ELEMENT_HEIGHT_PX, RAIL_ROW_HEIGHT_PX,
  PANEL_PADDING_PX, ELEMENT_TOP_Y,
} from '@/lib/constants/canvasLayout'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { hasSlotCollision, isWithinRail } from '@/lib/utils/slotUtils'

const TRACK_H = 8
const TRACK_Y = ELEMENT_TOP_Y + ELEMENT_HEIGHT_PX + 8
const UTILIZATION_BAR_H = 3

interface RailRowProps {
  rail: Rail
  railIndex: number
  elements: PanelElement[]
  draggingTypeId: ElementTypeId | null
  dropHighlight: { slotStart: number; valid: boolean } | null
  isDark: boolean
}

export function RailRow({ rail, railIndex, elements, draggingTypeId, dropHighlight, isDark }: RailRowProps) {
  const ry = PANEL_PADDING_PX + railIndex * RAIL_ROW_HEIGHT_PX
  const rowW = rail.slotCount * SLOT_WIDTH_PX

  const draggingDef = draggingTypeId ? ELEMENT_DEFS_MAP.get(draggingTypeId) : null
  const railElements = elements.filter((e) => e.railId === rail.id)

  const usedSlots = railElements.reduce((s, e) => s + e.slotWidth, 0)
  const utilizationPct = rail.slotCount > 0 ? usedSlots / rail.slotCount : 0
  const utilizationFill =
    utilizationPct >= 0.9 ? '#ef4444' : utilizationPct >= 0.7 ? '#f59e0b' : '#22c55e'
  const utilBarFilledW = utilizationPct * rowW

  return (
    <Group x={PANEL_PADDING_PX} y={ry}>
      {/* Rail background */}
      <Rect x={0} y={0} width={rowW} height={RAIL_ROW_HEIGHT_PX} fill={isDark ? '#27272a' : '#f8fafc'} />

      {/* Horizontal separator lines */}
      <Line points={[0, 0, rowW, 0]} stroke={isDark ? '#3f3f46' : '#e2e8f0'} strokeWidth={1} />
      <Line points={[0, RAIL_ROW_HEIGHT_PX, rowW, RAIL_ROW_HEIGHT_PX]} stroke={isDark ? '#3f3f46' : '#e2e8f0'} strokeWidth={1} />

      {/* Slot grid */}
      {Array.from({ length: rail.slotCount + 1 }, (_, i) => (
        <Line
          key={i}
          points={[i * SLOT_WIDTH_PX, ELEMENT_TOP_Y - 4, i * SLOT_WIDTH_PX, ELEMENT_TOP_Y + ELEMENT_HEIGHT_PX + 4]}
          stroke={isDark ? '#3f3f46' : '#e2e8f0'}
          strokeWidth={0.5}
        />
      ))}

      {/* Utilization bar (above DIN track) */}
      <Rect
        x={0}
        y={TRACK_Y - 10}
        width={rowW}
        height={UTILIZATION_BAR_H}
        fill={isDark ? '#27272a' : '#e2e8f0'}
        cornerRadius={1.5}
        listening={false}
      />
      {utilBarFilledW > 0 && (
        <Rect
          x={0}
          y={TRACK_Y - 10}
          width={utilBarFilledW}
          height={UTILIZATION_BAR_H}
          fill={utilizationFill}
          cornerRadius={1.5}
          listening={false}
        />
      )}

      {/* DIN rail track */}
      <Rect x={0} y={TRACK_Y} width={rowW} height={TRACK_H} fill={isDark ? '#52525b' : '#94a3b8'} cornerRadius={2} />
      {/* Track mounting clips */}
      {Array.from({ length: rail.slotCount + 1 }, (_, i) => (
        <Rect key={i} x={i * SLOT_WIDTH_PX - 1} y={TRACK_Y - 2} width={2} height={TRACK_H + 4} fill={isDark ? '#3f3f46' : '#64748b'} />
      ))}

      {/* Slot numbers */}
      {Array.from({ length: rail.slotCount }, (_, slot) => (
        <Text
          key={slot}
          x={slot * SLOT_WIDTH_PX}
          y={TRACK_Y + TRACK_H + 3}
          width={SLOT_WIDTH_PX}
          text={String(slot + 1)}
          fontSize={7}
          fill={isDark ? '#52525b' : '#94a3b8'}
          align="center"
          listening={false}
        />
      ))}

      {/* Rail label */}
      {rail.label && (
        <Text
          x={0}
          y={TRACK_Y + TRACK_H + 14}
          width={rowW}
          text={`${rail.label} — ${usedSlots}/${rail.slotCount}${usedSlots >= rail.slotCount ? ' ⚠ FULL' : utilizationPct >= 0.8 ? ' ●' : ''}`}
          fontSize={8}
          fontStyle="bold"
          fill={usedSlots >= rail.slotCount ? '#ef4444' : utilizationPct >= 0.8 ? '#f59e0b' : (isDark ? '#71717a' : '#64748b')}
          align="center"
          listening={false}
        />
      )}

      {/* Empty slot indicators / placement hints */}
      {Array.from({ length: rail.slotCount }, (_, slot) => {
        if (railElements.some((e) => slot >= e.slotStart && slot < e.slotStart + e.slotWidth)) return null
        const canPlace =
          draggingDef != null &&
          isWithinRail(rail, slot, draggingDef.defaultSlotWidth) &&
          !hasSlotCollision(elements, rail.id, slot, draggingDef.defaultSlotWidth)
        return (
          <Rect
            key={slot}
            x={slot * SLOT_WIDTH_PX + 1}
            y={ELEMENT_TOP_Y}
            width={SLOT_WIDTH_PX - 2}
            height={ELEMENT_HEIGHT_PX}
            fill={canPlace && draggingDef ? 'rgba(59,130,246,0.05)' : 'transparent'}
            stroke={draggingDef ? (canPlace ? '#3b82f6' : 'rgba(203,213,225,0.5)') : (isDark ? 'rgba(63,63,70,0.5)' : 'rgba(203,213,225,0.4)')}
            strokeWidth={canPlace ? 1.5 : 1}
            dash={[4, 4]}
            cornerRadius={3}
            listening={false}
          />
        )
      })}

      {/* Drop highlight for this rail */}
      {dropHighlight && (
        <Rect
          x={dropHighlight.slotStart * SLOT_WIDTH_PX + 1}
          y={ELEMENT_TOP_Y + 1}
          width={(draggingDef?.defaultSlotWidth ?? 1) * SLOT_WIDTH_PX - 2}
          height={ELEMENT_HEIGHT_PX - 2}
          fill={dropHighlight.valid ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}
          stroke={dropHighlight.valid ? '#22c55e' : '#ef4444'}
          strokeWidth={2}
          cornerRadius={4}
          listening={false}
        />
      )}
    </Group>
  )
}
