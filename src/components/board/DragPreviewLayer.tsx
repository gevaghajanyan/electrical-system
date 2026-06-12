'use client'

import { useEffect, useRef } from 'react'
import type { ElementTypeId } from '@/lib/types/panel'
import { SLOT_WIDTH_PX, ELEMENT_HEIGHT_PX } from '@/lib/constants/canvasLayout'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { renderElementPreview } from '@/lib/utils/canvasRenderer'

interface DragPreviewLayerProps {
  draggingTypeId: ElementTypeId | null
  mousePos: { x: number; y: number }
}

export function DragPreviewLayer({ draggingTypeId, mousePos }: DragPreviewLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const def = draggingTypeId ? ELEMENT_DEFS_MAP.get(draggingTypeId) : undefined
  const previewW = def ? def.defaultSlotWidth * SLOT_WIDTH_PX : SLOT_WIDTH_PX
  const previewH = ELEMENT_HEIGHT_PX

  useEffect(() => {
    if (!canvasRef.current || !def) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    renderElementPreview(ctx, def.id, previewW, previewH)
  }, [def, previewW, previewH])

  if (!draggingTypeId || !def) return null

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left: mousePos.x - previewW / 2,
        top: mousePos.y - previewH / 2,
        width: previewW,
        height: previewH,
        opacity: 0.85,
      }}
    >
      <canvas
        ref={canvasRef}
        width={previewW}
        height={previewH}
        className="rounded-md shadow-lg"
      />
    </div>
  )
}
