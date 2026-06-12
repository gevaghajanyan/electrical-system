import type { Panel } from '../types/panel'

const SCHEMA_VERSION = 1

interface ExportEnvelope {
  schemaVersion: number
  exportedAt: string
  panel: Panel
}

export function serializePanel(panel: Panel): string {
  const envelope: ExportEnvelope = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    panel,
  }
  return JSON.stringify(envelope, null, 2)
}

export function deserializePanel(json: string): Panel {
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    throw new Error('Invalid JSON: could not parse file')
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid file: expected an object')
  }

  const obj = parsed as Record<string, unknown>

  // Support both envelope format and bare panel format
  const rawPanel = 'panel' in obj ? obj.panel : obj
  if (typeof rawPanel !== 'object' || rawPanel === null) {
    throw new Error('Invalid file: panel data not found')
  }

  const p = rawPanel as Record<string, unknown>
  if (typeof p.id !== 'string') throw new Error('Invalid panel: missing id')
  if (typeof p.name !== 'string') throw new Error('Invalid panel: missing name')
  if (!Array.isArray(p.rails)) throw new Error('Invalid panel: missing rails')
  if (!Array.isArray(p.elements)) throw new Error('Invalid panel: missing elements')
  if (!Array.isArray(p.connections)) throw new Error('Invalid panel: missing connections')

  return rawPanel as Panel
}

export function downloadJson(panel: Panel): void {
  const json = serializePanel(panel)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${panel.name.replace(/\s+/g, '_')}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function readJsonFile(file: File): Promise<Panel> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result
        if (typeof text !== 'string') throw new Error('Could not read file')
        resolve(deserializePanel(text))
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

