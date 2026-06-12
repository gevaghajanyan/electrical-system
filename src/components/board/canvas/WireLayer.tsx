'use client'

import { Group, Line } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Connection, PanelElement, Rail } from '@/lib/types/panel'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { getPortPositions, phaseColor } from '@/lib/utils/portUtils'
import { panelStore } from '@/lib/store/panelStore'

interface WireLayerProps {
  connections: Connection[]
  elements: PanelElement[]
  rails: Rail[]
  selectedConnectionId: string | null
  connectingFrom: string | null
  /** Mouse position in panel content coordinates */
  mousePos: { x: number; y: number }
}

export function WireLayer({
  connections, elements, rails, selectedConnectionId, connectingFrom, mousePos,
}: WireLayerProps) {
  const railIndexMap = new Map(rails.map((r, i) => [r.id, i]))

  // Build portId → {x, y, phase} lookup
  const portPosMap = new Map<string, { x: number; y: number; phase: string }>()
  for (const el of elements) {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    if (!def) continue
    const railIdx = railIndexMap.get(el.railId) ?? 0
    for (const p of getPortPositions(el, def, railIdx, 1)) {
      portPosMap.set(p.portId, { x: p.x, y: p.y, phase: p.phase })
    }
  }

  return (
    <Group>
      {/* Existing connections */}
      {connections.map((conn) => {
        const from = portPosMap.get(conn.fromPortId)
        const to = portPosMap.get(conn.toPortId)
        if (!from || !to) return null
        const isSelected = conn.id === selectedConnectionId
        const midY = (from.y + to.y) / 2
        const color = phaseColor(from.phase as never)

        return (
          <Line
            key={conn.id}
            points={[from.x, from.y, from.x, midY, to.x, midY, to.x, to.y]}
            stroke={isSelected ? '#fbbf24' : color}
            strokeWidth={isSelected ? 2.5 : 2}
            dash={isSelected ? undefined : [6, 3]}
            lineJoin="round"
            lineCap="round"
            opacity={isSelected ? 1 : 0.85}
            hitStrokeWidth={10}
            onClick={(e: KonvaEventObject<MouseEvent>) => {
              e.cancelBubble = true
              if (connectingFrom !== null) {
                panelStore.cancelConnecting()
              } else {
                panelStore.selectConnection(conn.id)
              }
            }}
          />
        )
      })}

      {/* Preview wire while connecting */}
      {connectingFrom && (() => {
        const from = portPosMap.get(connectingFrom)
        if (!from) return null
        return (
          <Line
            key="__preview__"
            points={[from.x, from.y, mousePos.x, mousePos.y]}
            stroke="#fbbf24"
            strokeWidth={1.5}
            dash={[5, 3]}
            lineCap="round"
            opacity={0.75}
            listening={false}
          />
        )
      })()}
    </Group>
  )
}
