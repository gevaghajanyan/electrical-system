/* Electrical Panel Designer - service worker */
/* Simple offline shell strategy:
   - Precache app shell paths on install
   - Runtime cache: same-origin GET requests (stale-while-revalidate)
   - Never cache Next.js RSC/API POST/PUT/DELETE
*/

const VERSION = 'v2'
const SHELL_CACHE = `shell-${VERSION}`
const RUNTIME_CACHE = `runtime-${VERSION}`

// Derive the base path from where the SW itself was served, e.g. a SW at
// https://user.github.io/repo/sw.js gives base = "/repo".
const BASE = (() => {
  const path = new URL(self.location.href).pathname.replace(/\/sw\.js$/, '')
  return path.endsWith('/') ? path.slice(0, -1) : path
})()

const SHELL_PATHS = [
  `${BASE}/`,
  `${BASE}/panels/`,
  `${BASE}/schemes/`,
  `${BASE}/calculators/`,
  `${BASE}/tools/`,
  `${BASE}/settings/`,
  `${BASE}/about/`,
  `${BASE}/manifest.webmanifest`,
  `${BASE}/icons/icon.svg`,
  `${BASE}/icons/icon-maskable.svg`,
]

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_PATHS).catch(() => undefined))
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE).map((k) => caches.delete(k))
      )
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  // Never intercept dev/HMR
  if (url.pathname.startsWith('/_next/webpack-hmr') || url.pathname.includes('__nextjs')) return

  // Navigation: network-first, fall back to cached shell
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req)
          const cache = await caches.open(RUNTIME_CACHE)
          cache.put(req, fresh.clone()).catch(() => undefined)
          return fresh
        } catch {
          const cached = await caches.match(req)
          if (cached) return cached
          return caches.match('/') || Response.error()
        }
      })()
    )
    return
  }

  // Static assets & data: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE)
      const cached = await cache.match(req)
      const network = fetch(req)
        .then((res) => {
          if (res && res.ok && res.type === 'basic') {
            cache.put(req, res.clone()).catch(() => undefined)
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})
