'use client'

import { Group, Rect, Text, Circle, Arc, Line } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import type { PanelElement, Rail, Connection, ElementTypeId } from '@/lib/types/panel'
import {
  SLOT_WIDTH_PX, ELEMENT_HEIGHT_PX, RAIL_ROW_HEIGHT_PX,
  PANEL_PADDING_PX, SLOT_GAP, ELEMENT_TOP_Y,
  PORT_RADIUS, PORT_HIT_RADIUS,
} from '@/lib/constants/canvasLayout'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { panelStore } from '@/lib/store/panelStore'
import { isWithinRail, hasSlotCollision } from '@/lib/utils/slotUtils'
import { getRelativePorts, phaseColor, phaseLabel } from '@/lib/utils/portUtils'
import { canConnect, isPortConnected } from '@/lib/utils/connectionUtils'

const CIRCUIT_PALETTE = ['#ef4444','#f97316','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

function circuitTagColor(tag: string): string {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h)
  return CIRCUIT_PALETTE[Math.abs(h) % CIRCUIT_PALETTE.length]
}

function getDisplayLabel(element: PanelElement): string {
  const p = element.properties
  if (p.kind === 'mcb' || p.kind === 'rcbo') return `${p.curve}${p.rating}A`
  if (p.kind === 'rcd' || p.kind === 'isolator') return `${p.rating}A`
  if (p.kind === 'voltage_relay') return `${p.minVoltage}–${p.maxVoltage}V`
  return ''
}

