'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { schemeStore } from '@/lib/store/schemeStore'
import { useSchemeStore } from '@/lib/hooks/useSchemeStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { SCHEME_DEFS } from '@/lib/constants/schemeDefs'
import type { Scheme, SchemeNode, SchemePort, SchemeNodeType } from '@/lib/types/scheme'
import { renderSchemeSymbol } from './symbols'
import { useCanvasTouchGestures } from '@/lib/hooks/useCanvasTouchGestures'

const DEFAULT_GRID = 24

interface Props {
  scheme: Scheme
  zoom: number
  onZoomChange: (z: number) => void
  wireRouting?: 'orthogonal' | 'straight'
  gridSize?: 6 | 12 | 24 | 48
}

function portColor(label: string): string {
  if (label === 'L' || label === 'L1' || label === 'L2' || label === 'L3' || label === '+') return '#ef4444'
  if (label === 'N' || label === 'N1' || label === 'N2' || label === '-') return '#2563eb'
  if (label === 'PE') return '#16a34a'
  return '#94a3b8'
}

function snapTo(v: number, grid: number): number {
  return Math.round(v / grid) * grid
}

// ── Rotated port position ─────────────────────────────────────────────────────

function getRotatedPortPos(node: SchemeNode, port: SchemePort): { x: number; y: number } {
  const def = SCHEME_DEFS[node.type]
  const cx = node.x + def.width / 2
  const cy = node.y + def.height / 2
  const relX = port.x - def.width / 2
  const relY = port.y - def.height / 2
  const rad = (node.rotation * Math.PI) / 180
  const rotX = relX * Math.cos(rad) - relY * Math.sin(rad)
  const rotY = relX * Math.sin(rad) + relY * Math.cos(rad)
  return { x: cx + rotX, y: cy + rotY }
}

// ── Orthogonal wire path ──────────────────────────────────────────────────────

function orthogonalPath(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2
  return `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`
}

// Node symbols now live in ./symbols.tsx (IEC-style, unified stroke palette).

// ── Main canvas ───────────────────────────────────────────────────────────────

