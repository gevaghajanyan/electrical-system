'use client'

import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Panel } from '@/lib/types/panel'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { exportToPdf, exportFullReport, exportToImage, exportToCsv } from '@/lib/utils/pdfExport'
import { downloadJson } from '@/lib/utils/importExport'
import { validatePanel } from '@/lib/utils/validation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)

  // Panel metadata editor form state
  const [metaName, setMetaName] = useState(panel.name)
  const [metaDescription, setMetaDescription] = useState(panel.description)
  const [metaLocation, setMetaLocation] = useState(panel.location)
  const [metaVoltage, setMetaVoltage] = useState<230 | 400>(panel.voltage)
  const [metaFrequency, setMetaFrequency] = useState<50 | 60>(panel.frequency)

  function openSettings() {
    setMetaName(panel.name)
    setMetaDescription(panel.description)
    setMetaLocation(panel.location)
    setMetaVoltage(panel.voltage)
    setMetaFrequency(panel.frequency)
    setSettingsOpen(true)
  }

  function saveSettings() {
    panelStore.updatePanel(panel.id, {
      name: metaName,
      description: metaDescription,
      location: metaLocation,
      voltage: metaVoltage,
      frequency: metaFrequency,
    })
    setSettingsOpen(false)
  }

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
          <button
            onClick={openSettings}
            title="Edit panel settings"
            className="shrink-0 rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
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
            <button onClick={() => setValidationOpen(true)} className="shrink-0">
              <Badge variant="error">{t('toolbar.errors', { count: errorCount })}</Badge>
            </button>
          )}
          {warnCount > 0 && errorCount === 0 && (
            <button onClick={() => setValidationOpen(true)} className="shrink-0">
              <Badge variant="warning">{t('toolbar.warnings', { count: warnCount })}</Badge>
            </button>
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

          <Button size="sm" variant="ghost" onClick={() => exportToCsv(panel)} title="Export cable schedule as CSV">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV
          </Button>
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

      {/* Panel Metadata Editor Modal */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Panel Settings"
        maxWidth="sm"
        footer={
          <>
            <Button size="sm" variant="outline" onClick={() => setSettingsOpen(false)}>Cancel</Button>
            <Button size="sm" variant="primary" onClick={saveSettings}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="meta-name" required>Name</Label>
            <Input
              id="meta-name"
              value={metaName}
              onChange={(e) => setMetaName(e.target.value)}
              placeholder="Panel name"
            />
          </div>
          <div>
            <Label htmlFor="meta-description">Description</Label>
            <Input
              id="meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <Label htmlFor="meta-location">Location</Label>
            <Input
              id="meta-location"
              value={metaLocation}
              onChange={(e) => setMetaLocation(e.target.value)}
              placeholder="e.g. Main Building, Floor 2"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="meta-voltage">Voltage</Label>
              <Select
                id="meta-voltage"
                value={String(metaVoltage)}
                onChange={(e) => setMetaVoltage(Number(e.target.value) as 230 | 400)}
              >
                <option value="230">230V</option>
                <option value="400">400V</option>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="meta-frequency">Frequency</Label>
              <Select
                id="meta-frequency"
                value={String(metaFrequency)}
                onChange={(e) => setMetaFrequency(Number(e.target.value) as 50 | 60)}
              >
                <option value="50">50Hz</option>
                <option value="60">60Hz</option>
              </Select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Validation Errors Modal */}
      <Modal
        open={validationOpen}
        onClose={() => setValidationOpen(false)}
        title="Validation Results"
        maxWidth="md"
      >
        {errors.length === 0 ? (
          <p className="text-sm text-zinc-500">No issues found.</p>
        ) : (
          <ul className="space-y-2">
            {[...errors]
              .sort((a, b) => {
                if (a.severity === b.severity) return 0
                return a.severity === 'error' ? -1 : 1
              })
              .map((err, i) => {
                let source = 'Panel'
                if (err.elementId) {
                  source = panel.elements.find((e) => e.id === err.elementId)?.label || err.elementId
                } else if (err.railId) {
                  source = panel.rails.find((r) => r.id === err.railId)?.label || err.railId
                }
                const isError = err.severity === 'error'
                return (
                  <li
                    key={i}
                    className={[
                      'flex items-start gap-2 rounded-md px-3 py-2 text-sm',
                      isError
                        ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                    ].join(' ')}
                  >
                    <span className="shrink-0 font-semibold">{source}:</span>
                    <span>{err.message}</span>
                  </li>
                )
              })}
          </ul>
        )}
      </Modal>
    </>
  )
}
