'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import type Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { Panel, ElementTypeId } from '@/lib/types/panel'
import {
  SLOT_WIDTH_PX, RAIL_ROW_HEIGHT_PX, PANEL_PADDING_PX, ELEMENT_HEIGHT_PX, ELEMENT_TOP_Y, SLOT_GAP,
} from '@/lib/constants/canvasLayout'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { hasSlotCollision, isWithinRail } from '@/lib/utils/slotUtils'
import { RailRow } from './canvas/RailRow'
import { ElementShape } from './canvas/ElementShape'
import { WireLayer } from './canvas/WireLayer'
import { DragPreviewLayer } from './DragPreviewLayer'

interface DropHighlight {
  railId: string
  railIndex: number
  slotStart: number
  valid: boolean
}

function getRailAndSlot(
  px: number,
  py: number,
  panel: Panel
): { railId: string; railIndex: number; slotStart: number } | null {
  for (let i = 0; i < panel.rails.length; i++) {
    const railY = PANEL_PADDING_PX + i * RAIL_ROW_HEIGHT_PX
    if (py >= railY && py < railY + RAIL_ROW_HEIGHT_PX) {
      const slotStart = Math.floor((px - PANEL_PADDING_PX) / SLOT_WIDTH_PX)
      return { railId: panel.rails[i].id, railIndex: i, slotStart }
    }
  }
  return null
}

interface RubberBand { x1: number; y1: number; x2: number; y2: number }

interface PanelCanvasProps {
  panel: Panel
  draggingTypeId: ElementTypeId | null
  onDragEnd: () => void
  className?: string
  selectedElementIds: Set<string>
  onMultiSelectChange: (ids: Set<string>) => void
  annotationMode: boolean
}