/** Small type-specific symbol drawn in the body of the element. */
function TypeSymbol({ typeId, cx, cy, tc }: {
  typeId: ElementTypeId
  cx: number  // center x
  cy: number  // center y
  tc: string  // text/stroke color
}) {
  const op = 0.45
  const fill = tc

  // MCB — arc (trip bimetallic) + two contact dots
  if (typeId.startsWith('mcb_')) {
    return (
      <Group>
        <Circle x={cx - 7} y={cy} radius={2.5} fill={fill} opacity={op} listening={false} />
        <Arc x={cx} y={cy} innerRadius={0} outerRadius={6} angle={180} rotation={0} fill={fill} opacity={op} listening={false} />
        <Circle x={cx + 7} y={cy} radius={2.5} fill={fill} opacity={op} listening={false} />
      </Group>
    )
  }

  // RCD — test button circle with earth lines
  if (typeId === 'rcd_2p' || typeId === 'rcd_4p') {
    return (
      <Group>
        <Circle x={cx} y={cy - 3} radius={5} stroke={fill} strokeWidth={1.5} fill="transparent" opacity={op + 0.1} listening={false} />
        <Line points={[cx, cy + 2, cx, cy + 8]} stroke={fill} strokeWidth={1.5} opacity={op} listening={false} />
        <Line points={[cx - 4, cy + 5, cx + 4, cy + 5]} stroke={fill} strokeWidth={1.5} opacity={op} listening={false} />
        <Line points={[cx - 2, cy + 7, cx + 2, cy + 7]} stroke={fill} strokeWidth={1} opacity={op} listening={false} />
      </Group>
    )
  }

  // RCBO — arc + test circle combined
  if (typeId.startsWith('rcbo_')) {
    return (
      <Group>
        <Arc x={cx - 4} y={cy} innerRadius={0} outerRadius={5} angle={180} rotation={0} fill={fill} opacity={op} listening={false} />
        <Circle x={cx + 6} y={cy} radius={4} stroke={fill} strokeWidth={1.5} fill="transparent" opacity={op + 0.1} listening={false} />
      </Group>
    )
  }

  // Isolator — open contact symbol: — O —
  if (typeId.startsWith('isolator_')) {
    return (
      <Group>
        <Line points={[cx - 10, cy, cx - 4, cy]} stroke={fill} strokeWidth={2} opacity={op} listening={false} />
        <Circle x={cx} y={cy} radius={4} stroke={fill} strokeWidth={1.5} fill="transparent" opacity={op + 0.1} listening={false} />
        <Line points={[cx + 4, cy, cx + 10, cy]} stroke={fill} strokeWidth={2} opacity={op} listening={false} />
      </Group>
    )
  }

  // Main switch — power ring with vertical bar
  if (typeId.startsWith('main_switch_')) {
    return (
      <Group>
        <Arc x={cx} y={cy + 2} innerRadius={6} outerRadius={8} angle={300} rotation={120} stroke={fill} strokeWidth={0} fill={fill} opacity={op + 0.15} listening={false} />
        <Line points={[cx, cy - 8, cx, cy - 3]} stroke={fill} strokeWidth={2.5} lineCap="round" opacity={op + 0.15} listening={false} />
      </Group>
    )
  }

  // Cross connector — plus / cross symbol
  if (typeId === 'cross_2p') {
    return (
      <Group>
        <Line points={[cx, cy - 9, cx, cy + 9]} stroke={fill} strokeWidth={2} opacity={op} listening={false} />
        <Line points={[cx - 9, cy, cx + 9, cy]} stroke={fill} strokeWidth={2} opacity={op} listening={false} />
        <Circle x={cx - 6} y={cy - 6} radius={2} fill={fill} opacity={op - 0.05} listening={false} />
        <Circle x={cx + 6} y={cy - 6} radius={2} fill={fill} opacity={op - 0.05} listening={false} />
        <Circle x={cx - 6} y={cy + 6} radius={2} fill={fill} opacity={op - 0.05} listening={false} />
        <Circle x={cx + 6} y={cy + 6} radius={2} fill={fill} opacity={op - 0.05} listening={false} />
      </Group>
    )
  }

  // Contactor — coil symbol
  if (typeId === 'contactor_3p') {
    return (
      <Group>
        <Rect x={cx - 7} y={cy - 5} width={14} height={10} stroke={fill} strokeWidth={1.5} fill="transparent" opacity={op} cornerRadius={2} listening={false} />
        <Line points={[cx - 4, cy - 5, cx - 4, cy + 5, cx, cy - 5, cx, cy + 5, cx + 4, cy - 5, cx + 4, cy + 5]} stroke={fill} strokeWidth={1} opacity={op} listening={false} />
      </Group>
    )
  }

  // Timer — clock circle
  if (typeId === 'timer') {
    return (
      <Group>
        <Circle x={cx} y={cy} radius={7} stroke={fill} strokeWidth={1.5} fill="transparent" opacity={op} listening={false} />
        <Line points={[cx, cy, cx, cy - 4]} stroke={fill} strokeWidth={1.5} opacity={op + 0.1} listening={false} />
        <Line points={[cx, cy, cx + 3, cy + 2]} stroke={fill} strokeWidth={1.5} opacity={op + 0.1} listening={false} />
      </Group>
    )
  }

  // SPD — lightning bolt
  if (typeId === 'surge_protector') {
    return (
      <Line
        points={[cx + 3, cy - 8, cx - 2, cy - 1, cx + 2, cy - 1, cx - 3, cy + 8]}
        stroke={fill} strokeWidth={2} lineCap="round" lineJoin="round"
        opacity={op + 0.1} listening={false}
      />
    )
  }

  // Neutral / Earth bar — horizontal stacked bars
  if (typeId === 'neutral_bar' || typeId === 'earth_bar') {
    const ys = typeId === 'earth_bar' ? [cy - 4, cy + 1, cy + 5] : [cy - 3, cy + 3]
    const widths = typeId === 'earth_bar' ? [12, 8, 4] : [12, 12]
    return (
      <Group>
        {ys.map((y, i) => (
          <Line
            key={i}
            points={[cx - widths[i] / 2, y, cx + widths[i] / 2, y]}
            stroke={fill} strokeWidth={2} lineCap="round"
            opacity={op} listening={false}
          />
        ))}
      </Group>
    )
  }

  // Voltage relay — gauge arc + needle + "V"
  if (typeId === 'voltage_relay') {
    return (
      <Group>
        <Arc x={cx} y={cy + 2} innerRadius={6} outerRadius={8} angle={180} rotation={180} stroke={fill} strokeWidth={0} fill={fill} opacity={op} listening={false} />
        <Line points={[cx, cy + 2, cx - 4, cy - 4]} stroke={fill} strokeWidth={2} lineCap="round" opacity={op + 0.2} listening={false} />
        <Text text="V" x={cx - 3} y={cy - 3} fontSize={7} fontStyle="bold" fill={fill} opacity={op + 0.3} listening={false} />
      </Group>
    )
  }

  // Busbar — horizontal line with connection pins
  if (typeId === 'busbar_connector') {
    return (
      <Group>
        <Line points={[cx - 10, cy, cx + 10, cy]} stroke={fill} strokeWidth={3} opacity={op} listening={false} />
        {[-6, 0, 6].map((dx) => (
          <Line key={dx} points={[cx + dx, cy, cx + dx, cy + 6]} stroke={fill} strokeWidth={1.5} opacity={op} listening={false} />
        ))}
      </Group>
    )
  }

  return null
}

interface ElementShapeProps {
  element: PanelElement
  railIndex: number
  rails: Rail[]
  allElements: PanelElement[]
  allConnections: Connection[]
  isSelected: boolean
  isMultiSelected: boolean
  isDimmed?: boolean
  connectingFrom: string | null
  onSingleSelect: (id: string) => void
  onShiftClick: (id: string) => void
  onHover?: (id: string, clientX: number, clientY: number) => void
  onHoverEnd?: () => void
}

