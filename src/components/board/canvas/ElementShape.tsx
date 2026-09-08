'use client'

import { Group, Rect, Text, Circle } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type Konva from 'konva'
import type { PanelElement, Rail, Connection } from '@/lib/types/panel'
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
import { circuitTagColor } from '@/lib/utils/circuitTagColor'
import { renderSymbol } from './symbols'

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

  const userLabel = element.label
  const isRcd = def.symbolId === 'rcd' || def.symbolId === 'rcbo'
  const isMainSwitch = def.symbolId === 'main_switch'
  const headerH = isMainSwitch ? 14 : 12
  const footerH = userLabel ? 12 : 0
  const bodyRadius = isMainSwitch ? 6 : 4

  // Face area for the symbol renderer (below header, above footer)
  const faceY = headerH
  const faceH = h - headerH - footerH

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
      {/* Plastic body (base fill) */}
      <Rect
        width={w} height={h}
        fill={def.color}
        cornerRadius={bodyRadius}
        shadowColor="rgba(0,0,0,0.45)"
        shadowBlur={isMainSwitch ? 10 : 6}
        shadowOffsetY={2}
        shadowEnabled
      />
      {/* Plastic sheen — subtle vertical gradient overlay */}
      <Rect
        width={w} height={h}
        cornerRadius={bodyRadius}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: h }}
        fillLinearGradientColorStops={[0, 'rgba(255,255,255,0.25)', 0.4, 'rgba(255,255,255,0.05)', 0.7, 'rgba(0,0,0,0.08)', 1, 'rgba(0,0,0,0.28)']}
        listening={false}
      />

      {/* Circuit tag stripe — left edge */}
      {element.circuitTag && (
        <Rect
          x={0} y={0}
          width={4} height={h}
          fill={circuitTagColor(element.circuitTag)}
          cornerRadius={[bodyRadius, 0, 0, bodyRadius]}
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

      {/* Header strip — brand/model band */}
      <Rect
        width={w} height={headerH}
        fill="rgba(0,0,0,0.4)"
        cornerRadius={[bodyRadius, bodyRadius, 0, 0]}
        listening={false}
      />
      <Text
        x={0} y={2.5}
        width={w}
        text={def.shortLabel}
        fontSize={Math.min(8, Math.max(5.5, w / 4.5))}
        fontStyle="bold"
        fill={def.textColor}
        align="center"
        opacity={0.95}
        listening={false}
      />

      {/* Faceplate — delegated to the symbol registry (renders full device face) */}
      <Group x={0} y={faceY} listening={false}>
        {renderSymbol(def.symbolId, {
          cx: w / 2,
          cy: faceH / 2,
          w,
          h: faceH,
          tc: def.textColor,
          bg: def.color,
          props: element.properties,
        })}
      </Group>

      {/* User label / silkscreen at the bottom */}
      {userLabel && (
        <>
          <Rect
            x={0} y={h - footerH}
            width={w} height={footerH}
            fill="rgba(0,0,0,0.25)"
            cornerRadius={[0, 0, bodyRadius, bodyRadius]}
            listening={false}
          />
          <Text
            x={2} y={h - footerH + 2}
            width={w - 4}
            text={userLabel}
            fontSize={Math.min(8, Math.max(6, w / 4.5))}
            fill={def.textColor}
            opacity={0.9}
            align="center"
            ellipsis
            wrap="none"
            listening={false}
          />
        </>
      )}

      {/* RCD/RCBO amber signature stripe */}
      {isRcd && (
        <Rect
          x={0} y={h - footerH - 2}
          width={w} height={2}
          fill="#f59e0b"
          listening={false}
        />
      )}

      {/* Phase badge — top-right corner */}
      {element.phase && (() => {
        const phBg = element.phase === 'L1' ? '#ef4444' : element.phase === 'L2' ? '#f59e0b' : '#3b82f6'
        const badgeW = 14
        return (
          <Group x={w - badgeW - 2} y={2} listening={false}>
            <Rect width={badgeW} height={10} fill={phBg} cornerRadius={3} />
            <Text text={element.phase} fontSize={6} fontStyle="bold" fill="#fff" width={badgeW} align="center" y={1.5} />
          </Group>
        )
      })()}

      {/* Notes indicator dot */}
      {element.notes && (
        <Circle
          x={element.phase ? w - 21 : w - 5} y={5}
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
