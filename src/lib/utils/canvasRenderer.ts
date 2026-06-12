import type { Panel, PanelElement, Connection } from '../types/panel'
import type { ElementDef } from '../constants/elementDefs'
import { SLOT_WIDTH_PX, ELEMENT_HEIGHT_PX, RAIL_ROW_HEIGHT_PX, PANEL_PADDING_PX } from '../constants/canvasLayout'
import { ELEMENT_DEFS_MAP } from '../constants/elementDefs'

export interface RenderOptions {
  scale: number
  showGrid: boolean
  showLabels: boolean
  showPorts: boolean
  selectedElementId: string | null
  highlightedPortId: string | null
}
import { sortedElementsOnRail } from './slotUtils'
import { getPortPositions, phaseColor } from './portUtils'
import { isPortConnected } from './connectionUtils'

const RAIL_TRACK_HEIGHT = 8
const CORNER_RADIUS = 4
const PORT_RADIUS = 5

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function drawRail(
  ctx: CanvasRenderingContext2D,
  rail: { id: string; label: string; slotCount: number },
  railIndex: number,
  scale: number,
  options: RenderOptions
) {
  const railY = PANEL_PADDING_PX + railIndex * RAIL_ROW_HEIGHT_PX
  const trackY = railY + (RAIL_ROW_HEIGHT_PX - RAIL_TRACK_HEIGHT) / 2
  const totalWidth = rail.slotCount * SLOT_WIDTH_PX * scale

  // Rail background
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(PANEL_PADDING_PX, railY, totalWidth, RAIL_ROW_HEIGHT_PX)

  // Grid lines
  if (options.showGrid) {
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= rail.slotCount; i++) {
      const x = PANEL_PADDING_PX + i * SLOT_WIDTH_PX * scale
      ctx.beginPath()
      ctx.moveTo(x, railY)
      ctx.lineTo(x, railY + RAIL_ROW_HEIGHT_PX)
      ctx.stroke()
    }
    ctx.strokeStyle = '#e5e7eb'
    ctx.beginPath()
    ctx.moveTo(PANEL_PADDING_PX, railY)
    ctx.lineTo(PANEL_PADDING_PX + totalWidth, railY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(PANEL_PADDING_PX, railY + RAIL_ROW_HEIGHT_PX)
    ctx.lineTo(PANEL_PADDING_PX + totalWidth, railY + RAIL_ROW_HEIGHT_PX)
    ctx.stroke()
  }

  // DIN rail track
  ctx.fillStyle = '#9ca3af'
  ctx.fillRect(PANEL_PADDING_PX, trackY, totalWidth, RAIL_TRACK_HEIGHT)

  // Rail label
  if (options.showLabels && rail.label) {
    ctx.fillStyle = '#6b7280'
    ctx.font = `11px system-ui, sans-serif`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(rail.label, PANEL_PADDING_PX, railY + 3)
  }
}

function drawElement(
  ctx: CanvasRenderingContext2D,
  element: PanelElement,
  def: ElementDef,
  railIndex: number,
  scale: number,
  options: RenderOptions,
  connections: Connection[]
) {
  const railY = PANEL_PADDING_PX + railIndex * RAIL_ROW_HEIGHT_PX
  const x = PANEL_PADDING_PX + element.slotStart * SLOT_WIDTH_PX * scale
  const w = element.slotWidth * SLOT_WIDTH_PX * scale
  const elemH = ELEMENT_HEIGHT_PX
  const y = railY + (RAIL_ROW_HEIGHT_PX - elemH) / 2

  const isSelected = options.selectedElementId === element.id

  // Element body
  ctx.save()
  roundRect(ctx, x + 1, y + 1, w - 2, elemH - 2, CORNER_RADIUS)
  ctx.fillStyle = def.color
  ctx.fill()

  // Selection ring
  if (isSelected) {
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2.5
    ctx.stroke()
  } else {
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.stroke()
  }
  ctx.restore()

  // Short label top
  if (options.showLabels) {
    ctx.save()
    ctx.fillStyle = def.textColor
    ctx.font = `bold ${Math.min(11, (w - 4) / 2)}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText(def.shortLabel, x + w / 2, y + 5)
    ctx.restore()
  }

  // Main label (user label or rating)
  if (options.showLabels) {
    const displayLabel = element.label || getDefaultElementLabel(element, def)
    ctx.save()
    ctx.fillStyle = def.textColor
    ctx.font = `${Math.min(10, (w - 4) / 3.5)}px system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    // Clip to element bounds
    ctx.beginPath()
    ctx.rect(x + 2, y, w - 4, elemH)
    ctx.clip()
    ctx.fillText(displayLabel, x + w / 2, y + elemH / 2 + 8)
    ctx.restore()
  }

  // Ports
  if (options.showPorts) {
    const portPositions = getPortPositions(element, def, railIndex, scale)
    for (const pp of portPositions) {
      const isHighlighted = options.highlightedPortId === pp.portId
      const isConnected = isPortConnected(connections, pp.portId)

      ctx.save()
      ctx.beginPath()
      ctx.arc(pp.x, pp.y, PORT_RADIUS, 0, Math.PI * 2)
      ctx.fillStyle = isConnected ? phaseColor(pp.phase) : '#ffffff'
      ctx.fill()
      ctx.strokeStyle = isHighlighted ? '#fbbf24' : phaseColor(pp.phase)
      ctx.lineWidth = isHighlighted ? 2.5 : 1.5
      ctx.stroke()
      ctx.restore()
    }
  }
}

