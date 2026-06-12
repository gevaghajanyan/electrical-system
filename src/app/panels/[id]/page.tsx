'use client'

import { use, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { readJsonFile } from '@/lib/utils/importExport'
import type { ElementTypeId } from '@/lib/types/panel'
import { ElementPalette } from '@/components/board/ElementPalette'
import { PropertiesPanel } from '@/components/board/PropertiesPanel'
import { PanelCanvas } from '@/components/board/PanelCanvas'
import { BoardToolbar } from '@/components/board/BoardToolbar'
import { SchematicView } from '@/components/board/SchematicView'

export default function PanelEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { t } = useTranslation()
  const { panels } = usePanelStore()
  const panel = panels.find((p) => p.id === id) ?? null

  const [draggingTypeId, setDraggingTypeId] = useState<ElementTypeId | null>(null)
  const [view, setView] = useState<'canvas' | 'schematic'>('canvas')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Must be in an effect, never during render — mutating the store during render triggers an immediate
  // re-render of all subscribers, creating a render loop.
  useEffect(() => {
    if (panelStore.getState().activePanelId !== id) {
      panelStore.setActivePanel(id)
    }
  }, [id])

  if (!panel) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{t('editor.notFound')}</p>
          <Link
            href="/panels"
            className="mt-3 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            {t('editor.backToPanels')}
          </Link>
        </div>
      </div>
    )
  }

  function handleDragStartFromPalette(typeId: string) {
    setDraggingTypeId(typeId as ElementTypeId)
  }

  function handleDragEnd() {
    setDraggingTypeId(null)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const imported = await readJsonFile(file)
      panelStore.importPanel(imported)
    } catch (err) {
      alert(t('panels.importError', { error: err instanceof Error ? err.message : 'Unknown error' }))
    }
    e.target.value = ''
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Nav breadcrumb */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900">
        <Link
          href="/panels"
          className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          {t('nav.panels')}
        </Link>
        <svg className="h-3 w-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
          {panel.name}
        </span>
      </div>

      {/* Toolbar */}
      <BoardToolbar
        panel={panel}
        onImport={() => fileInputRef.current?.click()}
      />

      {/* Main layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Element palette (left sidebar) */}
        <aside className="w-52 shrink-0 flex flex-col overflow-hidden border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <ElementPalette onDragStart={handleDragStartFromPalette} />
        </aside>

        {/* Canvas / Schematic (main area) */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {/* View tabs */}
          <div className="shrink-0 flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            {(['canvas', 'schematic'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-0.5 rounded text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {v === 'canvas' ? t('editor.layout') : t('editor.schematic')}
              </button>
            ))}
          </div>

          {view === 'canvas' ? (
            <PanelCanvas
              panel={panel}
              draggingTypeId={draggingTypeId}
              onDragEnd={handleDragEnd}
              className="flex-1 min-h-0"
            />
          ) : (
            <SchematicView panel={panel} />
          )}
        </div>

        {/* Properties panel (right sidebar) */}
        <aside className="w-56 shrink-0 flex flex-col overflow-hidden border-l border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <PropertiesPanel />
        </aside>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />
    </div>
  )
}
