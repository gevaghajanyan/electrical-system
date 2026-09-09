# Voltra — Electrical Panel Designer

A browser-based tool for designing DIN rail electrical distribution boards and
wiring schemes, with a library of electrical calculators and a set of learning
lessons. Runs fully client-side, installs as a PWA, works offline.

- **Live app:** deployed as a static site to GitHub Pages via `.github/workflows/deploy.yml`.
- **License / status:** private project (`"private": true` in `package.json`).

---

## Features

### Panel Designer (`/panels`)
Lay out modular equipment on DIN rails — the same way you'd plan a real
distribution board.

- Multi-rail panels with configurable slot counts.
- Drag-and-drop element palette covering MCBs (1/2/3/4-pole), RCDs, RCBOs,
  isolators, main switches, contactors, timers, surge protectors, voltage
  relays, kWh meters, signal lamps, sockets, push buttons, motor starters,
  buzzers, dimmers, busbars, neutral / earth bars, and blank modules.
- Per-element typed properties (rating, curve, sensitivity, poles, coil
  voltage, MID class, SPD type, etc.) — defined in `src/lib/types/panel.ts`.
- Circuit tags, phase assignment (L1/L2/L3), labels, notes, and per-panel
  input cables.
- Wire connections between element ports with a visual connection matrix.
- Undo / redo (50-step history) with a history panel and snapshots.
- Auto-numbering, auto-pack rails, bulk move / bulk tag operations.
- Bill-of-materials generation, SVG export, PDF export, QR-code sharing.
- Schematic view alongside the physical layout.

### Wiring Schemes (`/schemes`)
Higher-level circuit diagrams that can optionally reference panel elements.

- Node-and-wire canvas: switches (SPST, 2-way), lamps, LEDs, transformers,
  AC power, sockets, push buttons, motors, junctions.
- Rotation (0/90/180/270°), port-to-port wiring, per-wire labels.
- Nodes can link back to a specific `PanelElement` for cross-referencing.

### Calculators (`/calculators`)
20+ single-purpose calculators grouped into **basic**, **installation**,
**power**, **electronics**, and **utility** — Ohm's law (DC/AC), power/current,
cable sizing, voltage drop, fault current, motor FLC and startup, power factor
correction, resistor/capacitor networks, LED series resistor, voltage divider,
AWG conversion, cable power loss, neutral current, conductor resistance,
busbar current, battery life, resistor colour code, SMD resistor decode, unit
converter, and a formulas reference.

Registered in `src/components/calculators/registry.tsx` — add a new calculator
by dropping a component and appending an entry.

### Learn (`/learn`)
15 short lessons (beginner → advanced) covering electricity fundamentals,
Ohm's law, series/parallel, AC vs DC, components, breadboarding, fuses and
breakers, RCDs and earthing, batteries, three-phase, grounding systems,
selectivity, motor starting, harmonics, and cascaded voltage drop. Lessons
link out to related calculators.

### Tools & Settings
- `/tools` — utility hub.
- `/settings` — default voltage / frequency / slot count and theme
  (light / dark / system).
- `/about` — app metadata.

### PWA / offline
- Manifest at `src/app/manifest.ts` (name, icons, shortcuts to Panels,
  Schemes, Calculators).
- Service worker at `public/sw.js` — precaches the app shell and
  stale-while-revalidates same-origin GETs. `basePath`-aware so it works on
  both user and project GitHub Pages sites.
- Install prompt handled by `src/components/pwa/InstallPromptProvider.tsx`.

### Internationalisation
English (`en`), Russian (`ru`), and Armenian (`hy`). Locale files live in
`src/lib/i18n/locales/`. Server always renders `en` to avoid hydration
mismatches — the client swaps language on mount via `detectClientLanguage()`
(`src/lib/i18n/index.ts`). Missing keys fall back to English key-by-key.

---

## Tech stack

| Area          | Choice                                                    |
| ------------- | --------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, `output: 'export'` static SPA)    |
| UI            | React 19, Tailwind CSS 4                                  |
| Canvas        | Konva + react-konva (panel and scheme editors)            |
| i18n          | i18next + react-i18next + browser language detector       |
| Icons         | lucide-react + inline SVGs                                |
| Export        | QR codes via `qrcode`; custom SVG / PDF exporters         |
| Storage       | `localStorage` (key `electrical-system-v1`) — no backend  |
| Types         | TypeScript 5 strict                                       |
| Lint          | ESLint 9 (`eslint-config-next`)                           |

There is no backend, no API routes, no server actions — everything runs in
the browser and persists to `localStorage`.

---

## Project layout

