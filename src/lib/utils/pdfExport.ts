import type { Panel, PanelElement } from '../types/panel'
import type { RenderOptions } from './canvasRenderer'
import { renderPanel, measureCanvas } from './canvasRenderer'
import { ELEMENT_DEFS_MAP } from '../constants/elementDefs'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getRatingLabel(el: PanelElement): string {
  const p = el.properties
  if (p.kind === 'mcb') return `${p.curve}${p.rating}A / ${p.breakingCapacity}kA`
  if (p.kind === 'rcbo') return `${p.curve}${p.rating}A / ${p.sensitivity}mA`
  if (p.kind === 'rcd') return `${p.rating}A / ${p.sensitivity}mA`
  if (p.kind === 'isolator') return `${p.rating}A`
  if (p.kind === 'voltage_relay') return `${p.minVoltage}–${p.maxVoltage}V`
  return '—'
}

interface BomRow { typeLabel: string; rating: string; qty: number; labels: string }

function buildBom(panel: Panel): BomRow[] {
  const groups = new Map<string, BomRow>()
  for (const el of panel.elements) {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    if (!def) continue
    const rating = getRatingLabel(el)
    const key = `${el.typeId}|${rating}`
    if (!groups.has(key)) groups.set(key, { typeLabel: def.label, rating, qty: 0, labels: '' })
    const row = groups.get(key)!
    row.qty++
    if (el.label) row.labels = row.labels ? `${row.labels}, ${el.label}` : el.label
  }
  return Array.from(groups.values()).sort((a, b) => a.typeLabel.localeCompare(b.typeLabel))
}

function renderToDataUrl(panel: Panel): string {
  const renderOpts: RenderOptions = {
    scale: 1, showGrid: true, showLabels: true, showPorts: false,
    selectedElementId: null, highlightedPortId: null,
  }
  const { width, height } = measureCanvas(panel, renderOpts.scale)
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')
  if (!ctx) return ''
  renderPanel(ctx, panel, renderOpts)
  return offscreen.toDataURL('image/png')
}

export function exportToPdf(panel: Panel, options?: Partial<RenderOptions>): void {
  const renderOpts: RenderOptions = {
    scale: 1, showGrid: true, showLabels: true, showPorts: false,
    selectedElementId: null, highlightedPortId: null, ...options,
  }
  const { width, height } = measureCanvas(panel, renderOpts.scale)
  const offscreen = document.createElement('canvas')
  offscreen.width = width
  offscreen.height = height
  const ctx = offscreen.getContext('2d')
  if (!ctx) return
  renderPanel(ctx, panel, renderOpts)
  const imageDataUrl = offscreen.toDataURL('image/png')
  openPrintWindow(panel, imageDataUrl, false)
}

export function exportFullReport(panel: Panel): void {
  const imageDataUrl = renderToDataUrl(panel)
  openPrintWindow(panel, imageDataUrl, true)
}

