'use client'

import { useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import type { ElementCategory, ElementTypeId } from '@/lib/types/panel'
import type { ElementDef } from '@/lib/constants/elementDefs'
import { ELEMENT_DEFS, ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { useActivePanel } from '@/lib/hooks/usePanelStore'
import { panelStore } from '@/lib/store/panelStore'
import { recentElementsStore } from '@/lib/store/recentElementsStore'
import { hasSlotCollision } from '@/lib/utils/slotUtils'
import { getElementLabel, getElementDescription } from '@/lib/utils/elementLabel'
import { DeviceIcon } from './palette/DeviceIcon'

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
  const { t } = useTranslation()
  const label = getElementLabel(def, t)
  const desc = getElementDescription(def, t)
  return (
    <button
      type="button"
      draggable
      onDragStart={() => onDragStart(def.id)}
      onClick={() => onAdd(def.id)}
      title={`${label}\n${desc}\n${t('palette.hint')}`}
      className="group relative flex flex-col items-stretch cursor-grab select-none rounded-lg overflow-hidden border border-zinc-200 bg-white hover:border-blue-400 hover:shadow-md active:cursor-grabbing active:scale-95 transition-all duration-100 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-500 touch-manipulation min-h-[92px]"
    >
      {/* Realistic SVG device face — ABB S200 / Schneider iC60 inspired */}
      <div className="flex-1 min-h-0 flex items-center justify-center p-1.5 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900">
        <DeviceIcon def={def} label={label} className="max-h-[56px] w-auto drop-shadow" />
      </div>

      {/* Caption */}
      <div className="border-t border-zinc-100 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-1">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[10px] font-semibold text-zinc-700 dark:text-zinc-200 leading-tight">
            {label}
          </span>
          <span
            className="shrink-0 rounded px-1 py-[1px] text-[9px] font-bold tabular-nums text-white"
            style={{ backgroundColor: def.color }}
          >
            {def.poles > 0 ? `${def.poles}P` : `${def.defaultSlotWidth}W`}
          </span>
        </div>
      </div>
    </button>
  )
}

interface ElementPaletteProps {
  onDragStart: (typeId: string) => void
  className?: string
}

export function ElementPalette({ onDragStart, className = '' }: ElementPaletteProps) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [collapsed, setCollapsed] = useState<Set<ElementCategory>>(new Set())
  const activePanel = useActivePanel()
  const recentTypeIds = useSyncExternalStore(
    recentElementsStore.subscribe,
    recentElementsStore.getRecents,
    () => [] as string[]
  )
  const recentDefs = recentTypeIds
    .map((id) => ELEMENT_DEFS_MAP.get(id as ElementTypeId))
    .filter((d): d is ElementDef => !!d)

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
          recentElementsStore.push(typeId)
          return
        }
      }
    }
  }

  function handleDragStartTracked(typeId: string) {
    recentElementsStore.push(typeId)
    onDragStart(typeId)
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
      acc[cat] = ELEMENT_DEFS.filter((d) => {
        if (d.category !== cat) return false
        if (!q) return true
        // Search across both the English def and the current-locale translation
        const label = getElementLabel(d, t).toLowerCase()
        const desc = getElementDescription(d, t).toLowerCase()
        return (
          label.includes(q) ||
          desc.includes(q) ||
          d.label.toLowerCase().includes(q) ||
          d.shortLabel.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
        )
      })
      return acc
    },
    { protection: [], switching: [], distribution: [], accessory: [] }
  )

  return (
    <div className={['flex flex-col h-full overflow-hidden', className].join(' ')}>
      {/* Header + search */}
      <div className="shrink-0 border-b border-zinc-200 dark:border-zinc-700 px-3 pt-3 pb-2 space-y-2">
        <h2 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t('palette.title')}</h2>
        <input
          type="text"
          placeholder={t('palette.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        />
      </div>

      {/* Scrollable category grid */}
      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2 space-y-2">
        {!search && recentDefs.length > 0 && (
          <div>
            <div className="px-1 py-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {t('palette.recent')}
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              {recentDefs.map((def) => (
                <PaletteTile
                  key={def.id}
                  def={def}
                  onDragStart={handleDragStartTracked}
                  onAdd={handleAdd}
                />
              ))}
            </div>
          </div>
        )}
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
                  {t(`palette.categories.${cat}`)}
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
                      onDragStart={handleDragStartTracked}
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
          {t('palette.hint')}
        </p>
      </div>
    </div>
  )
}
