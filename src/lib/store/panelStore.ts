import type { Panel, PanelElement, Rail, Connection, ElementProperties, Annotation } from '../types/panel'
import { deserializePanel, serializePanel } from '../utils/importExport'
import { removeConnectionsForElement, canConnect } from '../utils/connectionUtils'
import { hasSlotCollision } from '../utils/slotUtils'

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function now(): string {
  return new Date().toISOString()
}

export interface AppSettings {
  defaultVoltage: 230 | 400
  defaultFrequency: 50 | 60
  defaultSlotCount: number
  theme: 'light' | 'dark' | 'system'
}

export interface PanelStoreState {
  panels: Panel[]
  activePanelId: string | null
  selectedElementId: string | null
  selectedConnectionId: string | null
  selectedAnnotationId: string | null
  connectingFrom: string | null
  zoom: number
  pan: { x: number; y: number }
  settings: AppSettings
}

type Listener = () => void

export const DEFAULT_SETTINGS: AppSettings = {
  defaultVoltage: 230,
  defaultFrequency: 50,
  defaultSlotCount: 24,
  theme: 'system',
}

const STORAGE_KEY = 'electrical-system-v1'

function migrateElementKind(typeId: string, props: Record<string, unknown>): ElementProperties {
  if ('kind' in props) return props as ElementProperties
  if (typeId.startsWith('rcbo_')) return { kind: 'rcbo', ...props } as ElementProperties
  if (typeId.startsWith('rcd_')) return { kind: 'rcd', ...props } as ElementProperties
  if (typeId.startsWith('mcb_')) return { kind: 'mcb', ...props } as ElementProperties
  if (typeId.startsWith('isolator_')) return { kind: 'isolator', ...props } as ElementProperties
  if (typeId.startsWith('main_switch_')) return { kind: 'isolator', ...props } as ElementProperties
  if (typeId === 'voltage_relay') return { kind: 'voltage_relay', ...props } as ElementProperties
  return { kind: 'generic', ...props } as ElementProperties
}

function migrateState(s: PanelStoreState): PanelStoreState {
  return {
    ...s,
    selectedAnnotationId: s.selectedAnnotationId ?? null,
    panels: s.panels.map((p) => ({
      ...p,
      annotations: p.annotations ?? [],
      elements: p.elements.map((e) => ({
        ...e,
        properties: migrateElementKind(e.typeId, e.properties as Record<string, unknown>),
      })),
    })),
  }
}

