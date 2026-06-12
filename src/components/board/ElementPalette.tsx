'use client'

import { useState } from 'react'
import type { ElementCategory, ElementTypeId } from '@/lib/types/panel'
import type { ElementDef } from '@/lib/constants/elementDefs'
import { ELEMENT_DEFS } from '@/lib/constants/elementDefs'
import { useActivePanel } from '@/lib/hooks/usePanelStore'
import { panelStore } from '@/lib/store/panelStore'
import { hasSlotCollision } from '@/lib/utils/slotUtils'

const CATEGORY_LABELS: Record<ElementCategory, string> = {
  protection: 'Protection',
  switching: 'Switching',
  distribution: 'Distribution',
  accessory: 'Accessory',
}

const CATEGORY_ORDER: ElementCategory[] = ['protection', 'switching', 'distribution', 'accessory']

function PaletteTile({
  def,
  onDragStart,
  onAdd,
}: {
  def: ElementDef
  onDragStart: (id: string) => void
  onAdd: (id: string) => void
}) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(def.id)}
      onClick={() => onAdd(def.id)}
      title={`${def.label}\n${def.description}\nClick to place · Drag to position`}
      className="group relative cursor-grab select-none rounded overflow-hidden border border-black/10 hover:border-white/40 hover:shadow-lg active:cursor-grabbing active:scale-95 transition-all duration-100"
      style={{ backgroundColor: def.color }}
    >
      {/* Header strip */}
      <div
        className="px-1 pt-1 pb-0.5 text-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.32)' }}
      >
        <span
          className="block text-[9px] font-bold tracking-wide leading-none"
          style={{ color: def.textColor }}
        >
          {def.shortLabel}
        </span>
      </div>

      {/* Body: label abbreviated */}
      <div className="flex items-center justify-center px-1 py-1.5 min-h-[24px]">
        <span
          className="text-[9px] font-medium leading-tight text-center"
          style={{ color: def.textColor, opacity: 0.85 }}
        >
          {def.label.replace(/miniature circuit breaker/i, 'MCB').replace(/residual current/i, 'RC')}
        </span>
      </div>

      {/* Footer: pole × width badge */}
      <div
        className="px-1 pb-0.5 text-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.18)' }}
      >
        <span
          className="text-[8px] leading-none tabular-nums"
          style={{ color: def.textColor, opacity: 0.7 }}
        >
          {def.poles > 0 ? `${def.poles}P` : '—'} · {def.defaultSlotWidth}W
        </span>
      </div>
    </div>
  )
}

interface ElementPaletteProps {
  onDragStart: (typeId: string) => void
  className?: string
}

export function ElementPalette({ onDragStart, className = '' }: ElementPaletteProps) {
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<ElementCategory>>(new Set())
  const activePanel = useActivePanel()

  function handleAdd(typeId: string) {
    if (!activePanel) return
    const def = ELEMENT_DEFS.find((d) => d.id === typeId)
    if (!def) return
    for (const rail of activePanel.rails) {
      for (let slot = 0; slot <= rail.slotCount - def.defaultSlotWidth; slot++) {
        if (!hasSlotCollision(activePanel.elements, rail.id, slot, def.defaultSlotWidth)) {
          panelStore.addElement({
            typeId: def.id as ElementTypeId,
            railId: rail.id,
            slotStart: slot,
            slotWidth: def.defaultSlotWidth,
            label: def.defaultLabel,
            notes: '',
            properties: { ...def.defaultProperties },
          })
          return
        }
      }
    }
  }

  function toggleCategory(cat: ElementCategory) {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const q = search.toLowerCase()
  const grouped = CATEGORY_ORDER.reduce<Record<ElementCategory, ElementDef[]>>(
    (acc, cat) => {
      acc[cat] = ELEMENT_DEFS.filter(
        (d) =>
          d.category === cat &&
          (!q ||
            d.label.toLowerCase().includes(q) ||
            d.shortLabel.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q))
      )
      return acc
    },
    { protection: [], switching: [], distribution: [], accessory: [] }
  )

  return (
    <div className={['flex flex-col h-full overflow-hidden', className].join(' ')}>
      {/* Header + search */}
      <div className="shrink-0 border-b border-zinc-200 dark:border-zinc-700 px-3 pt-3 pb-2 space-y-2">
        <h2 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Elements</h2>
        <input
          type="text"
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Scrollable category grid */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-2">
        {CATEGORY_ORDER.map((cat) => {
          const defs = grouped[cat]
          if (defs.length === 0) return null
          const isCollapsed = collapsed.has(cat)
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center gap-1 px-1 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <svg
                  className={`h-3 w-3 shrink-0 text-zinc-400 transition-transform duration-150 ${isCollapsed ? '-rotate-90' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="ml-auto text-[9px] text-zinc-300 dark:text-zinc-600 tabular-nums">
                  {defs.length}
                </span>
              </button>

              {!isCollapsed && (
                <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                  {defs.map((def) => (
                    <PaletteTile
                      key={def.id}
                      def={def}
                      onDragStart={onDragStart}
                      onAdd={handleAdd}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Hint */}
      <div className="shrink-0 border-t border-zinc-200 dark:border-zinc-700 px-3 py-1.5">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
          Click to place · Drag to position
        </p>
      </div>
    </div>
  )
}
