'use client'

import { useState } from 'react'
import type { Panel, ConductorType, CableCrossSection } from '@/lib/types/panel'
import { panelStore } from '@/lib/store/panelStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const CONDUCTORS: ConductorType[] = ['L', 'L1', 'L2', 'L3', 'N', 'PE']
const SECTIONS: CableCrossSection[] = [1.5, 2.5, 4, 6, 10, 16]

const CONDUCTOR_COLOR: Record<ConductorType, string> = {
  L:  'bg-red-500',
  L1: 'bg-red-500',
  L2: 'bg-amber-400',
  L3: 'bg-blue-500',
  N:  'bg-sky-400',
  PE: 'bg-green-500',
}

interface Props {
  open: boolean
  onClose: () => void
  panel: Panel
}

export function InputCablesModal({ open, onClose, panel }: Props) {
  const [conductor, setConductor] = useState<ConductorType>('L')
  const [crossSection, setCrossSection] = useState<CableCrossSection>(2.5)
  const [description, setDescription] = useState('')

  function handleAdd() {
    panelStore.addCableInput(conductor, crossSection, description.trim())
    setDescription('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Input Cables" maxWidth="md">
      <div className="space-y-4">
        {/* Existing cables */}
        {panel.inputCables.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-500 py-2">
            No input cables defined yet.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {panel.inputCables.map((cable) => (
              <div key={cable.id} className="flex items-center gap-3 px-3 py-2">
                <span className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold text-white ${CONDUCTOR_COLOR[cable.conductor]}`}>
                  {cable.conductor}
                </span>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 w-14 shrink-0">
                  {cable.crossSection} mm²
                </span>
                <Input
                  value={cable.description}
                  onChange={(e) => panelStore.updateCableInput(cable.id, { description: e.target.value })}
                  placeholder="Description…"
                  className="flex-1 text-xs h-7 py-0"
                />
                <select
                  value={cable.conductor}
                  onChange={(e) => panelStore.updateCableInput(cable.id, { conductor: e.target.value as ConductorType })}
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-blue-400"
                >
                  {CONDUCTORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select
                  value={cable.crossSection}
                  onChange={(e) => panelStore.updateCableInput(cable.id, { crossSection: Number(e.target.value) as CableCrossSection })}
                  className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-blue-400"
                >
                  {SECTIONS.map((s) => <option key={s} value={s}>{s} mm²</option>)}
                </select>
                <button
                  onClick={() => panelStore.deleteCableInput(cable.id)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                  title="Remove"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new cable row */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Add cable</p>
          <div className="flex items-center gap-2">
            <select
              value={conductor}
              onChange={(e) => setConductor(e.target.value as ConductorType)}
              className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-blue-400"
            >
              {CONDUCTORS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={crossSection}
              onChange={(e) => setCrossSection(Number(e.target.value) as CableCrossSection)}
              className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1.5 text-xs text-zinc-700 dark:text-zinc-200 focus:outline-none focus:border-blue-400"
            >
              {SECTIONS.map((s) => <option key={s} value={s}>{s} mm²</option>)}
            </select>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
              placeholder="Description (e.g. From meter board)"
              className="flex-1 text-xs"
            />
            <Button size="sm" variant="outline" onClick={handleAdd}>Add</Button>
          </div>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          Input cables appear in PDF schedule and SVG exports.
        </p>
      </div>
    </Modal>
  )
}
