'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import type { PanelElement } from '@/lib/types/panel'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { panelStore } from '@/lib/store/panelStore'
import { useActivePanel, useSelectedElement } from '@/lib/hooks/usePanelStore'
import { schemeStore } from '@/lib/store/schemeStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { validateElement } from '@/lib/utils/validation'
import { circuitTagColor } from '@/lib/utils/circuitTagColor'
import { getElementLabel } from '@/lib/utils/elementLabel'
import { PropertyForm } from './forms/PropertyForm'

function PropertiesForm({ element }: { element: PanelElement }) {
  const { t } = useTranslation()
  const def = ELEMENT_DEFS_MAP.get(element.typeId)
  const [label, setLabel] = useState(element.label)
  const [notes, setNotes] = useState(element.notes)
  const [circuitTag, setCircuitTag] = useState(element.circuitTag ?? '')
  const [phase, setPhase] = useState<'L1' | 'L2' | 'L3' | ''>(element.phase ?? '')
  const [elementProps, setElementProps] = useState(element.properties)
  const schemes = useSyncExternalStore(
    schemeStore.subscribe,
    () => schemeStore.getState().schemes,
    () => schemeStore.getState().schemes
  )
  const linkedSchemes = schemes.filter((s) =>
    s.nodes.some((n) => n.linkedPanelElementId === element.id)
  )

  useEffect(() => {
    setLabel(element.label)
    setNotes(element.notes)
    setCircuitTag(element.circuitTag ?? '')
    setPhase(element.phase ?? '')
    setElementProps(element.properties)
  }, [element.id, element.label, element.notes, element.circuitTag, element.phase, element.properties])

  const activePanel = useActivePanel()
  const errors = activePanel ? validateElement(element, activePanel) : []

  function save() {
    panelStore.updateElement(element.id, {
      label,
      notes,
      circuitTag: circuitTag.trim() || undefined,
      phase: (phase as 'L1' | 'L2' | 'L3') || undefined,
      properties: elementProps,
    })
  }

  function handleDelete() {
    if (confirm(t('properties.confirmDelete'))) {
      panelStore.deleteElement(element.id)
    }
  }

  const defLabel = def ? getElementLabel(def, t) : ''

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <div className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: def?.color, color: def?.textColor }}
          >
            {def?.shortLabel}
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
              {label || defLabel || element.typeId}
            </h2>
            <p className="text-xs text-zinc-500">{defLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.map((err, i) => (
              <div key={i} className={`flex items-start gap-1.5 rounded-md px-2.5 py-1.5 text-xs ${err.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{err.message}</span>
              </div>
            ))}
          </div>
        )}

        <div>
          <Label htmlFor="el-label">{t('properties.label')}</Label>
          <Input id="el-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('properties.labelPlaceholder')} />
        </div>

        <div>
          <Label htmlFor="el-notes">{t('properties.notes')}</Label>
          <Textarea id="el-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t('properties.notesPlaceholder')} />
        </div>

        <div>
          <Label htmlFor="el-circuit">{t('properties.circuitTag')}</Label>
          <div className="flex items-center gap-2">
            {circuitTag && (
              <span
                className="h-5 w-5 shrink-0 rounded-full border border-zinc-200 dark:border-zinc-700"
                style={{ background: circuitTagColor(circuitTag) }}
              />
            )}
            <Input
              id="el-circuit"
              value={circuitTag}
              onChange={(e) => setCircuitTag(e.target.value)}
              placeholder={t('properties.circuitTagPlaceholder')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="el-phase">{t('properties.phase')}</Label>
          <div className="flex gap-1.5 mt-1">
            {(['', 'L1', 'L2', 'L3'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPhase(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold border transition-colors touch-manipulation min-h-[32px] ${
                  phase === p
                    ? p === 'L1' ? 'bg-red-500 border-red-500 text-white'
                      : p === 'L2' ? 'bg-amber-400 border-amber-400 text-white'
                      : p === 'L3' ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-zinc-200 border-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200'
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400'
                }`}
              >
                {p === '' ? '—' : p}
              </button>
            ))}
          </div>
        </div>

        <PropertyForm props={elementProps} onChange={setElementProps} />

        {linkedSchemes.length > 0 && (
          <div className="rounded-md bg-blue-50 px-2.5 py-2 dark:bg-blue-900/20">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-blue-500 dark:text-blue-400">
              {t('properties.referencedInSchemes')}
            </p>
            <div className="space-y-0.5">
              {linkedSchemes.map((s) => (
                <a
                  key={s.id}
                  href={`/schemes/edit?id=${s.id}`}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
                >
                  <svg className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="pt-1">
          <p className="text-xs text-zinc-400">
            {t('properties.slotInfo', {
              start: element.slotStart + 1,
              end: element.slotStart + element.slotWidth,
              width: element.slotWidth,
            })}
          </p>
        </div>
      </div>

      <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-700 flex gap-2">
        <Button variant="danger" size="sm" onClick={handleDelete} className="shrink-0">
          {t('properties.delete')}
        </Button>
        <Button variant="primary" size="sm" onClick={save} className="flex-1">
          {t('properties.apply')}
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ className = '' }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <div className={['flex h-full items-center justify-center p-6', className].join(' ')}>
      <div className="text-center">
        <svg className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {t('properties.empty')}
        </p>
      </div>
    </div>
  )
}

interface PropertiesPanelProps {
  className?: string
}

export function PropertiesPanel({ className = '' }: PropertiesPanelProps) {
  const element = useSelectedElement()

  if (!element) {
    return <EmptyState className={className} />
  }

  return (
    <div className={['flex flex-col h-full overflow-hidden', className].join(' ')}>
      <PropertiesForm element={element} />
    </div>
  )
}
