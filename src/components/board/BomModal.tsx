'use client'

import { useMemo } from 'react'
import type { Panel, PanelElement } from '@/lib/types/panel'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface BomRow {
  typeId: string
  typeLabel: string
  rating: string
  elements: PanelElement[]
}

function getRatingLabel(el: PanelElement): string {
  const p = el.properties
  if (p.kind === 'mcb') return `${p.curve}${p.rating}A / ${p.breakingCapacity}kA`
  if (p.kind === 'rcbo') return `${p.curve}${p.rating}A / ${p.sensitivity}mA`
  if (p.kind === 'rcd') return `${p.rating}A / ${p.sensitivity}mA`
  if (p.kind === 'isolator') return `${p.rating}A`
  if (p.kind === 'voltage_relay') return `${p.minVoltage}–${p.maxVoltage}V`
  return '—'
}

function buildBom(panel: Panel): BomRow[] {
  const groups = new Map<string, BomRow>()

  for (const el of panel.elements) {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    if (!def) continue
    const rating = getRatingLabel(el)
    const key = `${el.typeId}|${rating}`
    if (!groups.has(key)) {
      groups.set(key, { typeId: el.typeId, typeLabel: def.label, rating, elements: [] })
    }
    groups.get(key)!.elements.push(el)
  }

  return Array.from(groups.values()).sort((a, b) => a.typeLabel.localeCompare(b.typeLabel))
}

function exportCsv(panel: Panel, rows: BomRow[]) {
  const lines = [
    `"Panel","${panel.name.replace(/"/g, '""')}"`,
    `"Date","${new Date().toLocaleDateString()}"`,
    '',
    '"Device","Specification","Qty","Labels"',
    ...rows.map((r) => {
      const labels = r.elements.map((e) => e.label).filter(Boolean).join('; ')
      return `"${r.typeLabel}","${r.rating}","${r.elements.length}","${labels}"`
    }),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${panel.name.replace(/[^a-z0-9]/gi, '_')}_bom.csv`
  a.click()
  URL.revokeObjectURL(url)
}

interface BomModalProps {
  panel: Panel
  open: boolean
  onClose: () => void
}

export function BomModal({ panel, open, onClose }: BomModalProps) {
  const rows = useMemo(() => buildBom(panel), [panel])

  const totalElements = rows.reduce((s, r) => s + r.elements.length, 0)
  const totalSlots = panel.elements.reduce((s, e) => s + e.slotWidth, 0)

  return (
    <Modal open={open} onClose={onClose} title="Bill of Materials" maxWidth="lg">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>{panel.name}</span>
          <span>·</span>
          <span>{totalElements} devices</span>
          <span>·</span>
          <span>{totalSlots} DIN slots used</span>
        </div>

        {rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">No elements in this panel</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300">Device</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300">Specification</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-zinc-600 dark:text-zinc-300">Qty</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300">Labels</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {rows.map((row, i) => (
                  <tr key={i} className="bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-3 py-2 font-medium text-zinc-800 dark:text-zinc-200">{row.typeLabel}</td>
                    <td className="px-3 py-2 font-mono text-xs text-zinc-600 dark:text-zinc-400">{row.rating}</td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        {row.elements.length}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {row.elements.filter((e) => e.label).map((e) => e.label).join(', ') || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => exportCsv(panel, rows)}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}
