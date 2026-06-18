'use client'

import { Modal } from './ui/Modal'

interface ShortcutModalProps {
  open: boolean
  onClose: () => void
}

interface ShortcutRow {
  label: string
  keys: string[]
}

interface ShortcutGroup {
  title: string
  shortcuts: ShortcutRow[]
}

const GROUPS: ShortcutGroup[] = [
  {
    title: 'Editing',
    shortcuts: [
      { label: 'Undo', keys: ['⌘', 'Z'] },
      { label: 'Redo', keys: ['⌘', '⇧', 'Z'] },
      { label: 'Copy element', keys: ['⌘', 'C'] },
      { label: 'Paste element', keys: ['⌘', 'V'] },
      { label: 'Duplicate element', keys: ['⌘', 'D'] },
    ],
  },
  {
    title: 'Selection',
    shortcuts: [
      { label: 'Select element', keys: ['Click'] },
      { label: 'Add to multi-select', keys: ['⇧', 'Click'] },
      { label: 'Rubber-band select', keys: ['Drag on canvas'] },
      { label: 'Delete selection', keys: ['Delete', '⌫'] },
      { label: 'Clear selection', keys: ['Esc'] },
    ],
  },
  {
    title: 'Canvas',
    shortcuts: [
      { label: 'Zoom in/out', keys: ['Ctrl', 'Scroll'] },
      { label: 'Pan', keys: ['Scroll', 'Middle-drag'] },
      { label: 'Show shortcuts', keys: ['?'] },
    ],
  },
]

const kbdClass =
  'inline-flex items-center rounded border border-zinc-300 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 ml-1'

export function ShortcutModal({ open, onClose }: ShortcutModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts" maxWidth="sm">
      <div>
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 mb-1 mt-3 first:mt-0">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.shortcuts.map((shortcut) => (
                <div
                  key={shortcut.label}
                  className="flex items-center justify-between text-xs text-zinc-700 dark:text-zinc-300"
                >
                  <span>{shortcut.label}</span>
                  <span className="flex items-center">
                    {shortcut.keys.map((key, i) => (
                      <span key={i}>
                        {i > 0 && shortcut.keys.length > 1 && (
                          <span className="mx-0.5 text-[10px] text-zinc-400">/</span>
                        )}
                        <kbd className={kbdClass}>{key}</kbd>
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
