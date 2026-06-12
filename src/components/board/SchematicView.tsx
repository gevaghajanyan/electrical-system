'use client'

import { useMemo, useState } from 'react'
import type { Panel, PanelElement } from '@/lib/types/panel'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { parsePortId, phaseColor, phasesForPoles } from '@/lib/utils/portUtils'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'

const BOX_W = 92
const BOX_H = 62
const H_GAP = 30
const V_GAP = 68
const PADDING = 48
const PORT_R = 4

function portXInBox(phaseIdx: number, totalPhases: number): number {
  return BOX_W * (phaseIdx + 0.5) / totalPhases
}

function getSubLabel(el: PanelElement): string {
  const p = el.properties
  if (p.kind === 'mcb') return `${p.curve}${p.rating}A`
  if (p.kind === 'rcbo') return `${p.curve}${p.rating}/${p.sensitivity}mA`
  if (p.kind === 'rcd') return `${p.rating}A/${p.sensitivity}mA`
  if (p.kind === 'isolator') return `${p.rating}A`
  if (p.kind === 'voltage_relay') return `${p.minVoltage}–${p.maxVoltage}V`
  return ''
}

interface NodeLayout {
  el: PanelElement
  depth: number
  x: number
  y: number
}

function buildLayout(panel: Panel): {
  nodes: Map<string, NodeLayout>
  svgWidth: number
  svgHeight: number
} {
  const elements = panel.elements.filter((el) => {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    return def && def.poles > 0
  })

  const downstream = new Map<string, Set<string>>()
  const upstream = new Map<string, Set<string>>()
  for (const el of elements) {
    downstream.set(el.id, new Set())
    upstream.set(el.id, new Set())
  }

  for (const conn of panel.connections) {
    const f = parsePortId(conn.fromPortId)
    const t = parsePortId(conn.toPortId)
    if (!f || !t) continue
    const outId = f.side === 'bottom' ? f.elementId : t.elementId
    const inId = f.side === 'bottom' ? t.elementId : f.elementId
    if (!downstream.has(outId) || !downstream.has(inId)) continue
    downstream.get(outId)!.add(inId)
    upstream.get(inId)!.add(outId)
  }

  const depth = new Map<string, number>()
  const queue: Array<{ id: string; d: number }> = []
  for (const el of elements) {
    if ((upstream.get(el.id)?.size ?? 0) === 0) {
      depth.set(el.id, 0)
      queue.push({ id: el.id, d: 0 })
    }
  }
  let qi = 0
  while (qi < queue.length) {
    const { id, d } = queue[qi++]
    for (const childId of downstream.get(id) ?? []) {
      const nd = d + 1
      if (!depth.has(childId) || depth.get(childId)! < nd) {
        depth.set(childId, nd)
        queue.push({ id: childId, d: nd })
      }
    }
  }
  const maxD = depth.size > 0 ? Math.max(...depth.values()) : 0
  for (const el of elements) {
    if (!depth.has(el.id)) depth.set(el.id, maxD + 1)
  }

  const levels = new Map<number, PanelElement[]>()
  for (const el of elements) {
    const d = depth.get(el.id)!
    if (!levels.has(d)) levels.set(d, [])
    levels.get(d)!.push(el)
  }
  const railOrder = new Map(panel.rails.map((r, i) => [r.id, i]))
  for (const lvl of levels.values()) {
    lvl.sort((a, b) => {
      const ra = railOrder.get(a.railId) ?? 0
      const rb = railOrder.get(b.railId) ?? 0
      return ra !== rb ? ra - rb : a.slotStart - b.slotStart
    })
  }

  const sortedDepths = Array.from(levels.keys()).sort((a, b) => a - b)
  const maxRowLen = Math.max(...Array.from(levels.values()).map((l) => l.length), 1)
  const totalW = maxRowLen * BOX_W + (maxRowLen - 1) * H_GAP

  const nodes = new Map<string, NodeLayout>()
  for (const d of sortedDepths) {
    const lvl = levels.get(d)!
    const rowW = lvl.length * BOX_W + (lvl.length - 1) * H_GAP
    const startX = PADDING + (totalW - rowW) / 2
    const y = PADDING + d * (BOX_H + V_GAP)
    lvl.forEach((el, i) => {
      nodes.set(el.id, { el, depth: d, x: startX + i * (BOX_W + H_GAP), y })
    })
  }

  const depthCount = sortedDepths.length
  const svgWidth = PADDING * 2 + totalW
  const svgHeight = PADDING * 2 + depthCount * (BOX_H + V_GAP)

  return { nodes, svgWidth, svgHeight }
}

