import type { Panel } from '../types/panel'
import type { RenderOptions } from './canvasRenderer'
import { renderPanel, measureCanvas } from './canvasRenderer'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function exportToPdf(panel: Panel, options?: Partial<RenderOptions>): void {
  const renderOpts: RenderOptions = {
    scale: 1,
    showGrid: true,
    showLabels: true,
    showPorts: false,
    selectedElementId: null,
    highlightedPortId: null,
    ...options,
  }

  const { width, height } = measureCanvas(panel, renderOpts.scale)
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height

  const ctx = offscreen.getContext('2d')
  if (!ctx) return

  renderPanel(ctx, panel, renderOpts)

  const imageDataUrl = offscreen.toDataURL('image/png')

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const name = escapeHtml(panel.name)
  const description = panel.description ? `<span>${escapeHtml(panel.description)}</span>` : ''
  const location = panel.location ? `<span>Location: ${escapeHtml(panel.location)}</span>` : ''

  printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name} – Electrical Panel</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; }
    .page { padding: 20mm; }
    h1 { font-size: 18px; margin-bottom: 8px; }
    .meta { font-size: 12px; color: #555; margin-bottom: 16px; display: flex; gap: 16px; flex-wrap: wrap; }
    .meta span { display: inline-block; }
    img { max-width: 100%; height: auto; border: 1px solid #ddd; }
    @media print {
      .no-print { display: none; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <h1>${name}</h1>
    <div class="meta">
      ${description}
      ${location}
      <span>${panel.voltage}V / ${panel.frequency}Hz</span>
      <span>${panel.rails.length} rail(s) · ${panel.elements.length} element(s)</span>
      <span>Generated: ${new Date().toLocaleDateString()}</span>
    </div>
    <img src="${imageDataUrl}" alt="Panel diagram" />
  </div>
  <div class="no-print" style="padding:16px">
    <button onclick="window.print()" style="padding:8px 16px;cursor:pointer;font-size:14px">Print / Save as PDF</button>
  </div>
  <script>
    window.onload = function() { window.print() }
  <\/script>
</body>
</html>
  `)
  printWindow.document.close()
}

export function exportToImage(panel: Panel, format: 'png' | 'jpeg' = 'png'): void {
  const renderOpts: RenderOptions = {
    scale: 1,
    showGrid: true,
    showLabels: true,
    showPorts: false,
    selectedElementId: null,
    highlightedPortId: null,
  }

  const { width, height } = measureCanvas(panel, renderOpts.scale)
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height

  const ctx = offscreen.getContext('2d')
  if (!ctx) return

  renderPanel(ctx, panel, renderOpts)

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  const dataUrl = offscreen.toDataURL(mimeType, 0.95)

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = `${panel.name.replace(/\s+/g, '_')}.${format}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
