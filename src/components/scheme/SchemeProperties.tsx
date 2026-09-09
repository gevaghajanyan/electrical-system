'use client'

import { useTranslation } from 'react-i18next'
import type { Scheme, SchemeNode, SchemeWire } from '@/lib/types/scheme'
import type { Panel } from '@/lib/types/panel'
import { schemeStore } from '@/lib/store/schemeStore'
import { SCHEME_DEFS } from '@/lib/constants/schemeDefs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Props {
  scheme: Scheme
  selectedNode: SchemeNode | null
  selectedWire: SchemeWire | null
  panels: Panel[]
  connectingFrom?: { nodeId: string; portIndex: number } | null
}

function portTone(label: string): string {
  if (label === 'L' || label === 'L1' || label === 'L2' || label === 'L3' || label === '+') return 'bg-red-500'
  if (label === 'N' || label === 'N1' || label === 'N2' || label === '-') return 'bg-blue-500'
  if (label === 'PE') return 'bg-green-500'
  return 'bg-zinc-400'
}

/**
 * Right-hand-side scheme properties inspector — pure presentational component,
 * reused inside the desktop sidebar AND the mobile bottom-sheet.
 */
export function SchemeProperties({ scheme, selectedNode, selectedWire, panels, connectingFrom }: Props) {
  const { t } = useTranslation()
  const tips = t('schemes.editor.tipsList', { returnObjects: true }) as string[]

  const nodeDef = selectedNode ? SCHEME_DEFS[selectedNode.type] : null
  const nodeWires = selectedNode
    ? scheme.wires.filter((w) => w.fromNodeId === selectedNode.id || w.toNodeId === selectedNode.id)
    : []
  const connectingFromThisNode = !!(connectingFrom && selectedNode && connectingFrom.nodeId === selectedNode.id)

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          {t('schemes.editor.properties')}
        </p>
      </div>

      {/* Global "connecting…" banner — visible whenever a source port is armed */}
      {connectingFrom && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-800/60 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
            </span>
            <p className="flex-1 text-[11px] font-medium text-amber-800 dark:text-amber-200">
              {t('schemes.editor.connectHint', { defaultValue: 'Tap another port to connect' })}
            </p>
            <button
              type="button"
              onClick={() => schemeStore.cancelConnecting()}
              className="rounded px-2 py-0.5 text-[11px] font-semibold text-amber-900 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/40"
            >
              {t('schemes.modal.cancel')}
            </button>
          </div>
        </div>
      )}

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

            {/* Ports — tap to start a connection from that port */}
            {nodeDef && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {t('schemes.editor.ports', { defaultValue: 'Ports' })}
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {nodeDef.ports.map((port) => {
                    const isArmed = connectingFromThisNode && connectingFrom?.portIndex === port.index
                    return (
                      <button
                        key={port.index}
                        type="button"
                        onClick={() => schemeStore.handlePortClick(selectedNode.id, port.index)}
                        className={`inline-flex min-h-[40px] items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-xs font-semibold transition-colors touch-manipulation ${
                          isArmed
                            ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-100'
                            : 'border-zinc-200 bg-white text-zinc-700 hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-blue-500 dark:hover:bg-blue-950/30'
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${portTone(port.label)}`} />
                        <span className="tabular-nums">{port.label || `#${port.index + 1}`}</span>
                        {isArmed && (
                          <span className="ml-auto text-[10px] font-normal text-amber-700 dark:text-amber-300">
                            ●
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500">
                  {t('schemes.editor.portHint', {
                    defaultValue: 'Tap a port here or on the canvas to start a wire.',
                  })}
                </p>
              </div>
            )}

            {/* Existing wires attached to this node */}
            {nodeWires.length > 0 && (
              <div>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {t('schemes.editor.wires')} · {nodeWires.length}
                </p>
                <ul className="space-y-1">
                  {nodeWires.map((wire) => {
                    const otherId = wire.fromNodeId === selectedNode.id ? wire.toNodeId : wire.fromNodeId
                    const otherNode = scheme.nodes.find((n) => n.id === otherId)
                    const otherDef = otherNode ? SCHEME_DEFS[otherNode.type] : null
                    const otherPortIdx = wire.fromNodeId === selectedNode.id ? wire.toPortIndex : wire.fromPortIndex
                    const otherPort = otherDef?.ports[otherPortIdx]
                    const thisPortIdx = wire.fromNodeId === selectedNode.id ? wire.fromPortIndex : wire.toPortIndex
                    const thisPort = nodeDef?.ports[thisPortIdx]
                    return (
                      <li key={wire.id} className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] dark:border-zinc-700 dark:bg-zinc-800">
                        <button
                          type="button"
                          onClick={() => schemeStore.selectWire(wire.id)}
                          className="flex min-w-0 flex-1 items-center gap-1.5 text-left text-zinc-700 hover:text-blue-600 dark:text-zinc-200 dark:hover:text-blue-400"
                        >
                          <span className={`h-2 w-2 shrink-0 rounded-full ${portTone(thisPort?.label ?? '')}`} />
                          <span className="tabular-nums">{thisPort?.label || `#${thisPortIdx + 1}`}</span>
                          <span className="text-zinc-400">→</span>
                          <span className="truncate">{otherNode?.label || '—'}</span>
                          <span className="tabular-nums text-zinc-400">:{otherPort?.label || otherPortIdx}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => schemeStore.deleteWire(wire.id)}
                          aria-label={t('schemes.editor.deleteWire')}
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/40"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

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
