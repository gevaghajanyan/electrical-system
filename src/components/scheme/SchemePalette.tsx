'use client'

import { useTranslation } from 'react-i18next'
import { schemeStore } from '@/lib/store/schemeStore'
import { SCHEME_DEF_LIST } from '@/lib/constants/schemeDefs'
import type { SchemeNodeType } from '@/lib/types/scheme'
import { renderSchemeSymbol } from './symbols'

interface Group {
  id: string
  labelKey: string
  types: SchemeNodeType[]
}

const GROUPS: Group[] = [
  { id: 'power',      labelKey: 'schemes.palette.groups.power',      types: ['power_ac', 'dc_supply', 'battery'] },
  { id: 'protection', labelKey: 'schemes.palette.groups.protection', types: ['mcb', 'rcd', 'overload'] },
  { id: 'switching',  labelKey: 'schemes.palette.groups.switching',  types: ['switch_spst', 'push_button', 'switch_2way', 'switch_intermediate', 'contactor'] },
  { id: 'loads',      labelKey: 'schemes.palette.groups.loads',      types: ['lamp_230', 'led_220', 'motor', 'bell'] },
  { id: 'outlets',    labelKey: 'schemes.palette.groups.outlets',    types: ['socket_outlet'] },
  { id: 'other',      labelKey: 'schemes.palette.groups.other',      types: ['transformer_sd', 'kwh_meter', 'junction'] },
]

function PaletteTile({
  type,
  label,
  color,
  width,
  height,
}: {
  type: SchemeNodeType
  label: string
  color: string
  width: number
  height: number
}) {
  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.dataTransfer.setData('schemeNodeType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }
  function handleClick() {
    schemeStore.addNode(type, 200, 200)
  }

  // Compute a fitting viewBox padding around the symbol
  const pad = 8
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      title={label}
      className="group flex flex-col items-stretch cursor-grab select-none rounded-xl border border-zinc-200 bg-white p-2 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-sm active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 touch-manipulation min-h-[86px]"
    >
      {/* Symbol preview */}
      <div className="flex flex-1 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900/60">
        <svg
          viewBox={`${-pad} ${-pad} ${width + pad * 2} ${height + pad * 2}`}
          className="h-[44px] w-auto"
          aria-hidden
        >
          {renderSchemeSymbol(type)}
        </svg>
      </div>
      {/* Caption */}
      <div className="mt-1.5 flex items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ background: color }}
        />
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-zinc-700 dark:text-zinc-200">
          {label}
        </span>
      </div>
    </div>
  )
}

export function SchemePalette() {
  const { t } = useTranslation()

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60">
      <div className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 px-4 py-3 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {t('schemes.palette.title')}
        </p>
        <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          {t('schemes.palette.hint')}
        </p>
      </div>

      <div className="flex-1 space-y-5 p-3">
        {GROUPS.map((group) => {
          const items = SCHEME_DEF_LIST.filter((d) => group.types.includes(d.type))
          if (items.length === 0) return null
          return (
            <div key={group.id}>
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                {t(group.labelKey)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {items.map((def) => (
                  <PaletteTile
                    key={def.type}
                    type={def.type}
                    label={t(`schemes.palette.nodes.${def.type}`, { defaultValue: def.label })}
                    color={def.color}
                    width={def.width}
                    height={def.height}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
