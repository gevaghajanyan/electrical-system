'use client'

import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { readJsonFile } from '@/lib/utils/importExport'
import { PANEL_TEMPLATES, createPanelFromTemplate } from '@/lib/constants/panelTemplates'
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

type SortKey = 'updated' | 'name' | 'devices'

function PanelCard({ panel, searchQuery }: { panel: Panel; searchQuery?: string }) {
  const { t } = useTranslation()

  const matchedElements = useMemo(() => {
    if (!searchQuery?.trim()) return []
    const q = searchQuery.toLowerCase()
    return panel.elements.filter(
      (el) => el.label.toLowerCase().includes(q) || el.typeId.toLowerCase().includes(q) || el.circuitTag?.toLowerCase().includes(q)
    ).slice(0, 4)
  }, [panel.elements, searchQuery])

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (confirm(t('panels.card.confirmDelete', { name: panel.name }))) {
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
        href={`/panels/edit?id=${panel.id}`}
        className="flex flex-1 flex-col p-5"
        onClick={() => panelStore.setActivePanel(panel.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">{panel.name}</h3>
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
          <span>{t('panels.card.rails', { count: panel.rails.length })}</span>
          <span>·</span>
          <span>{t('panels.card.elements', { count: panel.elements.length })}</span>
          <span>·</span>
          <span>{formatDate(panel.updatedAt)}</span>
        </div>
        {matchedElements.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {matchedElements.map((el) => (
              <span key={el.id} className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {el.label || el.typeId}
              </span>
            ))}
            {panel.elements.filter(el => el.label.toLowerCase().includes(searchQuery!.toLowerCase()) || el.typeId.toLowerCase().includes(searchQuery!.toLowerCase())).length > 4 && (
              <span className="text-[10px] text-zinc-400">+{panel.elements.filter(el => el.label.toLowerCase().includes(searchQuery!.toLowerCase()) || el.typeId.toLowerCase().includes(searchQuery!.toLowerCase())).length - 4} more</span>
            )}
          </div>
        )}
      </Link>
      <div className="flex items-center gap-1 border-t border-zinc-100 px-5 py-2.5 dark:border-zinc-700">
        <Button size="sm" variant="ghost" onClick={handleDuplicate} className="text-xs">
          {t('panels.card.duplicate')}
        </Button>
        <Button size="sm" variant="ghost" onClick={handleDelete} className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto">
          {t('panels.card.delete')}
        </Button>
      </div>
    </div>
  )
}

function NewPanelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [name, setName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const { settings } = usePanelStore()
  const { t } = useTranslation()
  const router = useRouter()

  function handleCreate() {
    if (!name.trim()) return
    const template = PANEL_TEMPLATES.find((tp) => tp.id === selectedTemplate)
    let panel
    if (template) {
      const base = createPanelFromTemplate(template, name.trim(), settings.defaultVoltage, settings.defaultFrequency)
      const now = new Date().toISOString()
      panel = panelStore.importPanel({ ...base, createdAt: now, updatedAt: now })
    } else {
      panel = panelStore.createPanel(name.trim())
    }
    panelStore.setActivePanel(panel.id)
    onClose()
    setName('')
    setSelectedTemplate(null)
    router.push(`/panels/edit?id=${panel.id}`)
  }

  function handleClose() {
    onClose()
    setName('')
    setSelectedTemplate(null)
    setShowTemplates(false)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('panels.modal.title')}
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>{t('panels.modal.cancel')}</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>
            {t('panels.modal.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="new-panel-name" required>{t('panels.modal.nameLabel')}</Label>
          <Input
            id="new-panel-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('panels.modal.namePlaceholder')}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>

        {/* Template selector */}
        <div>
          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <svg className={`h-3.5 w-3.5 transition-transform ${showTemplates ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Start from a template
          </button>

          {showTemplates && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTemplate(null)}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  selectedTemplate === null
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                }`}
              >
                <div className="font-medium">Blank</div>
                <div className="mt-0.5 text-zinc-400">Empty panel</div>
              </button>
              {PANEL_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                    selectedTemplate === tpl.id
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                  }`}
                >
                  <div className="font-medium">{tpl.icon} {tpl.name}</div>
                  <div className="mt-0.5 text-zinc-400 line-clamp-2">{tpl.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {!showTemplates && (
          <p className="text-xs text-zinc-500">
            {t('panels.modal.defaultRailHint', { count: settings.defaultSlotCount })}
          </p>
        )}
      </div>
    </Modal>
  )
}

export default function PanelsPage() {
  const { panels } = usePanelStore()
  const { t } = useTranslation()
  const [newModalOpen, setNewModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Handle ?share= URL for panel importing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const shareData = params.get('share')
    if (!shareData) return
    try {
      const json = decodeURIComponent(atob(shareData))
      const panel = JSON.parse(json) as Panel
      if (!panel.id || !panel.name) throw new Error('Invalid')
      if (confirm(`Import shared panel "${panel.name}"?`)) {
        panelStore.importPanel(panel)
      }
    } catch {
      // silently ignore malformed share links
    }
    // Remove share param from URL without reload
    const url = new URL(window.location.href)
    url.searchParams.delete('share')
    window.history.replaceState({}, '', url.toString())
  }, [])

  const filtered = useMemo(() => {
    let result = [...panels]
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.notes?.toLowerCase().includes(q) ||
          p.elements.some(
            (el) => el.label.toLowerCase().includes(q) || el.typeId.toLowerCase().includes(q) || el.circuitTag?.toLowerCase().includes(q)
          )
      )
    }
    if (sortKey === 'updated') result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    else if (sortKey === 'name') result.sort((a, b) => a.name.localeCompare(b.name))
    else if (sortKey === 'devices') result.sort((a, b) => b.elements.length - a.elements.length)
    return result
  }, [panels, search, sortKey])

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const panel = await readJsonFile(file)
      panelStore.importPanel(panel)
    } catch (err) {
      alert(t('panels.importError', { error: err instanceof Error ? err.message : 'Unknown error' }))
    }
    e.target.value = ''
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('panels.title')}</h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('panels.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {t('panels.import')}
            </Button>
            <Button variant="primary" onClick={() => setNewModalOpen(true)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('panels.newPanel')}
            </Button>
          </div>
        </div>

        {/* Sample projects */}
        {panels.length === 0 && (
          <div className="mb-5 rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Sample Projects</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { file: 'defance-home-32.json', name: 'Defance-home-32', desc: '3 bed · 2 bath · 4 rails' },
                { file: 'defance-home-29.json', name: 'Defance-home-29', desc: '1 bed · 1 bath · 3 rails' },
                { file: 'defance-home-30.json', name: 'Defance-home-30', desc: '1 bed · 1 bath · 3 rails' },
              ].map(({ file, name, desc }) => (
                <button
                  key={file}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3 text-left hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  onClick={async () => {
                    try {
                      const res = await fetch(`/samples/${file}`)
                      const panel = await res.json() as Panel
                      const imported = panelStore.importPanel(panel)
                      router.push(`/panels/edit?id=${imported.id}`)
                    } catch {
                      alert('Failed to load sample.')
                    }
                  }}
                >
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{name}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">{desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {panels.length > 0 && (
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search panels…"
                className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-3 text-sm placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder-zinc-500"
              />
            </div>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-lg border border-zinc-300 bg-white py-2 px-3 text-sm text-zinc-700 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <option value="updated">Last modified</option>
              <option value="name">Name A–Z</option>
              <option value="devices">Most devices</option>
            </select>
            {search && (
              <span className="text-sm text-zinc-400">
                {filtered.length} of {panels.length}
              </span>
            )}
          </div>
        )}

        {panels.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-24 dark:border-zinc-700 dark:bg-zinc-900">
            <svg className="h-12 w-12 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
            <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">{t('panels.empty.title')}</p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{t('panels.empty.subtitle')}</p>
            <Button variant="primary" className="mt-6" onClick={() => setNewModalOpen(true)}>
              {t('panels.empty.cta')}
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-sm text-zinc-400">No panels match &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch('')} className="mt-2 text-xs text-blue-500 hover:underline">Clear search</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((panel) => (
              <PanelCard key={panel.id} panel={panel} searchQuery={search} />
            ))}
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
      <NewPanelModal open={newModalOpen} onClose={() => setNewModalOpen(false)} />
    </div>
  )
}