function openPrintWindow(panel: Panel, imageDataUrl: string, includeBom: boolean): void {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  const name = escapeHtml(panel.name)
  const bom = includeBom ? buildBom(panel) : []
  const totalSlots = panel.elements.reduce((s, e) => s + e.slotWidth, 0)
  const totalRatedA = panel.elements.reduce((s, e) => {
    const p = e.properties
    return s + ((p.kind === 'mcb' || p.kind === 'rcbo' || p.kind === 'rcd' || p.kind === 'isolator') ? p.rating : 0)
  }, 0)

  const bomHtml = includeBom && bom.length > 0 ? `
    <div class="section">
      <h2>Bill of Materials</h2>
      <table>
        <thead><tr><th>Device</th><th>Specification</th><th>Qty</th><th>Labels</th></tr></thead>
        <tbody>
          ${bom.map(r => `<tr>
            <td>${escapeHtml(r.typeLabel)}</td>
            <td class="mono">${escapeHtml(r.rating)}</td>
            <td class="center">${r.qty}</td>
            <td class="light">${escapeHtml(r.labels) || '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="summary-row">
        <span>Total: <b>${bom.reduce((s, r) => s + r.qty, 0)}</b> devices · <b>${totalSlots}</b> DIN slots · <b>${totalRatedA}A</b> rated load</span>
      </div>
    </div>` : ''

  printWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name} – Panel Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: system-ui,-apple-system,sans-serif; color:#1a1a1a; font-size:12px; }
    .page { padding: 16mm 20mm; max-width: 210mm; }
    .header { border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 16px; }
    .header h1 { font-size:22px; font-weight:700; color:#1d4ed8; }
    .meta-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; margin-top:10px; }
    .meta-item { background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px 12px; }
    .meta-item .label { font-size:9px; text-transform:uppercase; letter-spacing:.05em; color:#64748b; font-weight:600; }
    .meta-item .value { font-size:13px; font-weight:600; color:#1e293b; margin-top:2px; }
    .section { margin-top:20px; }
    .section h2 { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:#374151; border-bottom:1px solid #e5e7eb; padding-bottom:6px; margin-bottom:10px; }
    table { width:100%; border-collapse:collapse; font-size:11px; }
    th { background:#f1f5f9; text-align:left; padding:6px 10px; font-weight:600; font-size:9px; text-transform:uppercase; letter-spacing:.04em; color:#475569; border-bottom:2px solid #e2e8f0; }
    td { padding:5px 10px; border-bottom:1px solid #f1f5f9; vertical-align:top; }
    tr:nth-child(even) td { background:#fafafa; }
    .mono { font-family:monospace; font-size:10px; }
    .center { text-align:center; }
    .light { color:#64748b; }
    .summary-row { margin-top:8px; font-size:11px; color:#64748b; text-align:right; }
    .panel-image { margin-top:10px; }
    .panel-image img { max-width:100%; height:auto; border:1px solid #e2e8f0; border-radius:4px; }
    .footer { margin-top:20px; padding-top:10px; border-top:1px solid #e5e7eb; font-size:9px; color:#94a3b8; display:flex; justify-content:space-between; }
    .no-print { background:#f8fafc; padding:12px 20px; border-bottom:1px solid #e5e7eb; display:flex; gap:8px; align-items:center; }
    .no-print button { padding:6px 16px; background:#1d4ed8; color:#fff; border:none; border-radius:6px; font-size:13px; cursor:pointer; font-weight:600; }
    .no-print button:hover { background:#1e40af; }
    @media print { .no-print { display:none; } }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">Print / Save as PDF</button>
    <span style="font-size:12px;color:#64748b">Generated ${new Date().toLocaleDateString()}</span>
  </div>
  <div class="page">
    <div class="header">
      <h1>${name}</h1>
      <div class="meta-grid">
        <div class="meta-item"><div class="label">Location</div><div class="value">${escapeHtml(panel.location || '—')}</div></div>
        <div class="meta-item"><div class="label">Supply</div><div class="value">${panel.voltage}V / ${panel.frequency}Hz</div></div>
        <div class="meta-item"><div class="label">Configuration</div><div class="value">${panel.rails.length} rail${panel.rails.length !== 1 ? 's' : ''} · ${panel.elements.length} device${panel.elements.length !== 1 ? 's' : ''}</div></div>
      </div>
    </div>
    ${bomHtml}
    <div class="section">
      <h2>Panel Layout</h2>
      <div class="panel-image"><img src="${imageDataUrl}" alt="Panel diagram" /></div>
    </div>
    <div class="footer">
      <span>Electrical Panel Designer</span>
      <span>Printed ${new Date().toLocaleString()}</span>
    </div>
  </div>
  <script>window.onload = function() { window.print() }<\/script>
</body>
</html>`)
  printWindow.document.close()
}