function drawConnections(
  ctx: CanvasRenderingContext2D,
  panel: Panel,
  connections: Connection[],
  scale: number,
  options: RenderOptions
) {
  const railIndexMap = new Map(panel.rails.map((r, i) => [r.id, i]))

  const portPosCache = new Map<string, { x: number; y: number }>()
  for (const el of panel.elements) {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    if (!def) continue
    const railIdx = railIndexMap.get(el.railId) ?? 0
    const positions = getPortPositions(el, def, railIdx, scale)
    for (const pp of positions) {
      portPosCache.set(pp.portId, { x: pp.x, y: pp.y })
    }
  }

  for (const conn of connections) {
    const fromPos = portPosCache.get(conn.fromPortId)
    const toPos = portPosCache.get(conn.toPortId)
    if (!fromPos || !toPos) continue

    ctx.save()
    ctx.beginPath()
    const cpY = (fromPos.y + toPos.y) / 2
    ctx.moveTo(fromPos.x, fromPos.y)
    ctx.bezierCurveTo(fromPos.x, cpY, toPos.x, cpY, toPos.x, toPos.y)
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 1.5
    ctx.setLineDash([4, 2])
    ctx.stroke()
    ctx.restore()
  }
}

function getDefaultElementLabel(element: PanelElement, def: ElementDef): string {
  const props = element.properties
  if (props.kind === 'mcb' || props.kind === 'rcbo') {
    return `${props.curve}${props.rating}A`
  }
  if (props.kind === 'rcd' || props.kind === 'isolator') {
    return `${props.rating}A`
  }
  if (props.kind === 'voltage_relay') {
    return `${props.minVoltage}–${props.maxVoltage}V`
  }
  return def.shortLabel
}

export function measureCanvas(panel: Panel, scale: number): { width: number; height: number } {
  const maxSlots = Math.max(...panel.rails.map((r) => r.slotCount), 12)
  const width = PANEL_PADDING_PX * 2 + maxSlots * SLOT_WIDTH_PX * scale
  const height = PANEL_PADDING_PX * 2 + panel.rails.length * RAIL_ROW_HEIGHT_PX
  return { width: Math.max(width, 400), height: Math.max(height, 200) }
}

export function renderPanel(
  ctx: CanvasRenderingContext2D,
  panel: Panel,
  options: RenderOptions
) {
  const { width, height } = measureCanvas(panel, options.scale)

  // Background
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // Panel border
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 1
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1)

  for (let i = 0; i < panel.rails.length; i++) {
    drawRail(ctx, panel.rails[i], i, options.scale, options)
  }

  const railIndexMap = new Map(panel.rails.map((r, idx) => [r.id, idx]))

  for (const el of panel.elements) {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    if (!def) continue
    const railIdx = railIndexMap.get(el.railId) ?? 0
    drawElement(ctx, el, def, railIdx, options.scale, options, panel.connections)
  }

  if (options.showPorts) {
    drawConnections(ctx, panel, panel.connections, options.scale, options)
  }
}

export function renderElementPreview(
  ctx: CanvasRenderingContext2D,
  typeId: string,
  width: number,
  height: number
) {
  const def = ELEMENT_DEFS_MAP.get(typeId as Parameters<typeof ELEMENT_DEFS_MAP.get>[0])
  if (!def) return

  ctx.clearRect(0, 0, width, height)
  roundRect(ctx, 2, 2, width - 4, height - 4, CORNER_RADIUS)
  ctx.fillStyle = def.color
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.2)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = def.textColor
  ctx.font = `bold 11px system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(def.shortLabel, width / 2, height / 2)
}