function loadFromStorage(): PanelStoreState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return migrateState(JSON.parse(raw) as PanelStoreState)
  } catch {
    return null
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null

// ─── Save-status (separate from main state so saving doesn't trigger re-save) ─
type SaveStatus = 'saved' | 'saving'
let _saveStatus: SaveStatus = 'saved'
const _statusListeners = new Set<() => void>()

function notifySaveStatus() {
  _statusListeners.forEach((l) => l())
}

function saveToStorage(s: PanelStoreState): void {
  if (typeof window === 'undefined') return
  _saveStatus = 'saving'
  notifySaveStatus()
  if (saveTimer !== null) clearTimeout(saveTimer)
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

const initialState: PanelStoreState = {
  ...(loadFromStorage() ?? {
    panels: [],
    activePanelId: null,
    selectedElementId: null,
    selectedConnectionId: null,
    selectedAnnotationId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    settings: DEFAULT_SETTINGS,
  }),
  connectingFrom: null,
  selectedAnnotationId: null,
}

let state = { ...initialState }
const listeners = new Set<Listener>()

// ─── Undo / Redo ─────────────────────────────────────────────────────────────
type DataSnapshot = { panels: Panel[]; settings: AppSettings }

let undoStack: DataSnapshot[] = []
let redoStack: DataSnapshot[] = []

function snapData(): DataSnapshot {
  return {
    panels: JSON.parse(JSON.stringify(state.panels)) as Panel[],
    settings: { ...state.settings },
  }
}

function pushUndo(): void {
  undoStack.push(snapData())
  if (undoStack.length > 50) undoStack.shift()
  redoStack = []
}

// ─── Clipboard ───────────────────────────────────────────────────────────────
let clipboard: PanelElement | null = null

// ─── Internal helpers ────────────────────────────────────────────────────────
function notify() {
  saveToStorage(state)
  listeners.forEach((l) => l())
}

function setState(updater: (s: PanelStoreState) => PanelStoreState) {
  state = updater(state)
  notify()
}

function getActivePanel(): Panel | null {
  return state.panels.find((p) => p.id === state.activePanelId) ?? null
}

function updateActivePanel(updater: (p: Panel) => Panel) {
  setState((s) => ({
    ...s,
    panels: s.panels.map((p) =>
      p.id === s.activePanelId ? { ...updater(p), updatedAt: now() } : p
    ),
  }))
}

// ─── Public API ──────────────────────────────────────────────────────────────
export const panelStore = {
  getState: () => state,

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // ── Undo / Redo ──
  canUndo(): boolean { return undoStack.length > 0 },
  canRedo(): boolean { return redoStack.length > 0 },

  undo() {
    if (undoStack.length === 0) return
    redoStack.push(snapData())
    const prev = undoStack.pop()!
    state = { ...state, panels: prev.panels, settings: prev.settings }
    notify()
  },

  redo() {
    if (redoStack.length === 0) return
    undoStack.push(snapData())
    const next = redoStack.pop()!
    state = { ...state, panels: next.panels, settings: next.settings }
    notify()
  },

  // ── Clipboard ──
  hasClipboard(): boolean { return clipboard !== null },

  copyElement(elementId: string) {
    const panel = getActivePanel()
    const el = panel?.elements.find((e) => e.id === elementId)
    if (el) clipboard = JSON.parse(JSON.stringify(el)) as PanelElement
  },

  pasteElement(): PanelElement | null {
    if (!clipboard) return null
    const panel = getActivePanel()
    if (!panel) return null

    for (const rail of panel.rails) {
      for (let slot = 0; slot <= rail.slotCount - clipboard.slotWidth; slot++) {
        if (!hasSlotCollision(panel.elements, rail.id, slot, clipboard.slotWidth)) {
          const newEl: PanelElement = {
            ...JSON.parse(JSON.stringify(clipboard)) as PanelElement,
            id: uid(),
            railId: rail.id,
            slotStart: slot,
            label: clipboard.label ? `${clipboard.label} (copy)` : '',
          }
          pushUndo()
          updateActivePanel((p) => ({ ...p, elements: [...p.elements, newEl] }))
          return newEl
        }
      }
    }
    return null
  },

  // ── Save status ──
  getSaveStatus(): SaveStatus { return _saveStatus },
  subscribeSaveStatus(listener: () => void): () => void {
    _statusListeners.add(listener)
    return () => _statusListeners.delete(listener)
  },

  // ── Settings ──
  updateSettings(updates: Partial<AppSettings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...updates } }))
  },

  // ── Panel CRUD ──
  createPanel(name: string): Panel {
    const id = uid()
    const defaultRailId = uid()
    const panel: Panel = {
      id,
      name,
      description: '',
      location: '',
      voltage: state.settings.defaultVoltage,
      frequency: state.settings.defaultFrequency,
      rails: [{ id: defaultRailId, label: 'Rail 1', slotCount: state.settings.defaultSlotCount }],
      elements: [],
      connections: [],
      annotations: [],
      createdAt: now(),
      updatedAt: now(),
    }
    pushUndo()
    setState((s) => ({ ...s, panels: [...s.panels, panel], activePanelId: id }))
    return panel
  },

  importPanel(panel: Panel): Panel {
    const id = uid()
    const imported: Panel = { ...panel, id, createdAt: now(), updatedAt: now() }
    pushUndo()
    setState((s) => ({ ...s, panels: [...s.panels, imported], activePanelId: id }))
    return imported
  },

  duplicatePanel(panelId: string): Panel | null {
    const original = state.panels.find((p) => p.id === panelId)
    if (!original) return null
    const json = serializePanel(original)
    const copy = deserializePanel(json)
    const newId = uid()
    const newPanel: Panel = { ...copy, id: newId, name: `${original.name} (copy)`, createdAt: now(), updatedAt: now() }
    pushUndo()
    setState((s) => ({ ...s, panels: [...s.panels, newPanel] }))
    return newPanel
  },

  updatePanel(panelId: string, updates: Partial<Pick<Panel, 'name' | 'description' | 'location' | 'voltage' | 'frequency'>>) {
    pushUndo()
    setState((s) => ({
      ...s,
      panels: s.panels.map((p) => (p.id === panelId ? { ...p, ...updates, updatedAt: now() } : p)),
    }))
  },

  deletePanel(panelId: string) {
    pushUndo()
    setState((s) => ({
      ...s,
      panels: s.panels.filter((p) => p.id !== panelId),
      activePanelId: s.activePanelId === panelId ? (s.panels.find((p) => p.id !== panelId)?.id ?? null) : s.activePanelId,
    }))
  },

  setActivePanel(panelId: string | null) {
    setState((s) => ({ ...s, activePanelId: panelId, selectedElementId: null, selectedConnectionId: null, selectedAnnotationId: null, connectingFrom: null }))
  },

  getActivePanel,

  // ── Rail CRUD ──
  addRail(rail: Omit<Rail, 'id'>): Rail {
    const newRail: Rail = { ...rail, id: uid() }
    pushUndo()
    updateActivePanel((p) => ({ ...p, rails: [...p.rails, newRail] }))
    return newRail
  },

  updateRail(railId: string, updates: Partial<Omit<Rail, 'id'>>) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      rails: p.rails.map((r) => (r.id === railId ? { ...r, ...updates } : r)),
    }))
  },

  deleteRail(railId: string) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      rails: p.rails.filter((r) => r.id !== railId),
      elements: p.elements.filter((e) => e.railId !== railId),
    }))
    setState((s) => ({ ...s, selectedElementId: null }))
  },

  reorderRails(orderedIds: string[]) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      rails: orderedIds.flatMap((id) => {
        const r = p.rails.find((r) => r.id === id)
        return r ? [r] : []
      }),
    }))
  },

  // ── Element CRUD ──
  addElement(element: Omit<PanelElement, 'id'>): PanelElement {
    const newElement: PanelElement = { ...element, id: uid() }
    pushUndo()
    updateActivePanel((p) => ({ ...p, elements: [...p.elements, newElement] }))
    return newElement
  },

  updateElement(elementId: string, updates: Partial<Omit<PanelElement, 'id'>>) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      elements: p.elements.map((e) => (e.id === elementId ? { ...e, ...updates } : e)),
    }))
  },

  deleteElement(elementId: string) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      elements: p.elements.filter((e) => e.id !== elementId),
      connections: removeConnectionsForElement(p.connections, elementId),
    }))
    setState((s) => ({
      ...s,
      selectedElementId: s.selectedElementId === elementId ? null : s.selectedElementId,
    }))
  },

  moveElement(elementId: string, newRailId: string, newSlotStart: number) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      elements: p.elements.map((e) =>
        e.id === elementId ? { ...e, railId: newRailId, slotStart: newSlotStart } : e
      ),
    }))
  },

  // ── Connection CRUD ──
  addConnection(conn: Omit<Connection, 'id'>): Connection {
    const newConn: Connection = { ...conn, id: uid() }
    pushUndo()
    updateActivePanel((p) => ({ ...p, connections: [...p.connections, newConn] }))
    return newConn
  },

  updateConnection(connectionId: string, updates: Partial<Pick<Connection, 'label'>>) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      connections: p.connections.map((c) => (c.id === connectionId ? { ...c, ...updates } : c)),
    }))
  },

  deleteConnection(connectionId: string) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      connections: p.connections.filter((c) => c.id !== connectionId),
    }))
    setState((s) => ({
      ...s,
      selectedConnectionId: s.selectedConnectionId === connectionId ? null : s.selectedConnectionId,
    }))
  },

  // ── Connection mode ──
  handlePortClick(portId: string) {
    const panel = getActivePanel()
    if (!panel) return
    const { connectingFrom } = state
    if (connectingFrom === null) {
      setState((s) => ({ ...s, connectingFrom: portId, selectedElementId: null, selectedConnectionId: null }))
      return
    }
    if (connectingFrom === portId) {
      setState((s) => ({ ...s, connectingFrom: null }))
      return
    }
    if (canConnect(connectingFrom, portId, panel.connections)) {
      const newConn: Connection = {
        id: uid(),
        fromPortId: connectingFrom,
        toPortId: portId,
        label: '',
      }
      pushUndo()
      updateActivePanel((p) => ({ ...p, connections: [...p.connections, newConn] }))
    }
    setState((s) => ({ ...s, connectingFrom: null }))
  },

  cancelConnecting() {
    if (state.connectingFrom !== null) {
      setState((s) => ({ ...s, connectingFrom: null }))
    }
  },

  // ── UI State ──
  selectElement(id: string | null) {
    setState((s) => ({ ...s, selectedElementId: id, selectedConnectionId: null, selectedAnnotationId: null, connectingFrom: null }))
  },

  selectConnection(id: string | null) {
    setState((s) => ({ ...s, selectedConnectionId: id, selectedElementId: null, selectedAnnotationId: null, connectingFrom: null }))
  },

  selectAnnotation(id: string | null) {
    setState((s) => ({ ...s, selectedAnnotationId: id, selectedElementId: null, selectedConnectionId: null, connectingFrom: null }))
  },

  setZoom(zoom: number) {
    setState((s) => ({ ...s, zoom: Math.max(0.25, Math.min(4, zoom)) }))
  },

  setPan(pan: { x: number; y: number }) {
    setState((s) => ({ ...s, pan }))
  },

  resetView() {
    setState((s) => ({ ...s, zoom: 1, pan: { x: 0, y: 0 } }))
  },

  packAllRails(): void {
    const panel = getActivePanel()
    if (!panel) return
    pushUndo()
    updateActivePanel((p) => {
      const elements = p.elements.map((e) => ({ ...e }))
      for (const rail of p.rails) {
        const onRail = elements
          .filter((e) => e.railId === rail.id)
          .sort((a, b) => a.slotStart - b.slotStart)
        let cursor = 0
        for (const el of onRail) {
          const target = elements.find((e) => e.id === el.id)!
          target.slotStart = cursor
          cursor += el.slotWidth
        }
      }
      return { ...p, elements }
    })
  },

  autoNumberLabels(prefix: string = 'C'): void {
    const panel = getActivePanel()
    if (!panel) return
    pushUndo()
    updateActivePanel((p) => {
      const sorted = [...p.elements].sort((a, b) => {
        const ri = p.rails.findIndex((r) => r.id === a.railId) - p.rails.findIndex((r) => r.id === b.railId)
        if (ri !== 0) return ri
        return a.slotStart - b.slotStart
      })
      let counter = 1
      const labelMap = new Map<string, string>()
      for (const el of sorted) {
        labelMap.set(el.id, `${prefix}${counter}`)
        counter++
      }
      return {
        ...p,
        elements: p.elements.map((e) => ({ ...e, label: labelMap.get(e.id) ?? e.label })),
      }
    })
  },

  // ── Annotation CRUD ──
  addAnnotation(x: number, y: number, text: string): Annotation {
    const annotation: Annotation = { id: uid(), x, y, text }
    pushUndo()
    updateActivePanel((p) => ({ ...p, annotations: [...p.annotations, annotation] }))
    setState((s) => ({ ...s, selectedAnnotationId: annotation.id }))
    return annotation
  },

  updateAnnotation(id: string, updates: Partial<Omit<Annotation, 'id'>>) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      annotations: p.annotations.map((a) => (a.id === id ? { ...a, ...updates } : a)),
    }))
  },

  deleteAnnotation(id: string) {
    pushUndo()
    updateActivePanel((p) => ({
      ...p,
      annotations: p.annotations.filter((a) => a.id !== id),
    }))
    setState((s) => ({
      ...s,
      selectedAnnotationId: s.selectedAnnotationId === id ? null : s.selectedAnnotationId,
    }))
  },

  restoreSnapshot(snapshot: Panel): void {
    pushUndo()
    const panel = state.panels.find((p) => p.id === state.activePanelId)
    if (!panel) return
    const idx = state.panels.indexOf(panel)
    state.panels[idx] = {
      ...snapshot,
      id: panel.id,
      name: panel.name,
      createdAt: panel.createdAt,
      updatedAt: new Date().toISOString(),
    }
    notify()
  },
}
