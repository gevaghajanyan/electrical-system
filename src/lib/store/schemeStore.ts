import type { Scheme, SchemeNode, SchemeNodeType, SchemeWire } from '../types/scheme'
import { SCHEME_DEFS } from '../constants/schemeDefs'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function now(): string {
  return new Date().toISOString()
}

export interface SchemeStoreState {
  schemes: Scheme[]
  activeSchemeId: string | null
  selectedNodeId: string | null
  selectedWireId: string | null
  connectingFrom: { nodeId: string; portIndex: number } | null
}

type Listener = () => void

// ─── Undo / Redo ─────────────────────────────────────────────────────────────
type DataSnapshot = { schemes: Scheme[] }

const MAX_HISTORY = 50
const undoStack: DataSnapshot[] = []
const redoStack: DataSnapshot[] = []

function snapData(): DataSnapshot {
  return { schemes: JSON.parse(JSON.stringify(state.schemes)) as Scheme[] }
}

function pushUndo(): void {
  undoStack.push(snapData())
  if (undoStack.length > MAX_HISTORY) undoStack.shift()
  redoStack.length = 0
}

// ─── Save status ──────────────────────────────────────────────────────────────
export type SaveStatus = 'saved' | 'saving'

let _saveStatus: SaveStatus = 'saved'
const _statusListeners = new Set<() => void>()

function notifySaveStatus(): void {
  _statusListeners.forEach((l) => l())
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'electrical-schemes-v1'

function loadFromStorage(): SchemeStoreState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SchemeStoreState
  } catch {
    return null
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

function saveToStorage(s: SchemeStoreState): void {
  if (typeof window === 'undefined') return
  if (saveTimer !== null) clearTimeout(saveTimer)
  _saveStatus = 'saving'
  notifySaveStatus()
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      // quota exceeded – ignore
    }
    _saveStatus = 'saved'
    notifySaveStatus()
  }, 400)
}

const initialState: SchemeStoreState = loadFromStorage() ?? {
  schemes: [],
  activeSchemeId: null,
  selectedNodeId: null,
  selectedWireId: null,
  connectingFrom: null,
}

let state = { ...initialState }
const listeners = new Set<Listener>()

function notify() {
  saveToStorage(state)
  listeners.forEach((l) => l())
}

function setState(updater: (s: SchemeStoreState) => SchemeStoreState) {
  state = updater(state)
  notify()
}

function getActiveScheme(): Scheme | null {
  return state.schemes.find((s) => s.id === state.activeSchemeId) ?? null
}

function updateActiveScheme(updater: (s: Scheme) => Scheme) {
  setState((st) => ({
    ...st,
    schemes: st.schemes.map((s) =>
      s.id === st.activeSchemeId ? { ...updater(s), updatedAt: now() } : s
    ),
  }))
}

