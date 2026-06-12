'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { schemeStore } from '@/lib/store/schemeStore'
import { useSchemeStore } from '@/lib/hooks/useSchemeStore'
import { SCHEME_DEFS } from '@/lib/constants/schemeDefs'
import type { Scheme, SchemeNode, SchemePort, SchemeNodeType } from '@/lib/types/scheme'

const GRID = 24

interface Props {
  scheme: Scheme
  zoom: number
  onZoomChange: (z: number) => void
}

function portColor(label: string): string {
  if (label === 'L' || label === 'L1' || label === 'L2' || label === 'L3' || label === '+') return '#ef4444'
  if (label === 'N' || label === 'N1' || label === 'N2' || label === '-') return '#2563eb'
  if (label === 'PE') return '#16a34a'
  return '#94a3b8'
}

function snap(v: number): number {
  return Math.round(v / GRID) * GRID
}

// ── Node symbols ─────────────────────────────────────────────────────────────

function SwitchSymbol() {
  return (
    <g stroke="#ffffff" strokeWidth={1.5} fill="none">
      <circle cx={8} cy={24} r={3} />
      <circle cx={62} cy={24} r={3} />
      <line x1={11} y1={24} x2={50} y2={14} />
      <circle cx={50} cy={14} r={2} fill="#ffffff" />
    </g>
  )
}

function LampSymbol() {
  return (
    <g stroke="#ffffff" strokeWidth={1.5} fill="none">
      <circle cx={32} cy={32} r={16} />
      <line x1={20.7} y1={20.7} x2={43.3} y2={43.3} />
      <line x1={43.3} y1={20.7} x2={20.7} y2={43.3} />
    </g>
  )
}

function LedSymbol() {
  return (
    <g stroke="#ffffff" strokeWidth={1.5} fill="none">
      {/* Triangle */}
      <polygon points="22,16 22,48 50,32" fill="rgba(255,255,255,0.15)" stroke="#ffffff" strokeWidth={1.5} />
      {/* Vertical bar at right */}
      <line x1={50} y1={16} x2={50} y2={48} />
      {/* Light emission lines */}
      <line x1={54} y1={18} x2={60} y2={12} />
      <line x1={54} y1={24} x2={62} y2={18} />
    </g>
  )
}

function TransformerSymbol() {
  // Wavy lines = 3 bumps using quadratic bezier on each side
  const leftBumps = 'M 28 20 Q 22 29 28 34 Q 34 39 28 48 Q 22 57 28 60'
  const rightBumps = 'M 100 20 Q 106 29 100 34 Q 94 39 100 48 Q 106 57 100 60'
  return (
    <g stroke="#ffffff" strokeWidth={1.5} fill="none">
      <path d={leftBumps} />
      <path d={rightBumps} />
      <line x1={64} y1={16} x2={64} y2={64} strokeDasharray="3 2" />
    </g>
  )
}

function PowerAcSymbol() {
  return (
    <g fill="none">
      <circle cx={40} cy={26} r={14} stroke="#ffffff" strokeWidth={1.5} />
      <text
        x={40}
        y={31}
        textAnchor="middle"
        fontSize={14}
        fontWeight="bold"
        fill="#ffffff"
        fontFamily="serif"
      >
        ~
      </text>
      <text
        x={40}
        y={54}
        textAnchor="middle"
        fontSize={9}
        fill="rgba(255,255,255,0.8)"
        fontFamily="sans-serif"
      >
        230V
      </text>
    </g>
  )
}

function NodeSymbol({ type }: { type: SchemeNodeType }) {
  switch (type) {
    case 'switch_spst': return <SwitchSymbol />
    case 'lamp_230': return <LampSymbol />
    case 'led_220': return <LedSymbol />
    case 'transformer_sd': return <TransformerSymbol />
    case 'power_ac': return <PowerAcSymbol />
    case 'junction': return null
  }
}

// ── Main canvas ───────────────────────────────────────────────────────────────