export function PanelCanvas({ panel, draggingTypeId, onDragEnd, className = '', selectedElementIds, onMultiSelectChange, annotationMode }: PanelCanvasProps) {
  const stageRef = useRef<Konva.Stage | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { zoom, pan, selectedElementId, selectedConnectionId, selectedAnnotationId, connectingFrom } = usePanelStore()
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [canvasMousePos, setCanvasMousePos] = useState({ x: 0, y: 0 })
  const [dropHighlight, setDropHighlight] = useState<DropHighlight | null>(null)
  const [rubberBand, setRubberBand] = useState<RubberBand | null>(null)
  const rbRef = useRef<RubberBand | null>(null)
  const wasRubberBandingRef = useRef(false)

  // Observe container size for Stage dimensions
  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setContainerSize({ w: Math.max(width, 1), h: Math.max(height, 1) })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Wheel handler (passive: false so we can prevent default)
  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      if (e.evt.ctrlKey || e.evt.metaKey) {
        const delta = e.evt.deltaY > 0 ? -0.1 : 0.1
        panelStore.setZoom(zoom + delta)
      } else {
        panelStore.setPan({ x: pan.x - e.evt.deltaX, y: pan.y - e.evt.deltaY })
      }
    },
    [zoom, pan]
  )

  // Click on empty canvas → cancel connecting or deselect
  const handleStageClick = useCallback(() => {
    if (wasRubberBandingRef.current) {
      wasRubberBandingRef.current = false
      return
    }
    panelStore.cancelConnecting()
    panelStore.selectElement(null)
    onMultiSelectChange(new Set())
  }, [onMultiSelectChange])

  // Track canvas content coordinates for wire preview and rubber-band
  const handleStageMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (connectingFrom) {
        const container = stageRef.current?.container()
        if (container) {
          const rect = container.getBoundingClientRect()
          setCanvasMousePos({
            x: (e.evt.clientX - rect.left - pan.x) / zoom,
            y: (e.evt.clientY - rect.top - pan.y) / zoom,
          })
        }
      }
      if (rbRef.current) {
        const stage = stageRef.current
        if (!stage) return
        const pos = stage.getPointerPosition()
        if (!pos) return
        const r = { ...rbRef.current, x2: (pos.x - pan.x) / zoom, y2: (pos.y - pan.y) / zoom }
        rbRef.current = r
        setRubberBand({ ...r })
      }
    },
    [connectingFrom, pan, zoom]
  )

  function handleStageMouseDown() {
    if (connectingFrom || annotationMode) return
    const stage = stageRef.current
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    const r: RubberBand = {
      x1: (pos.x - pan.x) / zoom, y1: (pos.y - pan.y) / zoom,
      x2: (pos.x - pan.x) / zoom, y2: (pos.y - pan.y) / zoom,
    }
    rbRef.current = r
    setRubberBand(r)
  }

  function handleStageDblClick(e: KonvaEventObject<MouseEvent>) {
    if (!annotationMode) return
    const stage = stageRef.current
    if (!stage) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    const x = (pos.x - pan.x) / zoom
    const y = (pos.y - pan.y) / zoom
    const text = window.prompt('Annotation text:')
    if (text === null || text.trim() === '') return
    panelStore.addAnnotation(x, y, text.trim())
  }

  function handleStageMouseUp() {
    const r = rbRef.current
    rbRef.current = null
    setRubberBand(null)
    if (!r) return
    const dx = Math.abs(r.x2 - r.x1)
    const dy = Math.abs(r.y2 - r.y1)
    if (dx < 6 && dy < 6) return

    wasRubberBandingRef.current = true
    const x1 = Math.min(r.x1, r.x2)
    const y1 = Math.min(r.y1, r.y2)
    const x2 = Math.max(r.x1, r.x2)
    const y2 = Math.max(r.y1, r.y2)
    const selected = new Set<string>()
    for (const el of panel.elements) {
      const ex = PANEL_PADDING_PX + el.slotStart * SLOT_WIDTH_PX
      const ey = PANEL_PADDING_PX + (railIndexMap.get(el.railId) ?? 0) * RAIL_ROW_HEIGHT_PX + ELEMENT_TOP_Y
      const ew = el.slotWidth * SLOT_WIDTH_PX - SLOT_GAP
      const eh = ELEMENT_HEIGHT_PX
      if (ex < x2 && ex + ew > x1 && ey < y2 && ey + eh > y1) selected.add(el.id)
    }
    if (selected.size > 0) {
      onMultiSelectChange(selected)
      panelStore.selectElement(null)
    }
    wrapperRef.current?.focus({ preventScroll: true })
  }

  // ── HTML drag-from-palette events ──────────────────────────────────────────

  function stageCoords(clientX: number, clientY: number): { x: number; y: number } {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }
    const container = stage.container()
    const rect = container.getBoundingClientRect()
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (!draggingTypeId) return
    const def = ELEMENT_DEFS_MAP.get(draggingTypeId)
    if (!def) return
    const pos = stageCoords(e.clientX, e.clientY)
    setMousePos({ x: e.clientX, y: e.clientY })
    const hit = getRailAndSlot(pos.x, pos.y, panel)
    if (hit) {
      const rail = panel.rails.find((r) => r.id === hit.railId)
      const valid =
        !!rail &&
        isWithinRail(rail, hit.slotStart, def.defaultSlotWidth) &&
        !hasSlotCollision(panel.elements, hit.railId, hit.slotStart, def.defaultSlotWidth)
      setDropHighlight({ ...hit, valid })
    } else {
      setDropHighlight(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    if (!draggingTypeId) return
    const def = ELEMENT_DEFS_MAP.get(draggingTypeId)
    if (!def) return
    const pos = stageCoords(e.clientX, e.clientY)
    const hit = getRailAndSlot(pos.x, pos.y, panel)
    if (hit) {
      const rail = panel.rails.find((r) => r.id === hit.railId)
      if (
        rail &&
        isWithinRail(rail, hit.slotStart, def.defaultSlotWidth) &&
        !hasSlotCollision(panel.elements, hit.railId, hit.slotStart, def.defaultSlotWidth)
      ) {
        panelStore.addElement({
          typeId: draggingTypeId,
          railId: hit.railId,
          slotStart: hit.slotStart,
          slotWidth: def.defaultSlotWidth,
          label: def.defaultLabel,
          notes: '',
          properties: { ...def.defaultProperties },
        })
      }
    }
    setDropHighlight(null)
    onDragEnd()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement === wrapperRef.current) {
        if (selectedElementIds.size > 0) {
          selectedElementIds.forEach(id => panelStore.deleteElement(id))
          onMultiSelectChange(new Set())
        } else if (selectedElementId) {
          panelStore.deleteElement(selectedElementId)
        } else if (selectedConnectionId) {
          panelStore.deleteConnection(selectedConnectionId)
        } else if (selectedAnnotationId) {
          panelStore.deleteAnnotation(selectedAnnotationId)
        }
      }
    }
    if (e.key === 'Escape') {
      panelStore.cancelConnecting()
      panelStore.selectElement(null)
      panelStore.selectAnnotation(null)
      onMultiSelectChange(new Set())
    }
  }

  // Canvas content dimensions
  const maxSlots = Math.max(...panel.rails.map((r) => r.slotCount), 12)
  const canvasW = PANEL_PADDING_PX * 2 + maxSlots * SLOT_WIDTH_PX
  const canvasH = PANEL_PADDING_PX * 2 + panel.rails.length * RAIL_ROW_HEIGHT_PX

  // Build rail index map for elements
  const railIndexMap = new Map(panel.rails.map((r, i) => [r.id, i]))

  // Per-rail drop highlights (only pass to the matching rail)
  function dropHighlightForRail(railId: string) {
    if (!dropHighlight || dropHighlight.railId !== railId) return null
    return { slotStart: dropHighlight.slotStart, valid: dropHighlight.valid }
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className={['relative overflow-hidden bg-slate-100 dark:bg-zinc-900', className].join(' ')}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => setDropHighlight(null)}
        style={{ cursor: connectingFrom ? 'crosshair' : draggingTypeId ? 'copy' : annotationMode ? 'text' : 'default' }}
      >
        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-700 rounded-lg px-1.5 py-1 shadow-sm backdrop-blur-sm">
          <button
            onClick={() => panelStore.setZoom(zoom * 1.25)}
            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-bold rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            +
          </button>
          <button
            onClick={() => panelStore.resetView()}
            className="text-[10px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors tabular-nums min-w-[36px] text-center"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={() => panelStore.setZoom(zoom / 1.25)}
            className="w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white text-sm font-bold rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            −
          </button>
        </div>

        {/* Connecting mode banner */}
        {connectingFrom && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-amber-400 text-amber-900 text-xs font-semibold px-3 py-1 rounded-full shadow pointer-events-none">
            Click a compatible port to connect — Esc to cancel
          </div>
        )}

        {/* Annotation mode banner */}
        {annotationMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-yellow-300 text-yellow-900 text-xs font-semibold px-3 py-1 rounded-full shadow pointer-events-none">
            Double-click anywhere to add a note — click a note to select/edit
          </div>
        )}

        <Stage
          ref={stageRef}
          width={containerSize.w}
          height={containerSize.h}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onDblClick={handleStageDblClick}
        >
          <Layer>
            <Group x={pan.x} y={pan.y} scaleX={zoom} scaleY={zoom}>
              {/* Panel background */}
              <Rect x={0} y={0} width={canvasW} height={canvasH} fill="#ffffff" />
              <Rect
                x={0.5} y={0.5}
                width={canvasW - 1} height={canvasH - 1}
                stroke="#d1d5db" strokeWidth={1}
                fill="transparent"
                listening={false}
              />

              {/* Rail rows */}
              {panel.rails.map((rail, i) => (
                <RailRow
                  key={rail.id}
                  rail={rail}
                  railIndex={i}
                  elements={panel.elements}
                  draggingTypeId={draggingTypeId}
                  dropHighlight={dropHighlightForRail(rail.id)}
                />
              ))}

              {/* Wires (rendered above rails, below elements) */}
              <WireLayer
                connections={panel.connections}
                elements={panel.elements}
                rails={panel.rails}
                selectedConnectionId={selectedConnectionId}
                connectingFrom={connectingFrom}
                mousePos={canvasMousePos}
              />

              {/* Elements */}
              {panel.elements.map((element) => (
                <ElementShape
                  key={element.id}
                  element={element}
                  railIndex={railIndexMap.get(element.railId) ?? 0}
                  rails={panel.rails}
                  allElements={panel.elements}
                  allConnections={panel.connections}
                  isSelected={element.id === selectedElementId}
                  isMultiSelected={selectedElementIds.has(element.id)}
                  connectingFrom={connectingFrom}
                  onSingleSelect={(id) => {
                    panelStore.selectElement(id)
                    if (selectedElementIds.size > 0) onMultiSelectChange(new Set())
                  }}
                  onShiftClick={(id) => {
                    const next = new Set(selectedElementIds)
                    if (next.has(id)) next.delete(id)
                    else next.add(id)
                    onMultiSelectChange(next)
                    panelStore.selectElement(null)
                  }}
                />
              ))}

              {/* Annotations */}
              {panel.annotations.map((ann) => {
                const isSelected = ann.id === selectedAnnotationId
                const PAD = 6
                const fontSize = 12
                return (
                  <Group
                    key={ann.id}
                    x={ann.x}
                    y={ann.y}
                    draggable
                    onMouseDown={(e) => { e.cancelBubble = true }}
                    onClick={(e) => {
                      e.cancelBubble = true
                      panelStore.selectAnnotation(ann.id)
                    }}
                    onDblClick={(e) => {
                      e.cancelBubble = true
                      const next = window.prompt('Edit annotation:', ann.text)
                      if (next !== null && next.trim() !== '') {
                        panelStore.updateAnnotation(ann.id, { text: next.trim() })
                      }
                    }}
                    onDragEnd={(e) => {
                      panelStore.updateAnnotation(ann.id, { x: e.target.x(), y: e.target.y() })
                    }}
                  >
                    <Rect
                      x={0} y={0}
                      width={Math.max(80, ann.text.length * 7.5) + PAD * 2}
                      height={fontSize + PAD * 2}
                      fill="#fef9c3"
                      stroke={isSelected ? '#3b82f6' : '#d97706'}
                      strokeWidth={isSelected ? 1.5 / zoom : 1 / zoom}
                      cornerRadius={3}
                      shadowColor="rgba(0,0,0,0.15)"
                      shadowBlur={4}
                      shadowOffsetY={2}
                    />
                    <Text
                      x={PAD} y={PAD}
                      text={ann.text}
                      fontSize={fontSize}
                      fontFamily="sans-serif"
                      fill="#92400e"
                      listening={false}
                    />
                  </Group>
                )
              })}

              {/* Rubber-band selection rect */}
              {rubberBand && (() => {
                const rx = Math.min(rubberBand.x1, rubberBand.x2)
                const ry = Math.min(rubberBand.y1, rubberBand.y2)
                const rw = Math.abs(rubberBand.x2 - rubberBand.x1)
                const rh = Math.abs(rubberBand.y2 - rubberBand.y1)
                const sw = 1 / zoom
                return (
                  <Rect
                    x={rx} y={ry} width={rw} height={rh}
                    fill="rgba(59,130,246,0.1)"
                    stroke="#3b82f6"
                    strokeWidth={sw}
                    dash={[4 / zoom, 4 / zoom]}
                    listening={false}
                  />
                )
              })()}
            </Group>
          </Layer>
        </Stage>

        {panel.rails.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <p className="text-sm font-medium text-zinc-500">No rails configured</p>
              <p className="text-xs text-zinc-400 mt-1">Use the toolbar to add a rail</p>
            </div>
          </div>
        )}
      </div>

      <DragPreviewLayer draggingTypeId={draggingTypeId} mousePos={mousePos} />
    </>
  )
}
