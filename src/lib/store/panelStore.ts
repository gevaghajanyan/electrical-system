import type { Panel, PanelElement, Rail, Connection, ElementProperties } from '../types/panel'
import { deserializePanel, serializePanel } from '../utils/importExport'
import { removeConnectionsForElement, canConnect } from '../utils/connectionUtils'

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
  connectingFrom: string | null  // portId currently being connected from (transient UI state)
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
    panels: s.panels.map((p) => ({
      ...p,
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

function saveToStorage(s: PanelStoreState): void {
  if (typeof window === 'undefined') return
  if (saveTimer !== null) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    } catch {
      // quota exceeded – ignore
    }
  }, 400)
}

const initialState: PanelStoreState = {
  ...(loadFromStorage() ?? {
    panels: [],
    activePanelId: null,
    selectedElementId: null,
    selectedConnectionId: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    settings: DEFAULT_SETTINGS,
  }),
  connectingFrom: null,  // always reset on load — transient state
}

let state = { ...initialState }
const listeners = new Set<Listener>()

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
      createdAt: now(),
      updatedAt: now(),
    }
    setState((s) => ({ ...s, panels: [...s.panels, panel], activePanelId: id }))
    return panel
  },

  importPanel(panel: Panel): Panel {
    const id = uid()
    const imported: Panel = { ...panel, id, createdAt: now(), updatedAt: now() }
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
    setState((s) => ({ ...s, panels: [...s.panels, newPanel] }))
    return newPanel
  },

  updatePanel(panelId: string, updates: Partial<Pick<Panel, 'name' | 'description' | 'location' | 'voltage' | 'frequency'>>) {
    setState((s) => ({
      ...s,
      panels: s.panels.map((p) => (p.id === panelId ? { ...p, ...updates, updatedAt: now() } : p)),
    }))
  },

  deletePanel(panelId: string) {
    setState((s) => ({
      ...s,
      panels: s.panels.filter((p) => p.id !== panelId),
      activePanelId: s.activePanelId === panelId ? (s.panels.find((p) => p.id !== panelId)?.id ?? null) : s.activePanelId,
    }))
  },

  setActivePanel(panelId: string | null) {
    setState((s) => ({ ...s, activePanelId: panelId, selectedElementId: null, selectedConnectionId: null, connectingFrom: null }))
  },

  getActivePanel,

  // ── Rail CRUD ──
  addRail(rail: Omit<Rail, 'id'>): Rail {
    const newRail: Rail = { ...rail, id: uid() }
    updateActivePanel((p) => ({ ...p, rails: [...p.rails, newRail] }))
    return newRail
  },

  updateRail(railId: string, updates: Partial<Omit<Rail, 'id'>>) {
    updateActivePanel((p) => ({
      ...p,
      rails: p.rails.map((r) => (r.id === railId ? { ...r, ...updates } : r)),
    }))
  },

  deleteRail(railId: string) {
    updateActivePanel((p) => ({
      ...p,
      rails: p.rails.filter((r) => r.id !== railId),
      elements: p.elements.filter((e) => e.railId !== railId),
    }))
    setState((s) => ({
      ...s,
      selectedElementId: null,
    }))
  },

  reorderRails(orderedIds: string[]) {
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
    updateActivePanel((p) => ({ ...p, elements: [...p.elements, newElement] }))
    return newElement
  },

  updateElement(elementId: string, updates: Partial<Omit<PanelElement, 'id'>>) {
    updateActivePanel((p) => ({
      ...p,
      elements: p.elements.map((e) => (e.id === elementId ? { ...e, ...updates } : e)),
    }))
  },

  deleteElement(elementId: string) {
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
    updateActivePanel((p) => ({ ...p, connections: [...p.connections, newConn] }))
    return newConn
  },

  deleteConnection(connectionId: string) {
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
    setState((s) => ({ ...s, selectedElementId: id, selectedConnectionId: null, connectingFrom: null }))
  },

  selectConnection(id: string | null) {
    setState((s) => ({ ...s, selectedConnectionId: id, selectedElementId: null, connectingFrom: null }))
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
}
