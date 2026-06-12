'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { schemeStore } from '@/lib/store/schemeStore'
import { useSchemeStore } from '@/lib/hooks/useSchemeStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Scheme } from '@/lib/types/scheme'

function formatRelativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function SchemeCard({ scheme }: { scheme: Scheme }) {
  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (confirm(`Delete "${scheme.name}"? This cannot be undone.`)) {
      schemeStore.deleteScheme(scheme.id)
    }
  }

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault()
    schemeStore.duplicateScheme(scheme.id)
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
      <Link
        href={`/schemes/${scheme.id}`}
        className="flex flex-1 flex-col p-5"
        onClick={() => schemeStore.setActiveScheme(scheme.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {scheme.name}
          </h3>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
            Scheme
          </span>
        </div>
        {scheme.description && (
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {scheme.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
          <span>{scheme.nodes.length} {scheme.nodes.length === 1 ? 'component' : 'components'}</span>
          <span>·</span>
          <span>{scheme.wires.length} {scheme.wires.length === 1 ? 'wire' : 'wires'}</span>
          <span>·</span>
          <span>{formatRelativeTime(scheme.updatedAt)}</span>
        </div>
      </Link>
      <div className="flex items-center gap-1 border-t border-zinc-100 px-5 py-2.5 dark:border-zinc-700">
        <Link
          href={`/schemes/${scheme.id}`}
          onClick={() => schemeStore.setActiveScheme(scheme.id)}
          className="inline-flex h-7 items-center rounded-md px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Edit
        </Link>
        <Button size="sm" variant="ghost" onClick={handleDuplicate} className="text-xs">
          Duplicate
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className="ml-auto text-xs text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

function NewSchemeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function handleCreate() {
    if (!name.trim()) return
    const scheme = schemeStore.createScheme(name.trim(), description.trim())
    onClose()
    setName('')
    setDescription('')
    window.location.href = `/schemes/${scheme.id}`
  }

  function handleClose() {
    onClose()
    setName('')
    setDescription('')
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Scheme"
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="new-scheme-name"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="new-scheme-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lighting Circuit"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
        <div>
          <label
            htmlFor="new-scheme-description"
            className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Description
          </label>
          <Input
            id="new-scheme-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
          />
        </div>
      </div>
    </Modal>
  )
}

export default function SchemesPage() {
  const { schemes } = useSchemeStore()
  const [newModalOpen, setNewModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const scheme = JSON.parse(text) as Scheme
      if (!scheme.id || !scheme.name) throw new Error('Invalid scheme file')
      // Import as a new scheme with a fresh ID
      const imported: Scheme = {
        ...scheme,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        name: `${scheme.name} (imported)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      schemeStore.createScheme('__import_placeholder__')
      // Replace the freshly created scheme with the imported data
      const st = schemeStore.getState()
      const newId = st.activeSchemeId
      if (newId) {
        schemeStore.updateScheme(newId, { name: imported.name, description: imported.description })
        // Add nodes and wires via store for the active scheme
        // Since createScheme already set active, we just update the whole object
        // Use a direct state patch via a workaround — delete it and re-create properly
        schemeStore.deleteScheme(newId)
      }
      // Just add all the nodes and wires by creating from scratch
      const freshId = Date.now().toString(36) + Math.random().toString(36).slice(2)
      const fresh: Scheme = { ...imported, id: freshId }
      // Directly set via create + bulk approach — we need to push it as a raw scheme
      // Since schemeStore doesn't have importScheme, we add it manually to localStorage and reload
      const currentState = schemeStore.getState()
      const newState = {
        ...currentState,
        schemes: [...currentState.schemes, fresh],
        activeSchemeId: freshId,
      }
      localStorage.setItem('electrical-schemes-v1', JSON.stringify(newState))
      window.location.reload()
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    e.target.value = ''
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Schemes</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Design and manage electrical circuit schemes
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
              New Scheme
            </Button>
          </div>
        </div>

        {schemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-24 dark:border-zinc-700 dark:bg-zinc-900">
            <svg
              className="h-12 w-12 text-zinc-300 dark:text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
            <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">No schemes yet</p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              Create your first circuit scheme to get started
            </p>
            <Button variant="primary" className="mt-6" onClick={() => setNewModalOpen(true)}>
              Create Scheme
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schemes.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} />
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <NewSchemeModal open={newModalOpen} onClose={() => setNewModalOpen(false)} />
    </div>
  )
}
