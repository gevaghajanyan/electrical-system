'use client'

import type { Panel } from '@/lib/types/panel'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'

const CIRCUIT_PALETTE = ['#ef4444','#f97316','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

function circuitTagColor(tag: string): string {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h)
  return CIRCUIT_PALETTE[Math.abs(h) % CIRCUIT_PALETTE.length]
}

interface Props { panel: Panel }

export function ConnectionMatrix({ panel }: Props) {
  if (panel.elements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-400 dark:text-zinc-500">
        No elements — add elements to the panel first.
      </div>
    )
  }

  // Sort elements by rail then slot
  const railOrder = new Map(panel.rails.map((r, i) => [r.id, i]))
  const sorted = [...panel.elements].sort((a, b) => {
    const ri = (railOrder.get(a.railId) ?? 0) - (railOrder.get(b.railId) ?? 0)
    return ri !== 0 ? ri : a.slotStart - b.slotStart
  })

  // Build port→elementId map
  const portToEl = new Map<string, string>()
  for (const el of panel.elements) {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    if (!def) continue
    const poles = def.poles
    for (let i = 0; i < poles * 2; i++) {
      portToEl.set(`${el.id}:${i}`, el.id)
    }
  }

  // Build adjacency from connections
  const adjacent = new Map<string, Set<string>>()
  for (const el of panel.elements) adjacent.set(el.id, new Set())
  for (const conn of panel.connections) {
    const fromElId = conn.fromPortId.split(':')[0]
    const toElId = conn.toPortId.split(':')[0]
    if (fromElId && toElId && fromElId !== toElId) {
      adjacent.get(fromElId)?.add(toElId)
      adjacent.get(toElId)?.add(fromElId)
    }
  }

  const hasAnyConnections = panel.connections.length > 0

  return (
    <div className="h-full overflow-auto p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Connection Matrix</h3>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">{panel.connections.length} connection{panel.connections.length !== 1 ? 's' : ''}</span>
      </div>

      {!hasAnyConnections ? (
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">No connections drawn yet. Use the connection tool to wire ports together.</p>
      ) : null}

      {/* Circuit tag summary */}
      {(() => {
        const tags = new Map<string, string[]>()
        for (const el of sorted) {
          if (el.circuitTag) {
            if (!tags.has(el.circuitTag)) tags.set(el.circuitTag, [])
            tags.get(el.circuitTag)!.push(el.label || el.typeId)
          }
        }
        if (tags.size === 0) return null
        return (
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Circuit Groups</p>
            <div className="space-y-1.5">
              {[...tags.entries()].map(([tag, labels]) => (
                <div key={tag} className="flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5">
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ background: circuitTagColor(tag) }} />
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{tag}</span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">{labels.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Rail breakdown */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Elements by Rail</p>
      <div className="space-y-3">
        {panel.rails.map((rail) => {
          const railEls = sorted.filter((e) => e.railId === rail.id)
          if (railEls.length === 0) return null
          const usedSlots = railEls.reduce((s, e) => s + e.slotWidth, 0)
          const pct = Math.round((usedSlots / rail.slotCount) * 100)
          return (
            <div key={rail.id} className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{rail.label}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{usedSlots}/{rail.slotCount} slots ({pct}%)</span>
              </div>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {railEls.map((el) => {
                  const def = ELEMENT_DEFS_MAP.get(el.typeId)
                  const connectedTo = [...(adjacent.get(el.id) ?? [])]
                  const connectedEls = connectedTo.map((cid) => panel.elements.find((e) => e.id === cid)).filter(Boolean)
                  return (
                    <div key={el.id} className="flex items-center gap-3 px-3 py-2">
                      <div
                        className="h-6 w-6 rounded shrink-0 flex items-center justify-center text-[9px] font-bold"
                        style={{ background: def?.color, color: def?.textColor }}
                      >
                        {def?.shortLabel?.slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {el.label || def?.label || el.typeId}
                          {el.circuitTag && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] font-normal text-zinc-400">
                              <span className="h-2 w-2 rounded-full" style={{ background: circuitTagColor(el.circuitTag) }} />
                              {el.circuitTag}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                          Slot {el.slotStart + 1}–{el.slotStart + el.slotWidth}
                          {connectedEls.length > 0 && (
                            <> · Connected to: {connectedEls.map((ce) => ce!.label || ce!.typeId).join(', ')}</>
                          )}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