```
src/
├─ app/                       Next.js App Router routes
│  ├─ layout.tsx              Root layout: I18n, Theme, NavBar, PWA registrar
│  ├─ page.tsx                Home dashboard (stats, quick actions, recents)
│  ├─ manifest.ts             PWA manifest (static-exportable)
│  ├─ panels/  edit/          Panel list + editor
│  ├─ schemes/ edit/          Scheme list + editor
│  ├─ calculators/[id]/       Calculator index + detail
│  ├─ learn/[id]/             Lesson index + detail
│  ├─ tools/  settings/  about/
│  └─ globals.css
├─ components/
│  ├─ NavBar, ThemeProvider, I18nProvider, LanguageSwitcher, ShortcutModal
│  ├─ SaveStatusIndicator, WireSizeCalculator
│  ├─ board/                  Panel editor (canvas, palette, forms, modals)
│  │  ├─ canvas/              Konva shapes, rail rows, wire layer
│  │  ├─ forms/               Per-element property forms (MCB, RCD, ...)
│  │  └─ palette/             Palette icons
│  ├─ scheme/                 Scheme editor (canvas, palette, symbols)
│  ├─ calculators/            Calculator components + registry
│  ├─ learn/                  Lesson components + registry
│  ├─ pwa/                    ServiceWorkerRegistrar, InstallPromptProvider
│  ├─ brand/                  Logo
│  └─ ui/                     Primitives: Button, Input, Modal, Select, ...
└─ lib/
   ├─ constants/              Element defs, panel templates, canvas layout
   ├─ hooks/                  usePanelStore, useSchemeStore, useIsDark, ...
   ├─ i18n/                   i18next setup + en / ru / hy locales
   ├─ store/                  panelStore, schemeStore, snapshotStore, recents
   ├─ types/                  panel.ts, scheme.ts
   └─ utils/                  Renderers, exporters, validation, port utils
public/
├─ sw.js                      Offline service worker
└─ icons/                     PWA icons
```

### State management
Two hand-rolled stores (`src/lib/store/panelStore.ts`,
`src/lib/store/schemeStore.ts`) with a pub/sub API consumed via
`usePanelStore` / `useSchemeStore`. Each store:

- persists to `localStorage` with a 400 ms debounce and exposes a `saved` /
  `saving` status,
- migrates older serialised payloads on load (see `migrateElementKind`),
- maintains its own 50-entry undo / redo stack plus a clipboard,
- exposes a snapshot API (`src/lib/store/snapshotStore.ts`) for
  save-as-you-go versioning.

---

## Getting started

Requirements: Node 20+ (matching the CI workflow), npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run build        # Static export → out/
npm run start        # Serve a prebuilt production build
npm run lint         # ESLint
```

Note: `next.config.ts` sets `output: 'export'` — `npm run start` is only
useful for the export preview; there is no server runtime.

---

## Deployment

Push to `main` and GitHub Actions handles the rest:

1. `npm ci` on Node 20.
2. Computes `NEXT_PUBLIC_BASE_PATH` from the repo name:
   - `owner/owner.github.io` → empty base path.
   - `owner/repo` → `/repo` (so links and assets resolve on project sites).
3. `npm run build` produces `out/`.
4. `touch out/.nojekyll` prevents GitHub Pages from stripping `_next/`.
5. Uploads and deploys via `actions/deploy-pages@v4`.

Workflow: `.github/workflows/deploy.yml`.

To deploy elsewhere, serve the `out/` directory from any static host. Set
`NEXT_PUBLIC_BASE_PATH` at build time if the site is served from a sub-path.

---

## Adding to the app

- **New element type** — extend the union in `src/lib/types/panel.ts`, add a
  properties interface, add a definition to `src/lib/constants/elementDefs.ts`,
  add a form under `src/components/board/forms/`, and (if needed) a canvas
  shape under `src/components/board/canvas/symbols`.
- **New calculator** — build a component in `src/components/calculators/`,
  add a `CalcDef` entry to `registry.tsx`, and add its i18n keys under
  `calc.<id>.*`.
- **New lesson** — add a component under `src/components/learn/lessons/`,
  add a `LessonDef` entry to `src/components/learn/registry.tsx` with
  group / level / minutes / icon / colour, and add i18n keys under
  `learn.lessons.<id>.*`.
- **New locale** — add `src/lib/i18n/locales/<code>.json`, register it in
  `src/lib/i18n/index.ts` under `SUPPORTED_LANGS` and `resources`, and
  extend the detector in `detectClientLanguage()`.

---

## Notes for contributors

- This uses **Next.js 16** — App Router, `output: 'export'` static SPA. There
  are breaking changes from older Next versions; the source of truth is
  `node_modules/next/dist/docs/` (see `AGENTS.md`).
- The app is client-only. Do not add API routes, server actions, or any code
  that requires a request-time runtime — it will break the static export.
- Anything that touches `window`, `localStorage`, or `navigator` must be
  guarded for SSR (see `loadFromStorage()` and `detectClientLanguage()`).
- Panel / scheme data is stored under `electrical-system-v1` in
  `localStorage`. Schema migrations live in `migrateState()` — if the shape
  changes, add a migration there rather than bumping the storage key.
