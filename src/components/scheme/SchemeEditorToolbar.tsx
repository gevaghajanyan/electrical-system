'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { schemeStore } from '@/lib/store/schemeStore'

type WireRouting = 'orthogonal' | 'straight'
type GridSize = 6 | 12 | 24 | 48
type SaveStatus = 'saved' | 'saving'

interface Props {
  schemeName: string
  onRename?: (name: string) => void
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onZoomFit?: () => void
  canUndo: boolean
  canRedo: boolean
  saveStatus: SaveStatus
  wireRouting: WireRouting
  onWireRoutingChange: (r: WireRouting) => void
  gridSize: GridSize
  onGridSizeChange: (g: GridSize) => void
  onExportJson: () => void
}

/**
 * IconBtn — the primitive used for every square icon control in the toolbar.
 * Ghost styling, active + disabled states, 32px hit target (bumped to 40 on
 * coarse pointers by globals.css).
 */
function IconBtn({
  onClick, title, disabled, active, ariaLabel, children,
}: {
  onClick?: () => void
  title: string
  disabled?: boolean
  active?: boolean
  ariaLabel?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors touch-manipulation ${
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : active
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
      }`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />
}

function SaveDot({ status }: { status: SaveStatus }) {
  const { t } = useTranslation()
  const saving = status === 'saving'
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
        saving
          ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
          : 'border-zinc-200 bg-zinc-50 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-400'
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          saving ? 'animate-pulse bg-blue-500' : 'bg-green-500'
        }`}
      />
      {saving ? t('schemes.editor.savingLabel') : t('schemes.editor.savedLabel')}
    </span>
  )
}

/**
 * Popover container that closes on outside-click and Escape. Kept local so we
 * don't add a portal dep — the anchor's `position: relative` handles absolute
 * positioning.
 */
function Overflow({
  open, onClose, children,
}: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      ref={ref}
      className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      {children}
    </div>
  )
}

function MenuItem({
  onClick, icon, label, active,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
        active
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
          : 'text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800'
      }`}
    >
      <span className="text-zinc-400 dark:text-zinc-500">{icon}</span>
      <span className="flex-1">{label}</span>
      {active && (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  )
}

export function SchemeEditorToolbar(props: Props) {
  const { t } = useTranslation()
  const {
    schemeName, onRename,
    zoom, onZoomIn, onZoomOut, onZoomReset, onZoomFit,
    canUndo, canRedo, saveStatus,
    wireRouting, onWireRoutingChange,
    gridSize, onGridSizeChange,
    onExportJson,
  } = props

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(schemeName)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setDraftName(schemeName), [schemeName])

  function commitName() {
    setEditing(false)
    const trimmed = draftName.trim()
    if (trimmed && trimmed !== schemeName) onRename?.(trimmed)
    else setDraftName(schemeName)
  }

  return (
    <div className="glass sticky top-0 z-20 flex items-center gap-1 rounded-none border-x-0 border-t-0 px-3 py-2">
      {/* Back */}
      <Link
        href="/schemes"
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        title={t('schemes.backTo')}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline">{t('schemes.title')}</span>
      </Link>

      <Divider />

      {/* Scheme name — inline editable on click */}
      {editing ? (
        <input
          type="text"
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onBlur={commitName}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitName()
            if (e.key === 'Escape') { setEditing(false); setDraftName(schemeName) }
          }}
          className="h-8 min-w-0 flex-1 max-w-xs rounded-md border border-blue-400 bg-white px-2 text-sm font-semibold text-zinc-900 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Click to rename"
          className="min-w-0 flex-1 truncate rounded-md px-2 py-1 text-left text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {schemeName}
        </button>
      )}

      <SaveDot status={saveStatus} />

      <div className="ml-auto flex items-center gap-1">
        {/* Zoom group */}
        <div className="hidden items-center rounded-lg border border-zinc-200 bg-white/70 p-0.5 dark:border-zinc-700 dark:bg-zinc-800/60 sm:inline-flex">
          <IconBtn onClick={onZoomOut} title={t('schemes.editor.zoomOut', { defaultValue: 'Zoom out' })}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </IconBtn>
          <button
            type="button"
            onClick={onZoomReset}
            className="min-w-[52px] rounded-md px-1.5 py-1 text-center text-xs font-medium tabular-nums text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconBtn onClick={onZoomIn} title={t('schemes.editor.zoomIn', { defaultValue: 'Zoom in' })}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </IconBtn>
          {onZoomFit && (
            <IconBtn onClick={onZoomFit} title={t('schemes.editor.fit', { defaultValue: 'Fit' })}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </IconBtn>
          )}
        </div>

        {/* Undo / Redo */}
        <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-white/70 p-0.5 dark:border-zinc-700 dark:bg-zinc-800/60">
          <IconBtn onClick={() => schemeStore.undo()} disabled={!canUndo} title="Undo (Ctrl+Z)">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 010 16H3m0-16l4-4m-4 4l4 4" />
            </svg>
          </IconBtn>
          <IconBtn onClick={() => schemeStore.redo()} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 000 16h10m0-16l-4-4m4 4l-4 4" />
            </svg>
          </IconBtn>
        </div>

        {/* Auto-layout — key action, always visible */}
        <IconBtn onClick={() => schemeStore.autoLayout()} title={t('schemes.editor.autoLayout')}>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h6v6H4zM14 6h6v6h-6zM4 16h16v4H4z" />
          </svg>
        </IconBtn>

        {/* Overflow menu — everything else lives here on all viewports */}
        <div className="relative">
          <IconBtn
            onClick={() => setMenuOpen((v) => !v)}
            title="More"
            active={menuOpen}
            ariaLabel="Toolbar menu"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </IconBtn>
          <Overflow open={menuOpen} onClose={() => setMenuOpen(false)}>
            <div className="border-b border-zinc-100 p-1 dark:border-zinc-800">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {t('schemes.editor.wireOrthogonal').split(' ')[0]}
              </p>
              <MenuItem
                active={wireRouting === 'orthogonal'}
                onClick={() => { onWireRoutingChange('orthogonal'); setMenuOpen(false) }}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20h6V12h10" />
                  </svg>
                }
                label={t('schemes.editor.wireOrthogonal')}
              />
              <MenuItem
                active={wireRouting === 'straight'}
                onClick={() => { onWireRoutingChange('straight'); setMenuOpen(false) }}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20L20 4" />
                  </svg>
                }
                label={t('schemes.editor.wireStraight')}
              />
            </div>
            <div className="border-b border-zinc-100 p-1 dark:border-zinc-800">
              <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                {t('schemes.editor.grid')}
              </p>
              <div className="flex items-center gap-0.5 px-1 py-1">
                {([6, 12, 24, 48] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { onGridSizeChange(g); setMenuOpen(false) }}
                    className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium tabular-nums transition-colors ${
                      gridSize === g
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}
                    title={`Snap to ${g}px grid`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-1">
              <MenuItem
                onClick={() => { schemeStore.autoLabelWires(); setMenuOpen(false) }}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.51 0 1.02.2 1.41.59l7 7a2 2 0 010 2.83l-7 7a2 2 0 01-2.83 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
                label={t('schemes.editor.autoLabels')}
              />
              <MenuItem
                onClick={() => { onExportJson(); setMenuOpen(false) }}
                icon={
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
                label={t('schemes.editor.exportJson')}
              />
            </div>
          </Overflow>
        </div>
      </div>
    </div>
  )
}
