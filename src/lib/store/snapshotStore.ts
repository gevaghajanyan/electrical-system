import type { Panel } from '../types/panel'

interface Snapshot {
  id: string
  panelId: string
  name: string
  createdAt: string
  data: Panel
}

const STORAGE_KEY = 'electrical-snapshots-v1'
const MAX_PER_PANEL = 10

function loadFromStorage(): Snapshot[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function saveToStorage(snapshots: Snapshot[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
  } catch {}
}

let _snapshots: Snapshot[] = loadFromStorage()
const _listeners = new Set<() => void>()

function notify() {
  _listeners.forEach((l) => l())
}

export const snapshotStore = {
  getSnapshots(panelId: string): Snapshot[] {
    return _snapshots.filter((s) => s.panelId === panelId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  createSnapshot(panel: Panel, name: string): Snapshot {
    const snap: Snapshot = {
      id: crypto.randomUUID(),
      panelId: panel.id,
      name: name.trim() || `Snapshot ${new Date().toLocaleTimeString()}`,
      createdAt: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(panel)),
    }
    const existing = _snapshots.filter((s) => s.panelId === panel.id)
    if (existing.length >= MAX_PER_PANEL) {
      const oldest = [...existing].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
      _snapshots = _snapshots.filter((s) => s.id !== oldest.id)
    }
    _snapshots = [..._snapshots, snap]
    saveToStorage(_snapshots)
    notify()
    return snap
  },

  deleteSnapshot(id: string): void {
    _snapshots = _snapshots.filter((s) => s.id !== id)
    saveToStorage(_snapshots)
    notify()
  },

  subscribe(listener: () => void): () => void {
    _listeners.add(listener)
    return () => _listeners.delete(listener)
  },

  getState() {
    return { snapshots: _snapshots }
  },
}
