'use client'

import { Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { schemeStore } from '@/lib/store/schemeStore'
import { useSchemeStore } from '@/lib/hooks/useSchemeStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { SchemePalette } from '@/components/scheme/SchemePalette'
import { SchemeCanvas } from '@/components/scheme/SchemeCanvas'
import { SchemeEditorToolbar } from '@/components/scheme/SchemeEditorToolbar'
import { SchemeProperties } from '@/components/scheme/SchemeProperties'
import { BottomSheet } from '@/components/ui/BottomSheet'

export default function SchemeEditorPage() {
  return (
    <Suspense fallback={null}>
      <SchemeEditorInner />
    </Suspense>
  )
}

function SchemeEditorInner() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id') ?? ''
  const { t } = useTranslation()
  const storeState = useSchemeStore()
  const { schemes, selectedNodeId, selectedWireId, connectingFrom } = storeState
  const { panels } = usePanelStore()
  const [zoom, setZoom] = useState(1)
  const [wireRouting, setWireRouting] = useState<'orthogonal' | 'straight'>('orthogonal')
  const [gridSize, setGridSize] = useState<6 | 12 | 24 | 48>(24)
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false)
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false)

  // Track undo/redo availability via the main store subscription
  const canUndo = useSyncExternalStore(
    schemeStore.subscribe.bind(schemeStore),
    () => schemeStore.canUndo(),
    () => false,
  )
  const canRedo = useSyncExternalStore(
    schemeStore.subscribe.bind(schemeStore),
    () => schemeStore.canRedo(),
    () => false,
  )

  // Save status indicator
  const saveStatus = useSyncExternalStore(
    schemeStore.subscribeSaveStatus,
    schemeStore.getSaveStatus,
    () => 'saved' as const,
  )

  useEffect(() => {
    if (schemeStore.getState().activeSchemeId !== id) {
      schemeStore.setActiveScheme(id)
    }
  }, [id])

  // Keyboard shortcuts: Ctrl/Cmd+Z (undo), Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y (redo)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return
      }
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        schemeStore.undo()
      } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
        e.preventDefault()
        schemeStore.redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const scheme = schemes.find((s) => s.id === id)

  if (!scheme) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Scheme not found</p>
          <Link
            href="/schemes"
            className="mt-3 inline-flex text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to schemes
          </Link>
        </div>
      </div>
    )
  }

  const selectedNode = selectedNodeId
    ? scheme.nodes.find((n) => n.id === selectedNodeId) ?? null
    : null
  const selectedWire = selectedWireId
    ? scheme.wires.find((w) => w.id === selectedWireId) ?? null
    : null

  function handleZoomIn() {
    setZoom((z) => Math.min(4, parseFloat((z + 0.1).toFixed(2))))
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(0.2, parseFloat((z - 0.1).toFixed(2))))
  }

  function handleZoomReset() {
    setZoom(1)
  }

  function handleExportJson() {
    const json = schemeStore.exportJson(id)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(scheme?.name ?? 'scheme').replace(/[^a-z0-9]/gi, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <SchemeEditorToolbar
        schemeName={scheme.name}
        onRename={(name) => schemeStore.updateScheme(scheme.id, { name })}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        canUndo={canUndo}
        canRedo={canRedo}
        saveStatus={saveStatus}
        wireRouting={wireRouting}
        onWireRoutingChange={setWireRouting}
        gridSize={gridSize}
        onGridSizeChange={setGridSize}
        onExportJson={handleExportJson}
      />

      {/* Body: palette | canvas | properties (sidebars hidden below lg:) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — palette (desktop only) */}
        <aside className="hidden lg:flex w-52 shrink-0 flex-col overflow-hidden">
          <SchemePalette />
        </aside>

        {/* Canvas */}
        <div className="relative flex-1 overflow-hidden">
          <SchemeCanvas scheme={scheme} zoom={zoom} onZoomChange={setZoom} wireRouting={wireRouting} gridSize={gridSize} />
        </div>

        {/* Right sidebar — properties (desktop only) */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col overflow-hidden border-l border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <SchemeProperties
            scheme={scheme}
            selectedNode={selectedNode}
            selectedWire={selectedWire}
            panels={panels}
            connectingFrom={connectingFrom}
          />
        </aside>
      </div>

      {/* Mobile FAB — palette + properties toggles (visible below lg:) */}
      <div
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-full border border-zinc-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <button
          onClick={() => setMobilePaletteOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white active:scale-95 transition-transform touch-manipulation min-h-[40px]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('schemes.palette.title')}
        </button>
        <button
          onClick={() => setMobilePropsOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 active:scale-95 transition-transform touch-manipulation min-h-[40px]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          {t('schemes.editor.properties')}
        </button>
      </div>

      {/* Mobile bottom sheets */}
      <BottomSheet
        open={mobilePaletteOpen}
        onClose={() => setMobilePaletteOpen(false)}
        title={t('schemes.palette.title')}
        heightPct={80}
      >
        <SchemePalette />
      </BottomSheet>
      <BottomSheet
        open={mobilePropsOpen}
        onClose={() => setMobilePropsOpen(false)}
        title={t('schemes.editor.properties')}
        heightPct={80}
      >
        <SchemeProperties
          scheme={scheme}
          selectedNode={selectedNode}
          selectedWire={selectedWire}
          panels={panels}
        />
      </BottomSheet>
    </div>
  )
}
