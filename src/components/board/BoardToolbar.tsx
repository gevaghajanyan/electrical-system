'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Panel } from '@/lib/types/panel'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { exportToPdf, exportFullReport, exportToImage } from '@/lib/utils/pdfExport'
import { downloadJson } from '@/lib/utils/importExport'
import { validatePanel } from '@/lib/utils/validation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RailConfigurator } from './RailConfigurator'
import { BomModal } from './BomModal'
import { SnapshotModal } from './SnapshotModal'

function computeLoadSummary(panel: Panel): { totalA: number; railLoads: { label: string; totalA: number }[] } {
  const railLoads = panel.rails.map((rail) => {
    const elements = panel.elements.filter((e) => e.railId === rail.id)
    let totalA = 0
    for (const el of elements) {
      const p = el.properties
      if (p.kind === 'mcb' || p.kind === 'rcbo' || p.kind === 'rcd' || p.kind === 'isolator') {
        totalA += p.rating
      }
    }
    return { label: rail.label, totalA }
  })
  const totalA = railLoads.reduce((s, r) => s + r.totalA, 0)
  return { totalA, railLoads }
}

function computePhaseBalance(panel: Panel): { l1: number; l2: number; l3: number } | null {
  if (panel.voltage < 380) return null
  const sorted = [...panel.elements].sort((a, b) => {
    const ri = panel.rails.findIndex((r) => r.id === a.railId) - panel.rails.findIndex((r) => r.id === b.railId)
    if (ri !== 0) return ri
    return a.slotStart - b.slotStart
  })
  let l1 = 0, l2 = 0, l3 = 0
  sorted.forEach((el, i) => {
    const p = el.properties
    const rating = (p.kind === 'mcb' || p.kind === 'rcbo' || p.kind === 'rcd' || p.kind === 'isolator') ? p.rating : 0
    if (i % 3 === 0) l1 += rating
    else if (i % 3 === 1) l2 += rating
    else l3 += rating
  })
  return { l1, l2, l3 }
}

interface BoardToolbarProps {
  panel: Panel
  onImport: () => void
}

export function BoardToolbar({ panel, onImport }: BoardToolbarProps) {
  const { zoom } = usePanelStore()
  const { t } = useTranslation()
  const [railConfigOpen, setRailConfigOpen] = useState(false)
  const [bomOpen, setBomOpen] = useState(false)
  const [snapshotOpen, setSnapshotOpen] = useState(false)

  const errors = useMemo(() => validatePanel(panel), [panel])
  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warnCount = errors.filter((e) => e.severity === 'warning').length

  const { totalA } = useMemo(() => computeLoadSummary(panel), [panel])
  const phaseBalance = useMemo(() => computePhaseBalance(panel), [panel])

  return (
    <>
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-900">
        {/* Left: rail & view controls */}
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={() => setRailConfigOpen(true)}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            {t('toolbar.rails')}
          </Button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

          <Button size="icon" variant="ghost" onClick={() => panelStore.setZoom(zoom - 0.1)} title="Zoom out">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </Button>
          <span className="w-12 text-center text-xs text-zinc-600 dark:text-zinc-400 tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <Button size="icon" variant="ghost" onClick={() => panelStore.setZoom(zoom + 0.1)} title="Zoom in">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => panelStore.resetView()}>
            {t('toolbar.fit')}
          </Button>

          {panel.elements.length > 0 && (
            <>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => panelStore.packAllRails()}
                title="Pack: remove gaps between elements on each rail"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m-12 4h12m-8 4h8M4 7l-2 2 2 2M4 15l-2 2 2 2" />
                </svg>
                Pack
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const prefix = window.prompt('Label prefix (e.g. C, F, L):', 'C')
                  if (prefix !== null) panelStore.autoNumberLabels(prefix.trim() || 'C')
                }}
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                # Label
              </Button>
            </>
          )}
        </div>

        {/* Center: panel name + load + validation */}
        <div className="flex flex-1 items-center justify-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
            {panel.name}
          </span>
          {totalA > 0 && (
            <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              {totalA}A total
            </span>
          )}
          {phaseBalance !== null && (
            <span className="hidden lg:flex items-center gap-1.5 text-xs rounded-md bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
              {(() => {
                const vals = [phaseBalance.l1, phaseBalance.l2, phaseBalance.l3]
                const avg = (phaseBalance.l1 + phaseBalance.l2 + phaseBalance.l3) / 3
                const max = Math.max(...vals)
                const min = Math.min(...vals)
                const imbalanced = avg > 0 && (max - min) > 0.15 * avg
                return (
                  <>
                    {imbalanced && (
                      <svg className="h-3 w-3 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-red-600 dark:text-red-400">L1: {phaseBalance.l1}A</span>
                    <span className="text-zinc-400"> · </span>
                    <span className="text-amber-600 dark:text-amber-400">L2: {phaseBalance.l2}A</span>
                    <span className="text-zinc-400"> · </span>
                    <span className="text-blue-600 dark:text-blue-400">L3: {phaseBalance.l3}A</span>
                  </>
                )
              })()}
            </span>
          )}
          {errorCount > 0 && (
            <Badge variant="error">{t('toolbar.errors', { count: errorCount })}</Badge>
          )}
          {warnCount > 0 && errorCount === 0 && (
            <Badge variant="warning">{t('toolbar.warnings', { count: warnCount })}</Badge>
          )}
          {errorCount === 0 && warnCount === 0 && (
            <Badge variant="success">{t('toolbar.valid')}</Badge>
          )}
        </div>

        {/* Right: BOM + export / import */}
        <div className="flex items-center gap-1">
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />
          <Button size="sm" variant="ghost" onClick={() => setSnapshotOpen(true)} title="Snapshots">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Snapshots
          </Button>

          <Button size="sm" variant="ghost" onClick={() => setBomOpen(true)} title="Bill of Materials">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            BOM
          </Button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

          <Button size="sm" variant="ghost" onClick={onImport} title="Import panel JSON">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {t('toolbar.import')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => downloadJson(panel)} title="Export as JSON">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('toolbar.json')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportToPdf(panel)} title="Export layout to PDF">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {t('toolbar.pdf')}
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportToImage(panel, 'png')} title="Export layout as PNG image">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            PNG
          </Button>
          <Button size="sm" variant="primary" onClick={() => exportFullReport(panel)} title="Export full report with BOM">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Report
          </Button>
        </div>
      </header>

      <RailConfigurator open={railConfigOpen} onClose={() => setRailConfigOpen(false)} />
      <BomModal panel={panel} open={bomOpen} onClose={() => setBomOpen(false)} />
      <SnapshotModal open={snapshotOpen} onClose={() => setSnapshotOpen(false)} panel={panel} />
    </>
  )
}
