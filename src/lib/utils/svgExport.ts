import type { Panel } from '../types/panel'
import { ELEMENT_DEFS_MAP } from '../constants/elementDefs'

const SLOT_W = 36
const EL_H = 80
const RAIL_H = 120
const PAD = 24
const HEADER_H = 14

const CIRCUIT_PALETTE = ['#ef4444','#f97316','#f59e0b','#22c55e','#3b82f6','#8b5cf6','#ec4899','#14b8a6']

function circuitTagColor(tag: string): string {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = tag.charCodeAt(i) + ((h << 5) - h)
  return CIRCUIT_PALETTE[Math.abs(h) % CIRCUIT_PALETTE.length]
}

function escSvg(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export function exportPanelToSvg(panel: Panel): void {
  const maxSlots = Math.max(...panel.rails.map((r) => r.slotCount), 1)
  const svgW = PAD * 2 + maxSlots * SLOT_W
  const svgH = PAD * 2 + panel.rails.length * RAIL_H + 40

  const parts: string[] = []

  // Header
  parts.push(`<rect x="0" y="0" width="${svgW}" height="32" fill="#1d4ed8"/>`)
  parts.push(`<text x="${PAD}" y="21" font-family="system-ui,sans-serif" font-size="14" font-weight="700" fill="white">${escSvg(panel.name)}</text>`)
  parts.push(`<text x="${svgW - PAD}" y="21" font-family="system-ui,sans-serif" font-size="10" fill="rgba(255,255,255,0.7)" text-anchor="end">${escSvg(panel.voltage + 'V / ' + panel.frequency + 'Hz')}</text>`)

  panel.rails.forEach((rail, ri) => {
    const ry = 32 + PAD + ri * RAIL_H
    const rw = rail.slotCount * SLOT_W

    // Rail background
    parts.push(`<rect x="${PAD}" y="${ry}" width="${rw}" height="${RAIL_H}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>`)

    // Rail label
    parts.push(`<text x="${PAD + 4}" y="${ry + 11}" font-family="system-ui,sans-serif" font-size="9" font-weight="600" fill="#64748b">${escSvg(rail.label)}</text>`)

    // Slot grid lines
    for (let s = 0; s <= rail.slotCount; s++) {
      parts.push(`<line x1="${PAD + s * SLOT_W}" y1="${ry}" x2="${PAD + s * SLOT_W}" y2="${ry + RAIL_H}" stroke="#e2e8f0" stroke-width="0.5"/>`)
    }

    // DIN track
    parts.push(`<rect x="${PAD}" y="${ry + RAIL_H - 22}" width="${rw}" height="8" fill="#94a3b8" rx="2"/>`)

    // Slot numbers
    for (let s = 0; s < rail.slotCount; s++) {
      parts.push(`<text x="${PAD + s * SLOT_W + SLOT_W / 2}" y="${ry + RAIL_H - 8}" font-family="system-ui,sans-serif" font-size="7" fill="#94a3b8" text-anchor="middle">${s + 1}</text>`)
    }

    // Elements
    const railElements = panel.elements.filter((e) => e.railId === rail.id)
    railElements.forEach((el) => {
      const def = ELEMENT_DEFS_MAP.get(el.typeId)
      if (!def) return
      const ex = PAD + el.slotStart * SLOT_W + 1
      const ey = ry + 16
      const ew = el.slotWidth * SLOT_W - 2
      const eh = EL_H

      // Body
      parts.push(`<rect x="${ex}" y="${ey}" width="${ew}" height="${eh}" fill="${escSvg(def.color)}" rx="4" filter="url(#shadow)"/>`)

      // Circuit tag stripe
      if (el.circuitTag) {
        parts.push(`<rect x="${ex}" y="${ey}" width="4" height="${eh}" fill="${escSvg(circuitTagColor(el.circuitTag))}" rx="4"/>`)
        parts.push(`<rect x="${ex + 2}" y="${ey}" width="2" height="${eh}" fill="${escSvg(circuitTagColor(el.circuitTag))}"/>`)
      }

      // Header
      parts.push(`<rect x="${ex}" y="${ey}" width="${ew}" height="${HEADER_H}" fill="rgba(0,0,0,0.3)" rx="4"/>`)
      parts.push(`<rect x="${ex}" y="${ey + HEADER_H - 4}" width="${ew}" height="4" fill="rgba(0,0,0,0.3)"/>`)

      // Short label
      parts.push(`<text x="${ex + ew / 2}" y="${ey + 10}" font-family="system-ui,sans-serif" font-size="8" font-weight="700" fill="${escSvg(def.textColor)}" text-anchor="middle">${escSvg(def.shortLabel)}</text>`)

      // User label
      if (el.label) {
        parts.push(`<text x="${ex + ew / 2}" y="${ey + eh - 6}" font-family="system-ui,sans-serif" font-size="7" fill="${escSvg(def.textColor)}" opacity="0.8" text-anchor="middle">${escSvg(el.label.slice(0, 10))}</text>`)
      }
    })
  })

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${svgW}" height="${svgH}" fill="#f8fafc"/>
  ${parts.join('\n  ')}
</svg>`

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${panel.name.replace(/\s+/g, '_')}_layout.svg`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
