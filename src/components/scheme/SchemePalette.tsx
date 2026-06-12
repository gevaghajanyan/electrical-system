'use client'

import { schemeStore } from '@/lib/store/schemeStore'
import { SCHEME_DEF_LIST } from '@/lib/constants/schemeDefs'
import type { SchemeNodeType } from '@/lib/types/scheme'

// Group the palette items
const GROUPS: { label: string; types: SchemeNodeType[] }[] = [
  { label: 'Power', types: ['power_ac'] },
  { label: 'Switching', types: ['switch_spst'] },
  { label: 'Loads', types: ['lamp_230', 'led_220'] },
  { label: 'Other', types: ['transformer_sd', 'junction'] },
]

export function SchemePalette() {
  function handleDragStart(e: React.DragEvent<HTMLDivElement>, type: SchemeNodeType) {
    e.dataTransfer.setData('schemeNodeType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  function handleClick(type: SchemeNodeType) {
    schemeStore.addNode(type, 200, 200)
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Components
        </p>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Drag or click to add</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-3">
        {GROUPS.map((group) => {
          const items = SCHEME_DEF_LIST.filter((d) => group.types.includes(d.type))
          if (items.length === 0) return null
          return (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                {group.label}
              </p>
              <div className="space-y-1.5">
                {items.map((def) => (
                  <div
                    key={def.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, def.type)}
                    onClick={() => handleClick(def.type)}
                    className="group flex cursor-grab items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-2 transition-colors hover:border-zinc-300 hover:bg-white active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-750"
                    title={def.description}
                  >
                    {/* Color chip */}
                    <span
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: def.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      {def.label}
                    </span>
                    {/* Port count badge */}
                    <span className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500">
                      {def.ports.length}p
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
