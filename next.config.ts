import type { NextConfig } from 'next'

/**
 * The app is a fully client-side SPA (no server actions, no API routes). We can
 * therefore export it as a static site and host it on GitHub Pages / any CDN.
 *
 * basePath handling:
 *   - GitHub Pages "project" repos serve the site at `/<repo-name>/`.
 *   - GitHub Pages "user/org" repos serve it at `/`.
 *   - `NEXT_PUBLIC_BASE_PATH` is injected by the deploy workflow so the same
 *     config works locally (no basePath) and in CI (with basePath).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || ''

const nextConfig: NextConfig = {
  // Static export → `out/` directory suitable for any static host.
  output: 'export',
  // GitHub Pages serves `/foo/` → `/foo/index.html`; trailing slashes let all
  // client-side links resolve correctly.
  trailingSlash: true,
  // <Image> optimisation needs a runtime; skip it for the static build.
  images: { unoptimized: true },
  // Propagate the base path to both routing and asset URLs.
  basePath,
  assetPrefix: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
}

export default nextConfig
