'use client'

import type { ReactNode } from 'react'
import { useEffect, useRef } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, footer, maxWidth = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Keep the latest onClose in a ref so effects can read it without re-running
  // when the parent hands us a fresh arrow function each render (which was
  // causing initial-focus to fire on every keystroke → inputs losing focus
  // after the first character on mobile).
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Focus the first focusable element ONCE when the modal opens.
  useEffect(() => {
    if (!open) return
    // Wait a frame so refs / autoFocus have settled and we don't fight the
    // browser for focus on iOS Safari.
    const raf = requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      // Prefer inputs / textareas over buttons for the initial focus.
      const preferred = panel.querySelector<HTMLElement>('input, textarea, select')
      if (preferred) {
        preferred.focus()
        return
      }
      const first = panel.querySelector<HTMLElement>(FOCUSABLE)
      first?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Escape + Tab focus-trap — depends only on `open`; reads onClose via ref.
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key === 'Tab') {
        const panel = panelRef.current
        if (!panel) return
        const focusable = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Lock body scroll while the modal is open (helps on iOS where a background
  // tap can still scroll the page).
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        className={[
          'relative w-full rounded-xl bg-white shadow-xl dark:bg-zinc-900',
          maxWidthClasses[maxWidth],
        ].join(' ')}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-700">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4 dark:border-zinc-700">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
