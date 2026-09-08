'use client'

import type { ElementTypeId } from '@/lib/types/panel'
import { SLOT_WIDTH_PX, ELEMENT_HEIGHT_PX } from '@/lib/constants/canvasLayout'
import { ELEMENT_DEFS_MAP } from '@/lib/constants/elementDefs'
import { DeviceIcon } from './palette/DeviceIcon'

interface DragPreviewLayerProps {
  draggingTypeId: ElementTypeId | null
  mousePos: { x: number; y: number }
}

export function DragPreviewLayer({ draggingTypeId, mousePos }: DragPreviewLayerProps) {
  const def = draggingTypeId ? ELEMENT_DEFS_MAP.get(draggingTypeId) : undefined
  if (!draggingTypeId || !def) return null

  const previewW = def.defaultSlotWidth * SLOT_WIDTH_PX
  const previewH = ELEMENT_HEIGHT_PX

  return (
    <div
      className="pointer-events-none fixed z-50 drop-shadow-lg"
      style={{
        left: mousePos.x - previewW / 2,
        top: mousePos.y - previewH / 2,
        width: previewW,
        height: previewH,
        opacity: 0.9,
      }}
    >
      <DeviceIcon def={def} className="h-full w-full" />
    </div>
  )
}