export function SchemeCanvas({ scheme, zoom, onZoomChange, wireRouting = 'orthogonal', gridSize = DEFAULT_GRID }: Props) {
  const snap = (v: number) => snapTo(v, gridSize)
  const storeState = useSchemeStore()
  const { selectedNodeId, selectedWireId, connectingFrom } = storeState
  const { panels } = usePanelStore()

  const allPanelElements = panels.flatMap((p) => p.elements)

  const svgRef = useRef<SVGSVGElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<{
    nodeId: string
    pointerId: number
    startClientX: number
    startClientY: number
    origX: number
    origY: number
    moved: boolean
  } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [panning, setPanning] = useState<{
    startX: number
    startY: number
    origPan: { x: number; y: number }
  } | null>(null)
  // Track every active pointer so we can bail out of a single-finger node drag
  // the moment a second finger lands (letting the pinch/pan gesture take over).
  const activePointers = useRef<Set<number>>(new Set())

  function toCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    }
  }

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedNodeId: nid, selectedWireId: wid } = schemeStore.getState()
        if (nid) {
          schemeStore.deleteNode(nid)
        } else if (wid) {
          schemeStore.deleteWire(wid)
        }
      }
      if (e.key === 'Escape') {
        schemeStore.cancelConnecting()
        schemeStore.selectNode(null)
        schemeStore.selectWire(null)
      }
      if (e.key === 'r' || e.key === 'R') {
        const { selectedNodeId: nid } = schemeStore.getState()
        if (nid) {
          const currentScheme = schemeStore.getActiveScheme()
          const node = currentScheme?.nodes.find((n) => n.id === nid)
          if (node) {
            schemeStore.updateNode(nid, {
              rotation: (((node.rotation + 90) % 360) as 0 | 90 | 180 | 270),
            })
          }
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // ── Wheel: zoom + pan ─────────────────────────────────────────────────────

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY < 0 ? 1.1 : 0.9
        onZoomChange(Math.max(0.2, Math.min(4, zoom * delta)))
      } else {
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    },
    [zoom, onZoomChange]
  )

  // Mobile touch — pinch-to-zoom + two-finger pan on the SVG surface.
  // Single-finger touches keep working for node drag / port taps.
  useCanvasTouchGestures(svgRef, {
    onPinch: (delta) => {
      onZoomChange(Math.max(0.2, Math.min(4, zoom * delta)))
    },
    onPan: (dx, dy) => {
      setPan((p) => ({ x: p.x + dx, y: p.y + dy }))
    },
  })

  // ── Pointer events (unified mouse / touch / pen) ──────────────────────────

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    activePointers.current.add(e.pointerId)

    // Two or more pointers = pinch/pan gesture — abandon any in-flight node drag.
    if (activePointers.current.size > 1 && dragging) {
      setDragging(null)
    }

    // Middle-mouse button starts canvas panning (touch panning goes through
    // useCanvasTouchGestures — two fingers).
    if (e.pointerType === 'mouse' && e.button === 1) {
      e.preventDefault()
      setPanning({ startX: e.clientX, startY: e.clientY, origPan: { ...pan } })
    }
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    const pos = toCanvas(e.clientX, e.clientY)
    setMousePos(pos)

    if (dragging && dragging.pointerId === e.pointerId) {
      const dx = (e.clientX - dragging.startClientX) / zoom
      const dy = (e.clientY - dragging.startClientY) / zoom
      if (!dragging.moved && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
        setDragging({ ...dragging, moved: true })
      }
      schemeStore.updateNode(dragging.nodeId, {
        x: snap(dragging.origX + dx),
        y: snap(dragging.origY + dy),
      })
    }

    if (panning) {
      setPan({
        x: panning.origPan.x + (e.clientX - panning.startX),
        y: panning.origPan.y + (e.clientY - panning.startY),
      })
    }
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    activePointers.current.delete(e.pointerId)
    if (dragging && dragging.pointerId === e.pointerId) setDragging(null)
    setPanning(null)
  }

  function handlePointerCancel(e: React.PointerEvent<SVGSVGElement>) {
    activePointers.current.delete(e.pointerId)
    if (dragging && dragging.pointerId === e.pointerId) setDragging(null)
    setPanning(null)
  }

  function handlePointerLeave() {
    // A pointer leaving the SVG while captured still fires move/up on the
    // capturing element; only reset transient panning state here.
    setPanning(null)
  }

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if ((e.target as SVGElement).dataset.bg === 'true') {
      schemeStore.selectNode(null)
      schemeStore.selectWire(null)
      schemeStore.cancelConnecting()
    }
  }

  // ── Drag & drop from palette ──────────────────────────────────────────────

  function handleDragOver(e: React.DragEvent<SVGSVGElement>) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(e: React.DragEvent<SVGSVGElement>) {
    e.preventDefault()
    const type = e.dataTransfer.getData('schemeNodeType') as SchemeNodeType | ''
    if (!type) return
    const pos = toCanvas(e.clientX, e.clientY)
    schemeStore.addNode(type, snap(pos.x), snap(pos.y))
  }

  // ── Node drag ─────────────────────────────────────────────────────────────

  function handleNodePointerDown(e: React.PointerEvent, node: SchemeNode) {
    // Left mouse (button === 0), touch and pen all report button === 0.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // If another pointer is already down (two-finger gesture starting), don't
    // hijack it for a node drag.
    if (activePointers.current.size > 0 && !activePointers.current.has(e.pointerId)) return
    e.stopPropagation()
    // Capture so move/up still fire on this element even if the finger slides
    // beyond the node bounds.
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId)
    } catch {
      // Older browsers may throw — the SVG-level handlers still track the drag.
    }
    activePointers.current.add(e.pointerId)
    setDragging({
      nodeId: node.id,
      pointerId: e.pointerId,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: node.x,
      origY: node.y,
      moved: false,
    })
    if (!connectingFrom) schemeStore.selectNode(node.id)
  }

  function handleNodePointerMove(e: React.PointerEvent) {
    if (!dragging || dragging.pointerId !== e.pointerId) return
    if (activePointers.current.size > 1) {
      // A second pointer arrived mid-drag — hand off to pinch/pan.
      setDragging(null)
      return
    }
    const dx = (e.clientX - dragging.startClientX) / zoom
    const dy = (e.clientY - dragging.startClientY) / zoom
    if (!dragging.moved && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
      setDragging({ ...dragging, moved: true })
    }
    schemeStore.updateNode(dragging.nodeId, {
      x: snap(dragging.origX + dx),
      y: snap(dragging.origY + dy),
    })
  }

  function handleNodePointerUp(e: React.PointerEvent) {
    if (dragging && dragging.pointerId === e.pointerId) setDragging(null)
    activePointers.current.delete(e.pointerId)
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId)
    } catch {
      // ignore — pointer capture may already be released
    }
  }

  function handleNodeClick(e: React.MouseEvent, node: SchemeNode) {
    e.stopPropagation()
    if (connectingFrom) {
      // In connect mode, clicking a node body does nothing (use port dots)
      return
    }
    // On drag-release the browser may synthesise a click; skip re-selecting
    // if we actually moved the node.
    if (dragging?.moved) return
    schemeStore.selectNode(node.id)
  }

  // ── Rendering helpers ─────────────────────────────────────────────────────

  function renderWires() {
    return scheme.wires.map((wire) => {
      const fromNode = scheme.nodes.find((n) => n.id === wire.fromNodeId)
      const toNode = scheme.nodes.find((n) => n.id === wire.toNodeId)
      if (!fromNode || !toNode) return null

      const fromDef = SCHEME_DEFS[fromNode.type]
      const toDef = SCHEME_DEFS[toNode.type]
      const fromPort = fromDef.ports[wire.fromPortIndex]
      const toPort = toDef.ports[wire.toPortIndex]
      if (!fromPort || !toPort) return null

      const { x: x1, y: y1 } = getRotatedPortPos(fromNode, fromPort)
      const { x: x2, y: y2 } = getRotatedPortPos(toNode, toPort)

      const isSelected = wire.id === selectedWireId
      const color = portColor(fromPort.label || toPort.label)
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2
      const d = wireRouting === 'straight'
        ? `M ${x1} ${y1} L ${x2} ${y2}`
        : orthogonalPath(x1, y1, x2, y2)

      return (
        <g key={wire.id} onClick={(e) => { e.stopPropagation(); schemeStore.selectWire(wire.id) }} style={{ cursor: 'pointer' }}>
          {/* Wider invisible hit target */}
          <path
            d={d}
            stroke="transparent"
            strokeWidth={10}
            fill="none"
          />
          <path
            d={d}
            stroke={isSelected ? '#fbbf24' : color}
            strokeWidth={isSelected ? 3 : 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {wire.label && (
            <text
              x={mx}
              y={my - 4}
              textAnchor="middle"
              fontSize={10}
              fill={isSelected ? '#fbbf24' : '#374151'}
              fontFamily="sans-serif"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              {wire.label}
            </text>
          )}
        </g>
      )
    })
  }

  function renderPreviewWire() {
    if (!connectingFrom) return null
    const fromNode = scheme.nodes.find((n) => n.id === connectingFrom.nodeId)
    if (!fromNode) return null
    const fromDef = SCHEME_DEFS[fromNode.type]
    const fromPort = fromDef.ports[connectingFrom.portIndex]
    if (!fromPort) return null

    const { x: x1, y: y1 } = getRotatedPortPos(fromNode, fromPort)
    const x2 = mousePos.x
    const y2 = mousePos.y
    const d = wireRouting === 'straight'
      ? `M ${x1} ${y1} L ${x2} ${y2}`
      : orthogonalPath(x1, y1, x2, y2)

    return (
      <path
        d={d}
        stroke="#fbbf24"
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
        fill="none"
        style={{ pointerEvents: 'none' }}
      />
    )
  }

  function renderNode(node: SchemeNode) {
    const def = SCHEME_DEFS[node.type]
    const isSelected = node.id === selectedNodeId
    const cx = node.x + def.width / 2
    const cy = node.y + def.height / 2

    return (
      <g
        key={node.id}
        style={{ cursor: dragging?.nodeId === node.id ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={(e) => handleNodePointerDown(e, node)}
        onPointerMove={handleNodePointerMove}
        onPointerUp={handleNodePointerUp}
        onPointerCancel={handleNodePointerUp}
        onClick={(e) => handleNodeClick(e, node)}
      >
        {/* Rotated group containing shape + symbol + selection */}
        <g transform={`rotate(${node.rotation}, ${cx}, ${cy}) translate(${node.x}, ${node.y})`}>
          {/* Selection outline */}
          {isSelected && (
            <rect
              x={-4}
              y={-4}
              width={def.width + 8}
              height={def.height + 8}
              rx={10}
              fill="none"
              stroke="#f2bc2e"
              strokeWidth={2.5}
              style={{ pointerEvents: 'none' }}
            />
          )}
          {/* Card body — light warm surface, subtle shadow via colored border */}
          {node.type !== 'junction' && (
            <>
              <rect
                x={0}
                y={0}
                width={def.width}
                height={def.height}
                rx={8}
                fill="#ffffff"
                stroke={def.color}
                strokeWidth={1.4}
                opacity={0.95}
              />
              {/* Accent top strip — colored to keep type recognition */}
              <rect x={0} y={0} width={def.width} height={3} rx={2} fill={def.color} />
            </>
          )}
          {/* IEC-style symbol */}
          {renderSchemeSymbol(node.type, { rotation: node.rotation })}

          {/* Panel link badge — blue if in sync, amber if label differs */}
          {node.linkedPanelElementId && (() => {
            const linked = allPanelElements.find((e) => e.id === node.linkedPanelElementId)
            const outOfSync = linked && node.label && linked.label && node.label !== linked.label
            const badgeColor = !linked ? '#9ca3af' : outOfSync ? '#f59e0b' : '#3b82f6'
            const title = !linked ? 'Linked element not found' : outOfSync ? `Label mismatch: panel="${linked.label}"` : `Linked to ${linked.label || linked.typeId}`
            return (
              <g transform={`translate(${def.width - 9}, 9)`} style={{ pointerEvents: 'none' }}>
                <title>{title}</title>
                <circle r={7} fill={badgeColor} stroke="white" strokeWidth={1.5} />
                <text x={0} y={3.5} textAnchor="middle" fontSize={9} fontWeight="bold" fill="white" fontFamily="sans-serif">P</text>
              </g>
            )
          })()}
        </g>

        {/* Label — always upright, below the node's bounding box centre */}
        <text
          x={cx}
          y={node.y + def.height + 14}
          textAnchor="middle"
          fontSize={10}
          fill="#374151"
          fontFamily="sans-serif"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {node.label}
        </text>

        {/* Port dots — rendered at rotated positions so wires connect correctly */}
        {def.ports.map((port: SchemePort) => renderPortDot(node, port))}
      </g>
    )
  }

  function renderPortDot(node: SchemeNode, port: SchemePort) {
    const isConnecting = connectingFrom !== null
    const isSource =
      connectingFrom?.nodeId === node.id && connectingFrom?.portIndex === port.index
    const isSelectedNode = node.id === selectedNodeId
    const color = portColor(port.label)
    const { x, y } = getRotatedPortPos(node, port)
    // A tap on a port must always trigger the connect flow, never a node drag.
    function handlePortActivate(e: React.PointerEvent | React.MouseEvent) {
      e.stopPropagation()
      schemeStore.handlePortClick(node.id, port.index)
    }

    return (
      <g key={port.index} transform={`translate(${x}, ${y})`} style={{ touchAction: 'none' }}>
        {/* Pulsing halo when a node is selected — makes ports discoverable */}
        {(isSelectedNode || isConnecting) && !isSource && (
          <circle r={12} fill={color} opacity={0.18}>
            <animate attributeName="r" values="10;15;10" dur="1.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.28;0.08;0.28" dur="1.4s" repeatCount="indefinite" />
          </circle>
        )}
        {isSource && (
          <circle r={14} fill="#22c55e" opacity={0.25}>
            <animate attributeName="r" values="12;18;12" dur="0.9s" repeatCount="indefinite" />
          </circle>
        )}
        {/* Enlarged hit target (r=14 → 28px tap area, meets Apple/Android guidelines).
            Pointer handler stops it from bubbling into the node drag pipeline. */}
        <circle
          r={14}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={handlePortActivate}
          onClick={handlePortActivate}
        />
        <circle
          r={isSource ? 7 : 5.5}
          fill={isSource ? '#22c55e' : isConnecting ? '#86efac' : color}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth={1.2}
          style={{ pointerEvents: 'none' }}
        />
        {port.label && (
          <text
            x={0}
            y={-10}
            textAnchor="middle"
            fontSize={9}
            fontWeight="600"
            fill={color}
            fontFamily="sans-serif"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {port.label}
          </text>
        )}
      </g>
    )
  }

  function renderMinimap() {
    if (scheme.nodes.length === 0) return null
    const MW = 160, MH = 100, PAD = 24
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const node of scheme.nodes) {
      const def = SCHEME_DEFS[node.type]
      minX = Math.min(minX, node.x)
      minY = Math.min(minY, node.y)
      maxX = Math.max(maxX, node.x + def.width)
      maxY = Math.max(maxY, node.y + def.height)
    }
    const contentW = maxX - minX + PAD * 2
    const contentH = maxY - minY + PAD * 2
    const scale = Math.min(MW / contentW, MH / contentH, 0.8)
    const toM = (x: number, y: number) => ({
      x: (x - minX + PAD) * scale,
      y: (y - minY + PAD) * scale,
    })
    const svgEl = svgRef.current
    const { width: svgW, height: svgH } = svgEl?.getBoundingClientRect() ?? { width: 800, height: 600 }
    const vpM = toM(-pan.x / zoom, -pan.y / zoom)
    const vpMW = (svgW / zoom) * scale
    const vpMH = (svgH / zoom) * scale

    function handleMinimapClick(e: React.MouseEvent<SVGSVGElement>) {
      const rect = e.currentTarget.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const wx = mx / scale + minX - PAD
      const wy = my / scale + minY - PAD
      const { width: sw, height: sh } = svgRef.current?.getBoundingClientRect() ?? { width: 800, height: 600 }
      setPan({ x: -(wx * zoom - sw / 2), y: -(wy * zoom - sh / 2) })
    }

    return (
      <div style={{ position: 'absolute', bottom: 40, right: 8, zIndex: 10, background: 'rgba(0,0,0,0.65)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
        <svg width={MW} height={MH} style={{ display: 'block', cursor: 'crosshair' }} onClick={handleMinimapClick}>
          {scheme.nodes.map((node) => {
            const def = SCHEME_DEFS[node.type]
            const { x, y } = toM(node.x, node.y)
            return <rect key={node.id} x={x} y={y} width={Math.max(4, def.width * scale)} height={Math.max(4, def.height * scale)} fill={def.color} rx={1} />
          })}
          <rect x={vpM.x} y={vpM.y} width={Math.max(2, vpMW)} height={Math.max(2, vpMH)} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.55)" strokeWidth={1} />
        </svg>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
    <svg
      ref={svgRef}
      className="h-full w-full select-none touch-none bg-zinc-50 dark:bg-zinc-950"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onClick={handleSvgClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ cursor: panning ? 'grabbing' : connectingFrom ? 'crosshair' : 'default' }}
    >
      {/* Grid background — not in the transform group so it fills the entire viewport */}
      <defs>
        <pattern
          id="scheme-grid"
          width={gridSize * zoom}
          height={gridSize * zoom}
          patternUnits="userSpaceOnUse"
          x={pan.x % (gridSize * zoom)}
          y={pan.y % (gridSize * zoom)}
        >
          <path
            d={`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={0.5}
          />
        </pattern>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="url(#scheme-grid)"
        data-bg="true"
      />

      {/* Main transform group */}
      <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
        {/* Wires (under nodes) */}
        {renderWires()}
        {/* Preview wire */}
        {renderPreviewWire()}
        {/* Nodes */}
        {scheme.nodes.map((node) => renderNode(node))}
      </g>
    </svg>
    {renderMinimap()}
    </div>
  )
}
