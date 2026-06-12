'use client'

import { useSyncExternalStore } from 'react'
import { panelStore, DEFAULT_SETTINGS, type PanelStoreState } from '../store/panelStore'

// Stable snapshot returned during SSR and the first hydration pass.
// Must match the server-rendered HTML to avoid a hydration mismatch that
// would cause React to discard and re-render the server output (visible blink).
const SERVER_SNAPSHOT: PanelStoreState = {
  panels: [],
  activePanelId: null,
  selectedElementId: null,
  selectedConnectionId: null,
  connectingFrom: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  settings: DEFAULT_SETTINGS,
}

export function usePanelStore(): PanelStoreState {
  return useSyncExternalStore(
    panelStore.subscribe.bind(panelStore),
    panelStore.getState,
    () => SERVER_SNAPSHOT
  )
}

export function useActivePanel() {
  const state = usePanelStore()
  return state.panels.find((p) => p.id === state.activePanelId) ?? null
}

export function useSelectedElement() {
  const state = usePanelStore()
  const panel = state.panels.find((p) => p.id === state.activePanelId)
  return panel?.elements.find((e) => e.id === state.selectedElementId) ?? null
}
