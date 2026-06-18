'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Panel } from '@/lib/types/panel'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { exportToPdf, exportFullReport } from '@/lib/utils/pdfExport'
import { downloadJson } from '@/lib/utils/importExport'
import { validatePanel } from '@/lib/utils/validation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { RailConfigurator } from './RailConfigurator'
import { BomModal } from './BomModal'

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

interface BoardToolbarProps {
  panel: Panel
  onImport: () => void
}

export function BoardToolbar({ panel, onImport }: BoardToolbarProps) {
  const { zoom } = usePanelStore()
  const { t } = useTranslation()
  const [railConfigOpen, setRailConfigOpen] = useState(false)
  const [bomOpen, setBomOpen] = useState(false)

  const errors = useMemo(() => validatePanel(panel), [panel])
  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warnCount = errors.filter((e) => e.severity === 'warning').length

  const { totalA } = useMemo(() => computeLoadSummary(panel), [panel])

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
    </>
  )
}
