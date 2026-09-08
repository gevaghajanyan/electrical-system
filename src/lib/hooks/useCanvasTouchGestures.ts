'use client'

import { RefObject, useEffect } from 'react'

interface Options {
  /** Called with a multiplicative scale delta (>1 zoom in, <1 zoom out) and pinch center in wrapper coords. */
  onPinch: (scaleDelta: number, center: { x: number; y: number }) => void
  /** Called with panning delta in wrapper coords (from two-finger pan). */
  onPan: (dx: number, dy: number) => void
  /**
   * If true, single-finger touches are ignored (delegated to Konva).
   * Two-finger gestures are always intercepted.
   */
  disabled?: boolean
}

interface Touch {
  x: number
  y: number
  id: number
}

/**
 * Wires pinch-to-zoom + two-finger pan onto a DOM element. Single-finger
 * touches pass through (so Konva can still handle taps / drags). The wrapper
 * MUST have `touch-action: none` (or `pan-x pan-y`) on the underlying stage
 * container for the browser to release pinch events to us on iOS Safari.
 */
export function useCanvasTouchGestures(ref: RefObject<Element | null>, opts: Options) {
  const { onPinch, onPan, disabled } = opts

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let a: Touch | null = null
    let b: Touch | null = null
    let lastDist = 0
    let lastCenter: { x: number; y: number } | null = null

    const bounds = () => el.getBoundingClientRect()

    function pickTouches(list: TouchList) {
      const rect = bounds()
      const out: Touch[] = []
      for (let i = 0; i < list.length && i < 2; i++) {
        const t = list[i]
        out.push({ x: t.clientX - rect.left, y: t.clientY - rect.top, id: t.identifier })
      }
      return out
    }

    function onStart(e: TouchEvent) {
      if (disabled) return
      if (e.touches.length < 2) return
      const [t1, t2] = pickTouches(e.touches)
      a = t1
      b = t2
      lastDist = Math.hypot(t2.x - t1.x, t2.y - t1.y)
      lastCenter = { x: (t1.x + t2.x) / 2, y: (t1.y + t2.y) / 2 }
      e.preventDefault()
    }

    function onMove(e: TouchEvent) {
      if (disabled) return
      if (e.touches.length < 2 || !a || !b) return
      const [t1, t2] = pickTouches(e.touches)
      const dist = Math.hypot(t2.x - t1.x, t2.y - t1.y)
      const center = { x: (t1.x + t2.x) / 2, y: (t1.y + t2.y) / 2 }
      if (lastDist > 0) {
        const scaleDelta = dist / lastDist
        if (scaleDelta !== 1) onPinch(scaleDelta, center)
      }
      if (lastCenter) {
        onPan(center.x - lastCenter.x, center.y - lastCenter.y)
      }
      lastDist = dist
      lastCenter = center
      a = t1
      b = t2
      e.preventDefault()
    }

    function onEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        a = null
        b = null
        lastDist = 0
        lastCenter = null
      }
    }

    ;(el as HTMLElement).addEventListener('touchstart', onStart, { passive: false })
    ;(el as HTMLElement).addEventListener('touchmove', onMove, { passive: false })
    ;(el as HTMLElement).addEventListener('touchend', onEnd, { passive: true })
    ;(el as HTMLElement).addEventListener('touchcancel', onEnd, { passive: true })

    return () => {
      ;(el as HTMLElement).removeEventListener('touchstart', onStart)
      ;(el as HTMLElement).removeEventListener('touchmove', onMove)
      ;(el as HTMLElement).removeEventListener('touchend', onEnd)
      ;(el as HTMLElement).removeEventListener('touchcancel', onEnd)
    }
  }, [ref, onPinch, onPan, disabled])
}