export function exportToCsv(panel: Panel): void {
  const railOrder = new Map<string, number>(panel.rails.map((r, i) => [r.id, i]))
  const sorted = [...panel.elements].sort((a, b) => {
    const ri = (railOrder.get(a.railId) ?? 0) - (railOrder.get(b.railId) ?? 0)
    if (ri !== 0) return ri
    return a.slotStart - b.slotStart
  })

  function csvVal(s: string): string {
    return `"${s.replace(/"/g, '""')}"`
  }

  const headers = ['#', 'Label', 'Type', 'Rail', 'Slot', 'Rating/Spec', 'Notes']
  const rows: string[][] = sorted.map((el, i) => {
    const def = ELEMENT_DEFS_MAP.get(el.typeId)
    const typeLabel = def ? def.label : el.typeId
    const rail = panel.rails.find((r) => r.id === el.railId)
    const railLabel = rail ? rail.label : el.railId
    return [
      String(i + 1),
      el.label,
      typeLabel,
      railLabel,
      String(el.slotStart + 1),
      getRatingLabel(el),
      el.notes,
    ]
  })

  const csvContent = [headers, ...rows]
    .map((row) => row.map(csvVal).join(','))
    .join('\r\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${panel.name.replace(/\s+/g, '_')}_cable_schedule.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportPanelSchedule(panel: Panel): void {
  const win = window.open('', '_blank')
  if (!win) return

  const name = escapeHtml(panel.name)
  const now = new Date()
  const dateStr = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  // Per-rail table rows
  const railOrder = new Map<string, number>(panel.rails.map((r, i) => [r.id, i]))
  const sorted = [...panel.elements].sort((a, b) => {
    const ri = (railOrder.get(a.railId) ?? 0) - (railOrder.get(b.railId) ?? 0)
    return ri !== 0 ? ri : a.slotStart - b.slotStart
  })

  let rowIndex = 1
  const railSections = panel.rails.map((rail) => {
    const els = sorted.filter((e) => e.railId === rail.id)
    const railA = els.reduce((s, e) => {
      const p = e.properties
      return s + ((p.kind === 'mcb' || p.kind === 'rcbo' || p.kind === 'rcd' || p.kind === 'isolator') ? p.rating : 0)
    }, 0)
    const usedSlots = els.reduce((s, e) => s + e.slotWidth, 0)
    const rows = els.map((el) => {
      const def = ELEMENT_DEFS_MAP.get(el.typeId)
      const i = rowIndex++
      const tag = (el as { circuitTag?: string }).circuitTag
      return `<tr>
        <td class="center">${i}</td>
        <td>${escapeHtml(el.label || '—')}</td>
        <td>${escapeHtml(def?.label ?? el.typeId)}</td>
        <td class="center">${el.slotStart + 1}–${el.slotStart + el.slotWidth}</td>
        <td class="mono center">${escapeHtml(getRatingLabel(el))}</td>
        ${tag ? `<td><span class="tag">${escapeHtml(tag)}</span></td>` : '<td>—</td>'}
        <td class="light">${escapeHtml(el.notes || '—')}</td>
      </tr>`
    }).join('')

    return `
      <div class="rail-section">
        <div class="rail-header">
          <span>${escapeHtml(rail.label || 'Rail')}</span>
          <span class="rail-meta">${els.length} device${els.length !== 1 ? 's' : ''} · ${usedSlots}/${rail.slotCount} slots · ${railA}A rated</span>
        </div>
        ${els.length === 0 ? '<p class="empty-rail">No devices on this rail</p>' : `
        <table>
          <thead>
            <tr><th>#</th><th>Label</th><th>Type</th><th>Slots</th><th>Rating</th><th>Circuit</th><th>Notes</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`}
      </div>`
  }).join('')

  const totalA = panel.elements.reduce((s, e) => {
    const p = e.properties
    return s + ((p.kind === 'mcb' || p.kind === 'rcbo' || p.kind === 'rcd' || p.kind === 'isolator') ? p.rating : 0)
  }, 0)
  const totalDevices = panel.elements.length
  const totalSlots = panel.elements.reduce((s, e) => s + e.slotWidth, 0)

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${name} – Panel Schedule</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family: system-ui,-apple-system,sans-serif; color:#1a1a1a; font-size:11px; }
    .no-print { background:#f8fafc; padding:10px 20px; border-bottom:1px solid #e5e7eb; display:flex; gap:8px; align-items:center; }
    .no-print button { padding:6px 16px; background:#1d4ed8; color:#fff; border:none; border-radius:6px; font-size:12px; cursor:pointer; font-weight:600; }
    @media print { .no-print { display:none; } }
    .page { padding: 14mm 18mm; max-width: 210mm; }
    .header { border-bottom: 2.5px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 14px; }
    .header h1 { font-size: 20px; font-weight: 700; color: #1d4ed8; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 8px; }
    .meta-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 5px; padding: 6px 10px; }
    .meta-item .label { font-size: 8px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; font-weight: 600; }
    .meta-item .value { font-size: 12px; font-weight: 600; color: #1e293b; margin-top: 1px; }
    .rail-section { margin-top: 14px; break-inside: avoid; }
    .rail-header { display: flex; justify-content: space-between; align-items: baseline; background: #1d4ed8; color: #fff; padding: 5px 10px; border-radius: 4px 4px 0 0; font-size: 11px; font-weight: 600; }
    .rail-meta { font-size: 9px; font-weight: 400; opacity: 0.85; }
    .empty-rail { padding: 8px 10px; font-size: 10px; color: #94a3b8; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 4px 4px; }
    table { width: 100%; border-collapse: collapse; font-size: 10px; }
    th { background: #f1f5f9; text-align: left; padding: 5px 8px; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; color: #475569; border-bottom: 1.5px solid #e2e8f0; }
    td { padding: 4px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
    tr:nth-child(even) td { background: #fafafa; }
    .center { text-align: center; }
    .mono { font-family: monospace; font-size: 9px; }
    .light { color: #64748b; }
    .tag { background: #eff6ff; color: #1d4ed8; border-radius: 10px; padding: 1px 6px; font-size: 8px; font-weight: 600; }
    .totals { margin-top: 16px; display: flex; gap: 10px; }
    .total-box { flex: 1; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; }
    .total-box .label { font-size: 8px; text-transform: uppercase; letter-spacing: .05em; color: #64748b; font-weight: 600; }
    .total-box .value { font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 2px; }
    .footer { margin-top: 16px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8px; color: #94a3b8; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">Print / Save as PDF</button>
    <span style="font-size:11px;color:#64748b">Panel Schedule — ${name}</span>
  </div>
  <div class="page">
    <div class="header">
      <h1>${name}</h1>
      <div class="meta-grid">
        <div class="meta-item"><div class="label">Location</div><div class="value">${escapeHtml(panel.location || '—')}</div></div>
        <div class="meta-item"><div class="label">Supply</div><div class="value">${panel.voltage}V / ${panel.frequency}Hz</div></div>
        <div class="meta-item"><div class="label">Rails</div><div class="value">${panel.rails.length}</div></div>
        <div class="meta-item"><div class="label">Prepared</div><div class="value">${dateStr}</div></div>
      </div>
    </div>

    ${railSections}

    <div class="totals">
      <div class="total-box"><div class="label">Total devices</div><div class="value">${totalDevices}</div></div>
      <div class="total-box"><div class="label">DIN slots used</div><div class="value">${totalSlots}</div></div>
      <div class="total-box"><div class="label">Rated load</div><div class="value">${totalA}A</div></div>
    </div>

    <div class="footer">
      <span>Electrical Panel Designer</span>
      <span>Printed ${now.toLocaleString()}</span>
    </div>
  </div>
  <script>window.onload = function() { window.print() }<\/script>
</body>
</html>`)
  win.document.close()
}

export function exportToImage(panel: Panel, format: 'png' | 'jpeg' = 'png'): void {
  const renderOpts: RenderOptions = {
    scale: 1, showGrid: true, showLabels: true, showPorts: false,
    selectedElementId: null, highlightedPortId: null,
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
