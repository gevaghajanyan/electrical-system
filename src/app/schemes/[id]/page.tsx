'use client'

import { use, useState, useEffect, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { schemeStore } from '@/lib/store/schemeStore'
import { useSchemeStore } from '@/lib/hooks/useSchemeStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SchemePalette } from '@/components/scheme/SchemePalette'
import { SchemeCanvas } from '@/components/scheme/SchemeCanvas'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SchemeEditorPage({ params }: PageProps) {
  const { id } = use(params)
  const storeState = useSchemeStore()
  const { schemes, selectedNodeId, selectedWireId } = storeState
  const { panels } = usePanelStore()
  const [zoom, setZoom] = useState(1)

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
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
        <Link
          href="/schemes"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Schemes
        </Link>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
          {scheme.name}
        </span>

        <div className="flex-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={handleZoomOut} title="Zoom out">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          <button
            onClick={handleZoomReset}
            className="w-14 rounded-md px-1 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button size="icon" variant="ghost" onClick={handleZoomIn} title="Zoom in">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => schemeStore.undo()}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${!canUndo ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <svg className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 010 16H3m0-16l4-4m-4 4l4 4" />
            </svg>
          </button>
          <button
            onClick={() => schemeStore.redo()}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${!canRedo ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            <svg className="h-3.5 w-3.5 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 000 16h10m0-16l-4-4m4 4l-4 4" />
            </svg>
          </button>
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

        {/* Save status */}
        {saveStatus === 'saving' ? (
          <span className="text-xs text-blue-400">Saving…</span>
        ) : (
          <span className="text-xs text-zinc-400">Saved</span>
        )}

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />

        <Button size="sm" variant="outline" onClick={handleExportJson}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export JSON
        </Button>
      </div>

      {/* Body: palette | canvas | properties */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — palette */}
        <div className="w-48 shrink-0">
          <SchemePalette />
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <SchemeCanvas scheme={scheme} zoom={zoom} onZoomChange={setZoom} />
        </div>

        {/* Right sidebar — properties */}
        <div className="w-52 shrink-0 overflow-y-auto border-l border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-3 py-3 dark:border-zinc-700">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Properties
            </p>
          </div>

          <div className="p-3">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Type</p>
                  <p className="text-xs text-zinc-700 dark:text-zinc-200">{selectedNode.type}</p>
                </div>
                <div>
                  <label
                    htmlFor="node-label"
                    className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
                  >
                    Label
                  </label>
                  <Input
                    id="node-label"
                    value={selectedNode.label}
                    onChange={(e) =>
                      schemeStore.updateNode(selectedNode.id, { label: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      schemeStore.updateNode(selectedNode.id, {
                        rotation: ((((selectedNode.rotation ?? 0) + 90) % 360) as 0 | 90 | 180 | 270),
                      })
                    }
                  >
                    <svg className="h-3.5 w-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Rotate 90°
                  </Button>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Position</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    x: {selectedNode.x}, y: {selectedNode.y}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Rotation</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    {selectedNode.rotation ?? 0}°
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Linked Panel Element</p>
                  <select
                    value={selectedNode.linkedPanelElementId ?? ''}
                    onChange={(e) => schemeStore.linkNodeToPanel(selectedNode.id, e.target.value || null)}
                    className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <option value="">— Not linked —</option>
                    {panels.flatMap((panel) =>
                      panel.elements.map((el) => (
                        <option key={el.id} value={el.id}>
                          {panel.name} / {el.label || el.typeId}
                        </option>
                      ))
                    )}
                  </select>
                  {selectedNode.linkedPanelElementId && (
                    <p className="mt-1 text-[10px] text-blue-500">Linked to panel element</p>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => schemeStore.deleteNode(selectedNode.id)}
                >
                  Delete Component
                </Button>
              </div>
            ) : selectedWire ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">Wire</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 break-all">
                    {selectedWire.fromNodeId.slice(0, 8)}…:{selectedWire.fromPortIndex}
                    {' → '}
                    {selectedWire.toNodeId.slice(0, 8)}…:{selectedWire.toPortIndex}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="wire-label"
                    className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400"
                  >
                    Label
                  </label>
                  <Input
                    id="wire-label"
                    value={selectedWire.label}
                    onChange={(e) =>
                      schemeStore.updateWire(selectedWire.id, { label: e.target.value })
                    }
                    className="text-xs"
                  />
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full"
                  onClick={() => schemeStore.deleteWire(selectedWire.id)}
                >
                  Delete Wire
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <svg
                  className="h-8 w-8 text-zinc-300 dark:text-zinc-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
                  />
                </svg>
                <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                  Select a component to edit
                </p>
              </div>
            )}
          </div>

          {/* Scheme stats */}
          <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Scheme Info
            </p>
            <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <div className="flex justify-between">
                <span>Components</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{scheme.nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Wires</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-200">{scheme.wires.length}</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="border-t border-zinc-200 p-3 dark:border-zinc-700">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
              Tips
            </p>
            <ul className="space-y-1 text-xs text-zinc-400 dark:text-zinc-500">
              <li>Click port dots to connect wires</li>
              <li>Drag nodes to move them</li>
              <li>R to rotate selected node 90°</li>
              <li>Middle mouse to pan</li>
              <li>Ctrl+wheel to zoom</li>
              <li>Delete/Backspace to remove</li>
              <li>Esc to cancel</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