// ─── Public API ──────────────────────────────────────────────────────────────
export const schemeStore = {
  getState: (): SchemeStoreState => state,

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // ── Scheme CRUD ──
  createScheme(name: string, description = ''): Scheme {
    const id = uid()
    const scheme: Scheme = {
      id,
      name,
      description,
      nodes: [],
      wires: [],
      createdAt: now(),
      updatedAt: now(),
    }
    setState((s) => ({ ...s, schemes: [...s.schemes, scheme], activeSchemeId: id }))
    return scheme
  },

  deleteScheme(id: string) {
    setState((s) => ({
      ...s,
      schemes: s.schemes.filter((sc) => sc.id !== id),
      activeSchemeId: s.activeSchemeId === id
        ? (s.schemes.find((sc) => sc.id !== id)?.id ?? null)
        : s.activeSchemeId,
    }))
  },

  updateScheme(id: string, updates: Partial<Pick<Scheme, 'name' | 'description'>>) {
    setState((s) => ({
      ...s,
      schemes: s.schemes.map((sc) =>
        sc.id === id ? { ...sc, ...updates, updatedAt: now() } : sc
      ),
    }))
  },

  duplicateScheme(id: string): Scheme | null {
    const original = state.schemes.find((sc) => sc.id === id)
    if (!original) return null
    const newId = uid()
    const copy: Scheme = {
      ...JSON.parse(JSON.stringify(original)) as Scheme,
      id: newId,
      name: `${original.name} (copy)`,
      createdAt: now(),
      updatedAt: now(),
    }
    setState((s) => ({ ...s, schemes: [...s.schemes, copy] }))
    return copy
  },

  setActiveScheme(id: string | null) {
    setState((s) => ({
      ...s,
      activeSchemeId: id,
      selectedNodeId: null,
      selectedWireId: null,
      connectingFrom: null,
    }))
  },

  getActiveScheme,

  // ── Node CRUD ──
  addNode(type: SchemeNodeType, x: number, y: number): SchemeNode {
    pushUndo()
    const node: SchemeNode = {
      id: uid(),
      type,
      x,
      y,
      label: SCHEME_DEFS[type].label,
      rotation: 0,
    }
    updateActiveScheme((sc) => ({ ...sc, nodes: [...sc.nodes, node] }))
    return node
  },

  linkNodeToPanel(nodeId: string, panelElementId: string | null): void {
    pushUndo()
    updateActiveScheme((sc) => ({
      ...sc,
      nodes: sc.nodes.map((n) =>
        n.id === nodeId
          ? { ...n, linkedPanelElementId: panelElementId ?? undefined }
          : n
      ),
    }))
  },

  updateNode(nodeId: string, updates: Partial<Pick<SchemeNode, 'x' | 'y' | 'label' | 'rotation'>>) {
    pushUndo()
    updateActiveScheme((sc) => ({
      ...sc,
      nodes: sc.nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n)),
    }))
  },

  deleteNode(nodeId: string) {
    pushUndo()
    updateActiveScheme((sc) => ({
      ...sc,
      nodes: sc.nodes.filter((n) => n.id !== nodeId),
      wires: sc.wires.filter(
        (w) => w.fromNodeId !== nodeId && w.toNodeId !== nodeId
      ),
    }))
    setState((s) => ({
      ...s,
      selectedNodeId: s.selectedNodeId === nodeId ? null : s.selectedNodeId,
      connectingFrom:
        s.connectingFrom?.nodeId === nodeId ? null : s.connectingFrom,
    }))
  },

  addWire(
    fromNodeId: string,
    fromPortIndex: number,
    toNodeId: string,
    toPortIndex: number
  ): SchemeWire | null {
    // No self-loops on same node+port
    if (fromNodeId === toNodeId && fromPortIndex === toPortIndex) return null

    // No duplicates
    const existing = state.schemes.find((sc) => sc.id === state.activeSchemeId)
    if (existing) {
      const dup = existing.wires.find(
        (w) =>
          (w.fromNodeId === fromNodeId &&
            w.fromPortIndex === fromPortIndex &&
            w.toNodeId === toNodeId &&
            w.toPortIndex === toPortIndex) ||
          (w.fromNodeId === toNodeId &&
            w.fromPortIndex === toPortIndex &&
            w.toNodeId === fromNodeId &&
            w.toPortIndex === fromPortIndex)
      )
      if (dup) return null
    }

    pushUndo()
    const wire: SchemeWire = {
      id: uid(),
      fromNodeId,
      fromPortIndex,
      toNodeId,
      toPortIndex,
      label: '',
    }
    updateActiveScheme((sc) => ({ ...sc, wires: [...sc.wires, wire] }))
    return wire
  },

  updateWire(wireId: string, updates: { label: string }) {
    pushUndo()
    updateActiveScheme((sc) => ({
      ...sc,
      wires: sc.wires.map((w) => (w.id === wireId ? { ...w, ...updates } : w)),
    }))
  },

  deleteWire(wireId: string) {
    pushUndo()
    updateActiveScheme((sc) => ({
      ...sc,
      wires: sc.wires.filter((w) => w.id !== wireId),
    }))
    setState((s) => ({
      ...s,
      selectedWireId: s.selectedWireId === wireId ? null : s.selectedWireId,
    }))
  },

  // ── UI State ──
  selectNode(id: string | null) {
    setState((s) => ({
      ...s,
      selectedNodeId: id,
      selectedWireId: null,
      connectingFrom: null,
    }))
  },

  selectWire(id: string | null) {
    setState((s) => ({
      ...s,
      selectedWireId: id,
      selectedNodeId: null,
      connectingFrom: null,
    }))
  },

  handlePortClick(nodeId: string, portIndex: number) {
    const { connectingFrom } = state
    if (connectingFrom === null) {
      setState((s) => ({
        ...s,
        connectingFrom: { nodeId, portIndex },
        selectedNodeId: null,
        selectedWireId: null,
      }))
      return
    }
    // Clicking the same port cancels
    if (connectingFrom.nodeId === nodeId && connectingFrom.portIndex === portIndex) {
      setState((s) => ({ ...s, connectingFrom: null }))
      return
    }
    // Attempt to create the wire
    schemeStore.addWire(connectingFrom.nodeId, connectingFrom.portIndex, nodeId, portIndex)
    setState((s) => ({ ...s, connectingFrom: null }))
  },

  cancelConnecting() {
    if (state.connectingFrom !== null) {
      setState((s) => ({ ...s, connectingFrom: null }))
    }
  },

  // ── Export ──
  exportJson(id: string): string {
    const scheme = state.schemes.find((sc) => sc.id === id)
    if (!scheme) return '{}'
    return JSON.stringify(scheme, null, 2)
  },

  // ── Undo / Redo ──
  canUndo(): boolean {
    return undoStack.length > 0
  },

  canRedo(): boolean {
    return redoStack.length > 0
  },

  undo(): void {
    const snap = undoStack.pop()
    if (!snap) return
    redoStack.push(snapData())
    if (redoStack.length > MAX_HISTORY) redoStack.shift()
    setState((s) => ({ ...s, schemes: snap.schemes }))
  },

  redo(): void {
    const snap = redoStack.pop()
    if (!snap) return
    undoStack.push(snapData())
    if (undoStack.length > MAX_HISTORY) undoStack.shift()
    setState((s) => ({ ...s, schemes: snap.schemes }))
  },

  // ── Save status ──
  getSaveStatus(): SaveStatus {
    return _saveStatus
  },

  subscribeSaveStatus(listener: () => void): () => void {
    _statusListeners.add(listener)
    return () => _statusListeners.delete(listener)
  },
}
