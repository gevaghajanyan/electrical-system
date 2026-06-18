'use client'

import { use, useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { readJsonFile } from '@/lib/utils/importExport'
import type { ElementTypeId } from '@/lib/types/panel'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { hasSlotCollision } from '@/lib/utils/slotUtils'
import { ElementPalette } from '@/components/board/ElementPalette'
import { PropertiesPanel } from '@/components/board/PropertiesPanel'
import { PanelCanvas } from '@/components/board/PanelCanvas'
import { BoardToolbar } from '@/components/board/BoardToolbar'
import { SchematicView } from '@/components/board/SchematicView'
import { ConnectionMatrix } from '@/components/board/ConnectionMatrix'
import { SaveStatusIndicator } from '@/components/SaveStatusIndicator'
import { ShortcutModal } from '@/components/ShortcutModal'

export default function PanelEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { t } = useTranslation()
  const { panels, selectedElementId } = usePanelStore()
  const panel = panels.find((p) => p.id === id) ?? null

  const [draggingTypeId, setDraggingTypeId] = useState<ElementTypeId | null>(null)
  const [view, setView] = useState<'canvas' | 'schematic' | 'matrix'>('canvas')
  const [multiSelectedIds, setMultiSelectedIds] = useState<Set<string>>(new Set())
  const [multiTagInput, setMultiTagInput] = useState('')
  const [shortcutModalOpen, setShortcutModalOpen] = useState(false)
  const [annotationMode, setAnnotationMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (panelStore.getState().activePanelId !== id) {
      panelStore.setActivePanel(id)
    }
  }, [id])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

    const isMod = e.metaKey || e.ctrlKey

    // Undo
    if (isMod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      panelStore.undo()
      return
    }
    // Redo
    if (isMod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault()
      panelStore.redo()
      return
    }
    // Copy
    if (isMod && e.key === 'c' && selectedElementId) {
      e.preventDefault()
      panelStore.copyElement(selectedElementId)
      return
    }
    // Paste
    if (isMod && e.key === 'v') {
      e.preventDefault()
      const pasted = panelStore.pasteElement()
      if (pasted) panelStore.selectElement(pasted.id)
      return
    }
    // Bulk duplicate multi-selected (Cmd+D)
    if (isMod && e.key === 'd' && multiSelectedIds.size > 1) {
      e.preventDefault()
      const newIds = new Set<string>()
      multiSelectedIds.forEach(elId => {
        panelStore.copyElement(elId)
        const pasted = panelStore.pasteElement()
        if (pasted) newIds.add(pasted.id)
      })
      if (newIds.size > 0) setMultiSelectedIds(newIds)
      return
    }
    // Duplicate single element (Cmd+D)
    if (isMod && e.key === 'd' && selectedElementId) {
      e.preventDefault()
      panelStore.copyElement(selectedElementId)
      const pasted = panelStore.pasteElement()
      if (pasted) panelStore.selectElement(pasted.id)
      return
    }
    // Bulk delete multi-selected (window-level, works even without canvas focus)
    if ((e.key === 'Delete' || e.key === 'Backspace') && multiSelectedIds.size > 0) {
      e.preventDefault()
      multiSelectedIds.forEach(id => panelStore.deleteElement(id))
      setMultiSelectedIds(new Set())
      return
    }
    // Find/highlight (Cmd+F)
    if (isMod && e.key === 'f') {
      e.preventDefault()
      searchInputRef.current?.focus()
      return
    }
    // Clear search (Esc when search active)
    if (e.key === 'Escape' && searchQuery) {
      setSearchQuery('')
      return
    }
    // Show shortcuts
    if (e.key === '?') {
      setShortcutModalOpen(true)
      return
    }

    // Keyboard element placement (single-key, canvas view only, no modifier)
    if (!isMod && view === 'canvas') {
      const placementMap: Record<string, ElementTypeId> = {
        b: 'mcb_1p',
        m: 'mcb_2p',
        '3': 'mcb_3p',
        d: 'rcd_2p',
        o: 'rcbo_1p',
        i: 'isolator_2p',
        s: 'surge_protector',
        n: 'neutral_bar',
      }
      const typeId = placementMap[e.key.toLowerCase()]
      if (typeId) {
        const activePanel = panelStore.getActivePanel()
        const def = ELEMENT_DEFS_MAP.get(typeId)
        if (activePanel && def) {
          for (const rail of activePanel.rails) {
            let placed = false
            for (let slot = 0; slot <= rail.slotCount - def.defaultSlotWidth; slot++) {
              if (!hasSlotCollision(activePanel.elements, rail.id, slot, def.defaultSlotWidth)) {
                panelStore.addElement({
                  typeId,
                  railId: rail.id,
                  slotStart: slot,
                  slotWidth: def.defaultSlotWidth,
                  label: def.defaultLabel,
                  notes: '',
                  properties: { ...def.defaultProperties },
                })
                placed = true
                break
              }
            }
            if (placed) break
          }
        }
        return
      }
    }
  }, [selectedElementId, multiSelectedIds, searchQuery, view])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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

        {/* Save indicator + undo/redo */}
        <div className="ml-auto flex items-center gap-2">
          <SaveStatusIndicator />
          <button
            onClick={() => setShortcutModalOpen(true)}
            title="Keyboard shortcuts (?)"
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 text-xs font-medium"
          >
            ?
          </button>
          <button
            onClick={() => setAnnotationMode((m) => !m)}
            title="Toggle annotation mode"
            className={`flex h-6 w-6 items-center justify-center rounded text-xs transition-colors ${
              annotationMode
                ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'
                : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <button
            onClick={() => panelStore.undo()}
            disabled={!panelStore.canUndo()}
            title="Undo (⌘Z)"
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={() => panelStore.redo()}
            disabled={!panelStore.canRedo()}
            title="Redo (⌘⇧Z)"
            className="flex h-6 w-6 items-center justify-center rounded text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          {selectedElementId && (
            <>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
              <button
                onClick={() => { panelStore.copyElement(selectedElementId); const p = panelStore.pasteElement(); if (p) panelStore.selectElement(p.id) }}
                title="Duplicate (⌘D)"
                className="flex h-6 items-center gap-1 rounded px-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
            </>
          )}
        </div>
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
        <div className="relative flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          {/* View tabs + search */}
          <div className="shrink-0 flex items-center gap-0.5 px-2 py-1.5 border-b border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
            {(['canvas', 'schematic', 'matrix'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-0.5 rounded text-xs font-medium transition-colors ${
                  view === v
                    ? 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {v === 'canvas' ? t('editor.layout') : v === 'schematic' ? t('editor.schematic') : 'Matrix'}
              </button>
            ))}
            {view === 'canvas' && (
              <div className="ml-auto flex items-center gap-1 relative">
                <svg className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Escape') { setSearchQuery(''); (e.target as HTMLInputElement).blur() } }}
                  placeholder="Find element… (⌘F)"
                  className="w-40 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 pl-6 pr-2 py-0.5 text-[11px] text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs">✕</button>
                )}
              </div>
            )}
          </div>

          {view === 'canvas' ? (
            <PanelCanvas
              panel={panel}
              draggingTypeId={draggingTypeId}
              onDragEnd={handleDragEnd}
              className="flex-1 min-h-0"
              selectedElementIds={multiSelectedIds}
              onMultiSelectChange={setMultiSelectedIds}
              annotationMode={annotationMode}
              searchQuery={searchQuery}
            />
          ) : view === 'schematic' ? (
            <SchematicView panel={panel} />
          ) : (
            <ConnectionMatrix panel={panel} />
          )}

          {/* Multi-select floating action bar */}
          {view === 'canvas' && multiSelectedIds.size > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/95 px-4 py-2 shadow-xl backdrop-blur-sm">
              <span className="text-sm font-medium text-white">
                {multiSelectedIds.size} selected
              </span>
              {panel.rails.length > 1 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400">Move to</span>
                  <select
                    className="rounded-lg bg-zinc-800 border border-zinc-600 px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                    defaultValue=""
                    onChange={(e) => {
                      if (!e.target.value) return
                      panelStore.bulkMoveToRail(Array.from(multiSelectedIds), e.target.value)
                      setMultiSelectedIds(new Set())
                      e.target.value = ''
                    }}
                  >
                    <option value="" disabled>Rail…</option>
                    {panel.rails.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-xs text-zinc-400">Tag</span>
                <input
                  value={multiTagInput}
                  onChange={(e) => setMultiTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      panelStore.bulkSetCircuitTag(Array.from(multiSelectedIds), multiTagInput.trim())
                      setMultiTagInput('')
                    }
                    e.stopPropagation()
                  }}
                  placeholder="e.g. C1"
                  className="w-16 rounded-md border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-white placeholder-zinc-500 focus:border-blue-400 focus:outline-none"
                />
                <button
                  onClick={() => { panelStore.bulkSetCircuitTag(Array.from(multiSelectedIds), multiTagInput.trim()); setMultiTagInput('') }}
                  className="rounded-md bg-zinc-700 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-600"
                >Apply</button>
              </div>
              <div className="h-4 w-px bg-zinc-700" />
              <button
                onClick={() => {
                  const newIds = new Set<string>()
                  multiSelectedIds.forEach(elId => {
                    panelStore.copyElement(elId)
                    const pasted = panelStore.pasteElement()
                    if (pasted) newIds.add(pasted.id)
                  })
                  if (newIds.size > 0) setMultiSelectedIds(newIds)
                }}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-600"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicate
              </button>
              <button
                onClick={() => {
                  multiSelectedIds.forEach(id => panelStore.deleteElement(id))
                  setMultiSelectedIds(new Set())
                }}
                className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-600"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete {multiSelectedIds.size}
              </button>
              <button
                onClick={() => setMultiSelectedIds(new Set())}
                className="text-xs text-zinc-400 transition-colors hover:text-white"
              >
                ✕
              </button>
            </div>
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
      <ShortcutModal open={shortcutModalOpen} onClose={() => setShortcutModalOpen(false)} />
    </div>
  )
}