interface SchematicViewProps {
  panel: Panel
}

export function SchematicView({ panel }: SchematicViewProps) {
  const { nodes, svgWidth, svgHeight } = useMemo(() => buildLayout(panel), [panel])
  const { selectedConnectionId } = usePanelStore()
  const [zoom, setZoom] = useState(1)
  const [editingLabel, setEditingLabel] = useState<{ id: string; value: string } | null>(null)

  const selectedConn = panel.connections.find((c) => c.id === selectedConnectionId) ?? null

  function handleWireClick(connId: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (selectedConnectionId === connId) {
      panelStore.selectConnection(null)
    } else {
      panelStore.selectConnection(connId)
    }
  }

  function commitLabel() {
    if (!editingLabel) return
    panelStore.updateConnection(editingLabel.id, { label: editingLabel.value })
    setEditingLabel(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
        <span className="text-xs text-zinc-400">
          {nodes.size} element{nodes.size !== 1 ? 's' : ''} · {panel.connections.length} connection{panel.connections.length !== 1 ? 's' : ''}
        </span>

        {selectedConn && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-zinc-400">Wire label:</span>
            {editingLabel?.id === selectedConn.id ? (
              <>
                <input
                  autoFocus
                  className="h-5 rounded border border-zinc-300 px-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                  value={editingLabel.value}
                  onChange={(e) => setEditingLabel({ id: selectedConn.id, value: e.target.value })}
                  onBlur={commitLabel}
                  onKeyDown={(e) => { if (e.key === 'Enter') commitLabel(); if (e.key === 'Escape') setEditingLabel(null) }}
                />
              </>
            ) : (
              <button
                className="h-5 min-w-[48px] rounded border border-zinc-200 px-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                onClick={() => setEditingLabel({ id: selectedConn.id, value: selectedConn.label })}
              >
                {selectedConn.label || 'click to label'}
              </button>
            )}
            <button
              className="h-5 rounded px-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => panelStore.deleteConnection(selectedConn.id)}
            >
              Delete
            </button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.1).toFixed(2)))}
            className="h-6 w-6 rounded border border-zinc-300 dark:border-zinc-600 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
          >
            −
          </button>
          <span className="text-xs w-10 text-center text-zinc-500">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(2)))}
            className="h-6 w-6 rounded border border-zinc-300 dark:border-zinc-600 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 h-6 rounded border border-zinc-300 dark:border-zinc-600 text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className="flex-1 min-h-0 overflow-auto bg-white dark:bg-zinc-950"
        onClick={() => panelStore.selectConnection(null)}
      >
        {nodes.size === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-zinc-400">No connectable elements to display</p>
          </div>
        ) : (
          <svg
            width={svgWidth * zoom}
            height={svgHeight * zoom}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ display: 'block' }}
          >
            {/* Wires */}
            {panel.connections.map((conn) => {
              const f = parsePortId(conn.fromPortId)
              const t = parsePortId(conn.toPortId)
              if (!f || !t) return null
              const outId = f.side === 'bottom' ? f.elementId : t.elementId
              const inId = f.side === 'bottom' ? t.elementId : f.elementId
              const phase = f.phase
              const fromNode = nodes.get(outId)
              const toNode = nodes.get(inId)
              if (!fromNode || !toNode) return null
              const fromDef = ELEMENT_DEFS_MAP.get(fromNode.el.typeId)
              const toDef = ELEMENT_DEFS_MAP.get(toNode.el.typeId)
              if (!fromDef || !toDef) return null
              const fromPhases = phasesForPoles(fromDef.poles)
              const toPhases = phasesForPoles(toDef.poles)
              const fi = fromPhases.indexOf(phase)
              const ti = toPhases.indexOf(phase)
              const x1 = fromNode.x + portXInBox(fi >= 0 ? fi : 0, fromPhases.length || 1)
              const y1 = fromNode.y + BOX_H + PORT_R
              const x2 = toNode.x + portXInBox(ti >= 0 ? ti : 0, toPhases.length || 1)
              const y2 = toNode.y - PORT_R
              const cy = (y1 + y2) / 2
              const isSelected = selectedConnectionId === conn.id
              const midX = (x1 + x2) / 2
              const midY = (y1 + y2) / 2

              return (
                <g key={conn.id}>
                  {/* Wider invisible hit area */}
                  <path
                    d={`M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`}
                    stroke="transparent"
                    strokeWidth={12}
                    fill="none"
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => handleWireClick(conn.id, e)}
                  />
                  <path
                    d={`M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`}
                    stroke={isSelected ? '#fbbf24' : phaseColor(phase)}
                    strokeWidth={isSelected ? 3 : 2}
                    fill="none"
                    strokeOpacity={0.9}
                    style={{ cursor: 'pointer', pointerEvents: 'none' }}
                  />
                  {conn.label && (
                    <text
                      x={midX}
                      y={midY - 4}
                      textAnchor="middle"
                      fill={isSelected ? '#d97706' : '#6b7280'}
                      fontSize={8}
                      fontFamily="system-ui,sans-serif"
                      style={{ pointerEvents: 'none' }}
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Element boxes */}
            {Array.from(nodes.values()).map(({ el, x, y }) => {
              const def = ELEMENT_DEFS_MAP.get(el.typeId)
              if (!def) return null
              const phases = phasesForPoles(def.poles)
              const label = el.label || def.shortLabel
              const sub = getSubLabel(el)

              return (
                <g key={el.id}>
                  <rect x={x} y={y} width={BOX_W} height={BOX_H} rx={5} fill={def.color} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
                  <rect x={x} y={y} width={BOX_W} height={17} rx={5} fill="rgba(0,0,0,0.28)" />
                  <rect x={x} y={y + 12} width={BOX_W} height={5} fill="rgba(0,0,0,0.28)" />
                  <text
                    x={x + BOX_W / 2}
                    y={y + 11.5}
                    textAnchor="middle"
                    fill={def.textColor}
                    fontSize={9}
                    fontWeight="bold"
                    fontFamily="system-ui,sans-serif"
                    style={{ letterSpacing: '0.05em' }}
                  >
                    {def.shortLabel}
                  </text>

                  <text
                    x={x + BOX_W / 2}
                    y={y + 32}
                    textAnchor="middle"
                    fill={def.textColor}
                    fontSize={10}
                    fontFamily="system-ui,sans-serif"
                  >
                    {label.length > 10 ? label.slice(0, 10) + '…' : label}
                  </text>

                  {sub && (
                    <text
                      x={x + BOX_W / 2}
                      y={y + 46}
                      textAnchor="middle"
                      fill={def.textColor}
                      fontSize={8}
                      fontFamily="system-ui,sans-serif"
                      opacity={0.75}
                    >
                      {sub}
                    </text>
                  )}

                  {el.notes && (
                    <circle cx={x + BOX_W - 6} cy={y + 6} r={4} fill="#fbbf24" stroke="rgba(0,0,0,0.2)" strokeWidth={0.5} />
                  )}

                  {phases.map((phase, i) => {
                    const px = x + portXInBox(i, phases.length)
                    return (
                      <g key={phase}>
                        <circle cx={px} cy={y} r={PORT_R} fill="#fff" stroke={phaseColor(phase)} strokeWidth={1.5} />
                        <circle cx={px} cy={y + BOX_H} r={PORT_R} fill="#fff" stroke={phaseColor(phase)} strokeWidth={1.5} />
                      </g>
                    )
                  })}
                </g>
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}
