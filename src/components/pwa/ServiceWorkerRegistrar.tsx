'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    // Respect Next.js basePath so the SW is fetched from the right subdirectory
    // when we deploy to GitHub Pages `/<repo-name>/`. The scope is limited to
    // the same directory so we do not leak into other projects on the same
    // github.io host.
    const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')
    const swUrl = `${base}/sw.js`
    const scope = `${base}/`

    navigator.serviceWorker.register(swUrl, { scope }).catch(() => {
      // silent — no offline this session
    })
  }, [])

  return null
}
