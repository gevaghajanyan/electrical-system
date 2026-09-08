'use client'

import { useTranslation } from 'react-i18next'
import type { Scheme, SchemeNode, SchemeWire } from '@/lib/types/scheme'
import type { Panel } from '@/lib/types/panel'
import { schemeStore } from '@/lib/store/schemeStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  scheme: Scheme
  selectedNode: SchemeNode | null
  selectedWire: SchemeWire | null
  panels: Panel[]
}

/**
 * Right-hand-side scheme properties inspector — pure presentational component,
 * reused inside the desktop sidebar AND the mobile bottom-sheet.
 */
export function SchemeProperties({ scheme, selectedNode, selectedWire, panels }: Props) {
  const { t } = useTranslation()
  const tips = t('schemes.editor.tipsList', { returnObjects: true }) as string[]

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {t('schemes.editor.properties')}
        </p>
      </div>

      <div className="flex-1 p-4">
        {selectedNode ? (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('schemes.editor.componentType')}
              </p>
              <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{selectedNode.type}</p>
            </div>

            <div>
              <label htmlFor="node-label" className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('schemes.editor.label')}
              </label>
              <Input
                id="node-label"
                value={selectedNode.label}
                onChange={(e) => schemeStore.updateNode(selectedNode.id, { label: e.target.value })}
              />
            </div>

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
              <svg className="mr-1 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('schemes.editor.rotate')}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {t('schemes.editor.position')}
                </p>
                <p className="text-xs tabular-nums text-zinc-700 dark:text-zinc-200">
                  {selectedNode.x}, {selectedNode.y}
                </p>
              </div>
              <div>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {t('schemes.editor.rotation')}
                </p>
                <p className="text-xs tabular-nums text-zinc-700 dark:text-zinc-200">
                  {selectedNode.rotation ?? 0}°
                </p>
              </div>
            </div>

            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('schemes.editor.linkedElement')}
              </p>
              <select
                value={selectedNode.linkedPanelElementId ?? ''}
                onChange={(e) => schemeStore.linkNodeToPanel(selectedNode.id, e.target.value || null)}
                className="h-10 w-full rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-700 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <option value="">{t('schemes.editor.notLinked')}</option>
                {panels.flatMap((panel) =>
                  panel.elements.map((el) => (
                    <option key={el.id} value={el.id}>
                      {panel.name} / {el.label || el.typeId}
                    </option>
                  )),
                )}
              </select>
              {selectedNode.linkedPanelElementId && (
                <p className="mt-1 text-[10px] text-blue-500">{t('schemes.editor.linkedNote')}</p>
              )}
            </div>

            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => schemeStore.deleteNode(selectedNode.id)}
            >
              {t('schemes.editor.deleteComponent')}
            </Button>
          </div>
        ) : selectedWire ? (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('schemes.editor.wireHeader')}
              </p>
              <p className="break-all text-xs text-zinc-600 dark:text-zinc-300">
                {selectedWire.fromNodeId.slice(0, 8)}…:{selectedWire.fromPortIndex}
                {' → '}
                {selectedWire.toNodeId.slice(0, 8)}…:{selectedWire.toPortIndex}
              </p>
            </div>
            <div>
              <label htmlFor="wire-label" className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                {t('schemes.editor.label')}
              </label>
              <Input
                id="wire-label"
                value={selectedWire.label}
                onChange={(e) => schemeStore.updateWire(selectedWire.id, { label: e.target.value })}
              />
            </div>
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => schemeStore.deleteWire(selectedWire.id)}
            >
              {t('schemes.editor.deleteWire')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-center">
            <svg className="h-8 w-8 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{t('schemes.editor.propertiesEmpty')}</p>
          </div>
        )}
      </div>

      {/* Scheme stats */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {t('schemes.editor.info')}
        </p>
        <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex justify-between">
            <span>{t('schemes.editor.components')}</span>
            <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
              {scheme.nodes.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t('schemes.editor.wires')}</span>
            <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
              {scheme.wires.length}
            </span>
          </div>
        </div>
      </div>

      {/* Tips */}
      {tips && Array.isArray(tips) && tips.length > 0 && (
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            {t('schemes.editor.tips')}
          </p>
          <ul className="space-y-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="text-zinc-300 dark:text-zinc-600">·</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