export function SchemeCanvas({ scheme, zoom, onZoomChange }: Props) {
  const storeState = useSchemeStore()
  const { selectedNodeId, selectedWireId, connectingFrom } = storeState

  const svgRef = useRef<SVGSVGElement>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState<{
    nodeId: string
    startClientX: number
    startClientY: number
    origX: number
    origY: number
  } | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [panning, setPanning] = useState<{
    startX: number
    startY: number
    origPan: { x: number; y: number }
  } | null>(null)

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

  // ── Mouse events ──────────────────────────────────────────────────────────

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const pos = toCanvas(e.clientX, e.clientY)
    setMousePos(pos)

    if (dragging) {
      const dx = (e.clientX - dragging.startClientX) / zoom
      const dy = (e.clientY - dragging.startClientY) / zoom
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

  function handleMouseUp() {
    setDragging(null)
    setPanning(null)
  }

  function handleMouseLeave() {
    setDragging(null)
    setPanning(null)
  }

  function handleMouseDown(e: React.MouseEvent<SVGSVGElement>) {
    if (e.button === 1) {
      e.preventDefault()
      setPanning({ startX: e.clientX, startY: e.clientY, origPan: { ...pan } })
    }
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

  function handleNodeMouseDown(e: React.MouseEvent, node: SchemeNode) {
    if (e.button !== 0) return
    e.stopPropagation()
    setDragging({
      nodeId: node.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: node.x,
      origY: node.y,
    })
  }

  function handleNodeClick(e: React.MouseEvent, node: SchemeNode) {
    e.stopPropagation()
    if (connectingFrom) {
      // In connect mode, clicking a node body does nothing (use port dots)
      return
    }
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

      const x1 = fromNode.x + fromPort.x
      const y1 = fromNode.y + fromPort.y
      const x2 = toNode.x + toPort.x
      const y2 = toNode.y + toPort.y

      const isSelected = wire.id === selectedWireId
      const color = portColor(fromPort.label || toPort.label)
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2

      return (
        <g key={wire.id} onClick={(e) => { e.stopPropagation(); schemeStore.selectWire(wire.id) }} style={{ cursor: 'pointer' }}>
          {/* Wider invisible hit target */}
          <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="transparent"
            strokeWidth={10}
          />
          <line
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={isSelected ? '#fbbf24' : color}
            strokeWidth={isSelected ? 3 : 2}
            strokeLinecap="round"
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

    const x1 = fromNode.x + fromPort.x
    const y1 = fromNode.y + fromPort.y

    return (
      <line
        x1={x1}
        y1={y1}
        x2={mousePos.x}
        y2={mousePos.y}
        stroke="#fbbf24"
        strokeWidth={2}
        strokeDasharray="4 4"
        strokeLinecap="round"
        style={{ pointerEvents: 'none' }}
      />
    )
  }

  function renderNode(node: SchemeNode) {
    const def = SCHEME_DEFS[node.type]
    const isSelected = node.id === selectedNodeId

    return (
      <g
        key={node.id}
        transform={`translate(${node.x}, ${node.y})`}
        style={{ cursor: dragging?.nodeId === node.id ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => handleNodeMouseDown(e, node)}
        onClick={(e) => handleNodeClick(e, node)}
      >
        {/* Selection outline */}
        {isSelected && (
          <rect
            x={-3}
            y={-3}
            width={def.width + 6}
            height={def.height + 6}
            rx={8}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2}
            style={{ pointerEvents: 'none' }}
          />
        )}
        {/* Body */}
        <rect
          x={0}
          y={0}
          width={def.width}
          height={def.height}
          rx={5}
          fill={def.color}
        />
        {/* Symbol */}
        <NodeSymbol type={node.type} />
        {/* Label */}
        <text
          x={def.width / 2}
          y={def.height + 14}
          textAnchor="middle"
          fontSize={10}
          fill="#374151"
          fontFamily="sans-serif"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {node.label}
        </text>
        {/* Port dots */}
        {def.ports.map((port: SchemePort) => renderPortDot(node, port))}
      </g>
    )
  }

  function renderPortDot(node: SchemeNode, port: SchemePort) {
    const isConnecting = connectingFrom !== null
    const isSource =
      connectingFrom?.nodeId === node.id && connectingFrom?.portIndex === port.index
    const color = portColor(port.label)

    return (
      <g key={port.index} transform={`translate(${port.x}, ${port.y})`}>
        <circle
          r={7}
          fill="transparent"
          style={{ cursor: 'crosshair' }}
          onClick={(e) => {
            e.stopPropagation()
            schemeStore.handlePortClick(node.id, port.index)
          }}
        />
        <circle
          r={5}
          fill={isSource ? '#22c55e' : isConnecting ? '#86efac' : color}
          stroke="rgba(0,0,0,0.3)"
          strokeWidth={1}
          style={{ pointerEvents: 'none' }}
        />
        {port.label && (
          <text
            x={0}
            y={-8}
            textAnchor="middle"
            fontSize={8}
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

  return (
    <svg
      ref={svgRef}
      className="h-full w-full select-none bg-zinc-50 dark:bg-zinc-950"
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onClick={handleSvgClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{ cursor: panning ? 'grabbing' : connectingFrom ? 'crosshair' : 'default' }}
    >
      {/* Grid background — not in the transform group so it fills the entire viewport */}
      <defs>
        <pattern
          id="scheme-grid"
          width={GRID * zoom}
          height={GRID * zoom}
          patternUnits="userSpaceOnUse"
          x={pan.x % (GRID * zoom)}
          y={pan.y % (GRID * zoom)}
        >
          <path
            d={`M ${GRID * zoom} 0 L 0 0 0 ${GRID * zoom}`}
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
  )
}
