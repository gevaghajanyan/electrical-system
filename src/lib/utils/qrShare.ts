import QRCode from 'qrcode'
import type { Panel } from '../types/panel'

export async function generateShareQr(panel: Panel): Promise<string> {
  const json = JSON.stringify(panel)
  const encoded = btoa(encodeURIComponent(json))
  const url = `${window.location.origin}/panels?share=${encoded}`
  return QRCode.toDataURL(url, { width: 256, margin: 2, color: { dark: '#18181b', light: '#ffffff' } })
}

export async function downloadShareQr(panel: Panel): Promise<void> {
  const dataUrl = await generateShareQr(panel)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${panel.name.replace(/\s+/g, '_')}_qr.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}
