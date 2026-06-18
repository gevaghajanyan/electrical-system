'use client'

import { useSyncExternalStore } from 'react'
import { panelStore } from '@/lib/store/panelStore'

const SERVER_SNAPSHOT = 'saved' as const

export function SaveStatusIndicator() {
  const status = useSyncExternalStore(
    panelStore.subscribeSaveStatus.bind(panelStore),
    panelStore.getSaveStatus.bind(panelStore),
    () => SERVER_SNAPSHOT
  )

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs transition-opacity ${
        status === 'saving' ? 'opacity-100' : 'opacity-50'
      }`}
    >
      {status === 'saving' ? (
        <>
          <svg className="h-3 w-3 animate-spin text-zinc-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-zinc-400 dark:text-zinc-500">Saving…</span>
        </>
      ) : (
        <>
          <svg className="h-3 w-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-zinc-400 dark:text-zinc-500">Saved</span>
        </>
      )}
    </span>
  )
}
