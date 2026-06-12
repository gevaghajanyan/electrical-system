'use client'

import { useSyncExternalStore } from 'react'
import { schemeStore, type SchemeStoreState } from '../store/schemeStore'
import type { Scheme } from '../types/scheme'

const SERVER_SNAPSHOT: SchemeStoreState = {
  schemes: [],
  activeSchemeId: null,
  selectedNodeId: null,
  selectedWireId: null,
  connectingFrom: null,
}

export function useSchemeStore(): SchemeStoreState {
  return useSyncExternalStore(
    schemeStore.subscribe.bind(schemeStore),
    schemeStore.getState,
    () => SERVER_SNAPSHOT
  )
}

export function useActiveScheme(): Scheme | null {
  const state = useSchemeStore()
  return state.schemes.find((s) => s.id === state.activeSchemeId) ?? null
}
