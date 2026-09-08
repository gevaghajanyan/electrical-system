'use client'

import { ReactNode, useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** Percentage of viewport height (0–100). Default 75. */
  heightPct?: number
}

/**
 * Mobile-first bottom sheet. Prefer this over a full modal for palette,
 * properties, and other tall-content panels on small viewports.
 */
export function BottomSheet({ open, onClose, title, children, heightPct = 75 }: Props) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900 flex flex-col animate-[slideUp_0.18s_ease-out]"
        style={{
          height: `${heightPct}vh`,
          paddingBottom: 'env(safe-area-inset-bottom, 0)',
        }}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            {title && (
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{title}</h2>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
