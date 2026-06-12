'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { readJsonFile } from '@/lib/utils/importExport'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import type { Panel } from '@/lib/types/panel'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function PanelCard({ panel }: { panel: Panel }) {
  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (confirm(`Delete panel "${panel.name}"? This cannot be undone.`)) {
      panelStore.deletePanel(panel.id)
    }
  }

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault()
    panelStore.duplicatePanel(panel.id)
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <Link
        href={`/panels/${panel.id}`}
        className="flex flex-1 flex-col p-5"
        onClick={() => panelStore.setActivePanel(panel.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {panel.name}
          </h3>
          <Badge variant="outline">{panel.voltage}V</Badge>
        </div>
        {panel.description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">{panel.description}</p>
        )}
        {panel.location && (
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {panel.location}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <span>{panel.rails.length} rail{panel.rails.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{panel.elements.length} element{panel.elements.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{formatDate(panel.updatedAt)}</span>
        </div>
      </Link>
      <div className="flex items-center gap-1 border-t border-zinc-100 px-5 py-2.5 dark:border-zinc-700">
        <Button size="sm" variant="ghost" onClick={handleDuplicate} className="text-xs">
          Duplicate
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto">
          Delete
        </Button>
      </div>
    </div>
  )
}

function NewPanelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const { settings } = usePanelStore()

  function handleCreate() {
    if (!name.trim()) return
    const panel = panelStore.createPanel(name.trim())
    panelStore.setActivePanel(panel.id)
    onClose()
    setName('')
    window.location.href = `/panels/${panel.id}`
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New Panel"
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>
            Create Panel
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="new-panel-name" required>Panel Name</Label>
          <Input
            id="new-panel-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Main Distribution Board"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <p className="text-xs text-zinc-500">
          A default rail ({settings.defaultSlotCount} slots) will be added automatically.
        </p>
      </div>
    </Modal>
  )
}

export default function PanelsPage() {
  const { panels } = usePanelStore()
  const [newModalOpen, setNewModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const panel = await readJsonFile(file)
      panelStore.importPanel(panel)
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    e.target.value = ''
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Panels</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Design and manage your electrical distribution boards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import
            </Button>
            <Button variant="primary" onClick={() => setNewModalOpen(true)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Panel
            </Button>
          </div>
        </div>

        {panels.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-24 dark:border-zinc-700 dark:bg-zinc-900">
            <svg className="h-12 w-12 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
            <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">No panels yet</p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Create a new panel or import an existing one</p>
            <Button variant="primary" className="mt-6" onClick={() => setNewModalOpen(true)}>
              Create your first panel
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {panels.map((panel) => (
              <PanelCard key={panel.id} panel={panel} />
            ))}
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      <NewPanelModal open={newModalOpen} onClose={() => setNewModalOpen(false)} />
    </div>
  )
}
