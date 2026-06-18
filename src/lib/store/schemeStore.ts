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

  // ── Auto-layout ──
  autoLayout(): void {
    const sc = getActiveScheme()
    if (!sc || sc.nodes.length === 0) return
    pushUndo()

    const nodeIds = sc.nodes.map((n) => n.id)
    const outgoing = new Map<string, Set<string>>()
    const inDegree = new Map<string, number>()
    nodeIds.forEach((id) => { outgoing.set(id, new Set()); inDegree.set(id, 0) })
    sc.wires.forEach((w) => {
      outgoing.get(w.fromNodeId)?.add(w.toNodeId)
      inDegree.set(w.toNodeId, (inDegree.get(w.toNodeId) ?? 0) + 1)
    })

    // Kahn's topological sort → column levels
    const level = new Map<string, number>()
    const queue = nodeIds.filter((id) => (inDegree.get(id) ?? 0) === 0)
    queue.forEach((id) => level.set(id, 0))
    let frontier = [...queue]
    while (frontier.length > 0) {
      const next: string[] = []
      for (const id of frontier) {
        const lv = level.get(id) ?? 0
        outgoing.get(id)?.forEach((nid) => {
          const newLv = lv + 1
          if (!level.has(nid) || level.get(nid)! < newLv) level.set(nid, newLv)
          next.push(nid)
        })
      }
      frontier = next.filter((id, i, arr) => arr.indexOf(id) === i)
    }
    nodeIds.forEach((id) => { if (!level.has(id)) level.set(id, 0) })

    const byLevel = new Map<number, string[]>()
    level.forEach((lv, id) => {
      if (!byLevel.has(lv)) byLevel.set(lv, [])
      byLevel.get(lv)!.push(id)
    })

    const GRID = 24, COL_GAP = 220, ROW_GAP = 130, OX = 96, OY = 96

    updateActiveScheme((s) => ({
      ...s,
      nodes: s.nodes.map((node) => {
        const lv = level.get(node.id) ?? 0
        const col = byLevel.get(lv)!
        const row = col.indexOf(node.id)
        return {
          ...node,
          x: Math.round((OX + lv * COL_GAP) / GRID) * GRID,
          y: Math.round((OY + row * ROW_GAP) / GRID) * GRID,
        }
      }),
    }))
  },

  // ── Auto-label wires ──
  autoLabelWires(): void {
    pushUndo()
    updateActiveScheme((sc) => ({
      ...sc,
      wires: sc.wires.map((wire) => {
        const fromNode = sc.nodes.find((n) => n.id === wire.fromNodeId)
        const toNode = sc.nodes.find((n) => n.id === wire.toNodeId)
        if (!fromNode || !toNode) return wire
        const fromPort = SCHEME_DEFS[fromNode.type]?.ports[wire.fromPortIndex]
        const toPort = SCHEME_DEFS[toNode.type]?.ports[wire.toPortIndex]
        const label = fromPort?.label || toPort?.label || ''
        return label ? { ...wire, label } : wire
      }),
    }))
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