export function ElementShape({
  element, railIndex, rails, allElements, allConnections, isSelected, isMultiSelected, isDimmed = false, connectingFrom, onSingleSelect, onShiftClick, onHover, onHoverEnd,
}: ElementShapeProps) {
  const def = ELEMENT_DEFS_MAP.get(element.typeId)
  if (!def) return null

  const x = PANEL_PADDING_PX + element.slotStart * SLOT_WIDTH_PX
  const y = PANEL_PADDING_PX + railIndex * RAIL_ROW_HEIGHT_PX + ELEMENT_TOP_Y
  const w = element.slotWidth * SLOT_WIDTH_PX - SLOT_GAP
  const h = ELEMENT_HEIGHT_PX

  const displayLabel = getDisplayLabel(element)
  const userLabel = element.label
  const isRcd = element.typeId.startsWith('rcd_') || element.typeId.startsWith('rcbo_')
  const isMainSwitch = element.typeId.startsWith('main_switch_')
  const headerH = isMainSwitch ? 18 : 15
  const fontSize = Math.min(13, Math.max(7, w / (element.slotWidth > 1 ? 3 : 2.2)))

  // Symbol sits in the middle of the body (between header and display label)
  const symbolCY = headerH + (h - headerH - (displayLabel ? 18 : 0) - (userLabel ? 14 : 0)) / 2

  const relativePorts = getRelativePorts(element, def)
  const isConnecting = connectingFrom !== null

  const handleClick = (e: KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    if (isConnecting) return
    if (e.evt.shiftKey) {
      onShiftClick(element.id)
    } else {
      onSingleSelect(element.id)
    }
  }

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true
    panelStore.selectElement(element.id)
    ;(e.target as Konva.Node).moveToTop()
  }

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Node
    const absX = node.x()
    const absY = node.y()

    const rawRailIdx = Math.round((absY - PANEL_PADDING_PX - ELEMENT_TOP_Y) / RAIL_ROW_HEIGHT_PX)
    const clampedRailIdx = Math.max(0, Math.min(rails.length - 1, rawRailIdx))
    const targetRail = rails[clampedRailIdx]

    const slotStart = Math.max(0, Math.floor((absX - PANEL_PADDING_PX) / SLOT_WIDTH_PX))

    const valid =
      !!targetRail &&
      isWithinRail(targetRail, slotStart, element.slotWidth) &&
      !hasSlotCollision(allElements, targetRail.id, slotStart, element.slotWidth, element.id)

    if (valid) {
      node.position({
        x: PANEL_PADDING_PX + slotStart * SLOT_WIDTH_PX,
        y: PANEL_PADDING_PX + clampedRailIdx * RAIL_ROW_HEIGHT_PX + ELEMENT_TOP_Y,
      })
      node.getLayer()?.batchDraw()
      panelStore.moveElement(element.id, targetRail.id, slotStart)
    } else {
      const origRailIdx = rails.findIndex((r) => r.id === element.railId)
      node.position({
        x: PANEL_PADDING_PX + element.slotStart * SLOT_WIDTH_PX,
        y: PANEL_PADDING_PX + origRailIdx * RAIL_ROW_HEIGHT_PX + ELEMENT_TOP_Y,
      })
      node.getLayer()?.batchDraw()
    }
  }

  return (
    <Group
      x={x}
      y={y}
      width={w}
      height={h}
      opacity={isDimmed ? 0.2 : 1}
      draggable={!isConnecting}
      onClick={handleClick}
      onMouseDown={(e: KonvaEventObject<MouseEvent>) => { e.cancelBubble = true }}
      onDblClick={(e: KonvaEventObject<MouseEvent>) => { e.cancelBubble = true }}
      onMouseEnter={(e: KonvaEventObject<MouseEvent>) => {
        const container = e.target.getStage()?.container()
        if (container) {
          const rect = container.getBoundingClientRect()
          onHover?.(element.id, e.evt.clientX - rect.left, e.evt.clientY - rect.top)
        }
      }}
      onMouseLeave={() => onHoverEnd?.()}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {/* Body */}
      <Rect
        width={w} height={h}
        fill={def.color}
        cornerRadius={isMainSwitch ? 6 : 4}
        shadowColor="rgba(0,0,0,0.4)"
        shadowBlur={isMainSwitch ? 10 : 6}
        shadowOffsetY={2}
        shadowEnabled
      />

      {/* Circuit tag stripe — left edge */}
      {element.circuitTag && (
        <Rect
          x={0} y={0}
          width={4} height={h}
          fill={circuitTagColor(element.circuitTag)}
          cornerRadius={[isMainSwitch ? 6 : 4, 0, 0, isMainSwitch ? 6 : 4]}
          listening={false}
        />
      )}

      {/* Main switch extra outer ring */}
      {isMainSwitch && (
        <Rect
          x={-2} y={-2}
          width={w + 4} height={h + 4}
          stroke="#fca5a5"
          strokeWidth={1.5}
          fill="transparent"
          cornerRadius={7}
          listening={false}
        />
      )}

      {/* Header strip */}
      <Rect
        width={w} height={headerH}
        fill="rgba(0,0,0,0.35)"
        cornerRadius={[isMainSwitch ? 6 : 4, isMainSwitch ? 6 : 4, 0, 0]}
        listening={false}
      />

      {/* Short type label */}
      <Text
        x={0} y={isMainSwitch ? 3 : 2}
        width={w}
        text={def.shortLabel}
        fontSize={Math.min(isMainSwitch ? 11 : 9, Math.max(6, w / 3.5))}
        fontStyle="bold"
        fill={def.textColor}
        align="center"
        listening={false}
      />

      {/* Type-specific symbol */}
      <TypeSymbol typeId={element.typeId} cx={w / 2} cy={symbolCY} tc={def.textColor} />

      {/* Main value label */}
      {displayLabel !== '' && (
        <Text
          x={2} y={headerH + 4}
          width={w - 4}
          text={displayLabel}
          fontSize={fontSize}
          fontStyle="bold"
          fill={def.textColor}
          align="center"
          listening={false}
        />
      )}

      {/* User label */}
      {userLabel && (
        <Text
          x={2} y={h - 16}
          width={w - 4}
          text={userLabel}
          fontSize={Math.min(8, Math.max(6, w / 4.5))}
          fill={def.textColor}
          opacity={0.75}
          align="center"
          ellipsis
          wrap="none"
          listening={false}
        />
      )}

      {/* RCD/RCBO bottom stripe */}
      {isRcd && (
        <Rect
          x={0} y={h - 5}
          width={w} height={5}
          fill="#f59e0b"
          cornerRadius={[0, 0, 4, 4]}
          listening={false}
        />
      )}

      {/* Notes indicator dot */}
      {element.notes && (
        <Circle
          x={w - 5} y={5}
          radius={4}
          fill="#fbbf24"
          stroke="#fff"
          strokeWidth={1}
          listening={false}
        />
      )}

      {/* Multi-select ring */}
      {isMultiSelected && (
        <Rect
          x={-2} y={-2}
          width={w + 4} height={h + 4}
          stroke="#3b82f6"
          strokeWidth={2.5}
          fill="rgba(59,130,246,0.08)"
          cornerRadius={5}
          listening={false}
        />
      )}

      {/* Selection ring */}
      {isSelected && (
        <Rect
          x={-2} y={-2}
          width={w + 4} height={h + 4}
          stroke="#fbbf24"
          strokeWidth={2.5}
          fill="transparent"
          cornerRadius={5}
          listening={false}
        />
      )}

      {/* Ports */}
      {relativePorts.map((port) => {
        const isActiveFrom = connectingFrom === port.portId
        const isCompatible =
          isConnecting && !isActiveFrom && canConnect(connectingFrom!, port.portId, allConnections)
        const isOccupied = isPortConnected(allConnections, port.portId)

        let fill: string
        if (isActiveFrom) fill = '#fbbf24'
        else if (isCompatible) fill = '#22c55e'
        else if (isConnecting) fill = '#94a3b8'
        else fill = phaseColor(port.phase)

        return (
          <Group
            key={port.portId}
            x={port.relX}
            y={port.relY}
            onClick={(e: KonvaEventObject<MouseEvent>) => {
              e.cancelBubble = true
              panelStore.handlePortClick(port.portId)
            }}
          >
            <Circle
              radius={PORT_RADIUS}
              fill={fill}
              stroke={isActiveFrom ? '#fff' : isOccupied ? '#ffffff' : 'rgba(0,0,0,0.5)'}
              strokeWidth={isActiveFrom ? 2 : 1}
              hitRadius={PORT_HIT_RADIUS}
              opacity={isConnecting && !isActiveFrom && !isCompatible ? 0.45 : 1}
            />
            <Text
              text={phaseLabel(port.phase)}
              fontSize={6}
              fill={isConnecting ? fill : phaseColor(port.phase)}
              align="center"
              width={12}
              x={-6}
              y={port.side === 'top' ? -(PORT_RADIUS + 9) : PORT_RADIUS + 3}
              listening={false}
            />
          </Group>
        )
      })}
    </Group>
  )
}
