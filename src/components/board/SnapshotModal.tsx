'use client'

import { useState, useSyncExternalStore } from 'react'
import type { Panel } from '@/lib/types/panel'
import { snapshotStore } from '@/lib/store/snapshotStore'
import { panelStore } from '@/lib/store/panelStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

interface SnapshotModalProps {
  open: boolean
  onClose: () => void
  panel: Panel
}

export function SnapshotModal({ open, onClose, panel }: SnapshotModalProps) {
  const snapshots = useSyncExternalStore(
    snapshotStore.subscribe,
    () => snapshotStore.getSnapshots(panel.id),
    () => []
  )
  const [name, setName] = useState('')

  return (
    <Modal open={open} onClose={onClose} title="Snapshots" maxWidth="md">
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">Save current state</p>
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Before major changes"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  snapshotStore.createSnapshot(panel, name)
                  setName('')
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                snapshotStore.createSnapshot(panel, name)
                setName('')
              }}
            >
              Save snapshot
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">{snapshots.length} / 10 saved</p>
        </div>

        <div className="border-t border-zinc-200 dark:border-zinc-700" />

        {snapshots.length === 0 ? (
          <div className="flex items-center justify-center py-6 text-sm text-zinc-400 dark:text-zinc-500">
            No snapshots yet
          </div>
        ) : (
          <div>
            {snapshots.map((snap) => (
              <div key={snap.id} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{snap.name}</p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">{formatDate(snap.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm(`Restore "${snap.name}"? Current state will be saved to undo history.`)) {
                        panelStore.restoreSnapshot(snap.data)
                        onClose()
                      }
                    }}
                  >
                    Restore
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => snapshotStore.deleteSnapshot(snap.id)}
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
