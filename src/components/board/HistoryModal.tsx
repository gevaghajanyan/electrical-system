'use client'

import { useSyncExternalStore } from 'react'
import { panelStore } from '@/lib/store/panelStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

function formatAge(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

interface Props {
  open: boolean
  onClose: () => void
}

export function HistoryModal({ open, onClose }: Props) {
  const history = useSyncExternalStore(
    panelStore.subscribe,
    () => panelStore.getHistory(),
    () => [],
  )

  return (
    <Modal open={open} onClose={onClose} title="Change History" maxWidth="sm">
      {history.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-zinc-400 dark:text-zinc-500">
          No history yet — make some changes first.
        </div>
      ) : (
        <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
          {/* Current state (top) */}
          <div className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Current state</span>
            </div>
          </div>
          {/* History entries (newest first) */}
          {[...history].reverse().map((entry) => (
            <div
              key={entry.index}
              className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600 shrink-0" />
                <span className="text-xs text-zinc-700 dark:text-zinc-300 truncate">{entry.label}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{formatAge(entry.ts)}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs h-6 px-2"
                  onClick={() => {
                    if (confirm(`Undo all changes back to "${entry.label}"?`)) {
                      panelStore.undoToIndex(entry.index)
                      onClose()
                    }
                  }}
                >
                  Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
        Up to 50 entries. Restoring will undo all subsequent changes.
      </p>
    </Modal>
  )
}
