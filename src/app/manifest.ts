import type { MetadataRoute } from 'next'

// Required for `output: 'export'` — signals no request-time data is used.
export const dynamic = 'force-static'

// Prefix runtime paths with the deploy basePath so the manifest is valid on
// GitHub Pages project sites served at /<repo-name>/.
const base = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '')
const p = (path: string) => `${base}${path}`

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Voltra — Electrical Panel Designer',
    short_name: 'Voltra',
    description:
      'Design DIN rail electrical distribution boards and wiring schemes. Works offline.',
    start_url: p('/'),
    scope: p('/'),
    display: 'standalone',
    orientation: 'any',
    background_color: '#faf9f7',
    theme_color: '#f2bc2e',
    categories: ['productivity', 'utilities'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: p('/icons/icon.svg'),
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
      {
        src: p('/icons/icon-maskable.svg'),
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      { name: 'Panels',      short_name: 'Panels', url: p('/panels'),      description: 'Open the panel editor' },
      { name: 'Schemes',     short_name: 'Schemes', url: p('/schemes'),    description: 'Open wiring schemes' },
      { name: 'Calculators', short_name: 'Calc',   url: p('/calculators'), description: 'Electrical calculators' },
    ],
  }
}
