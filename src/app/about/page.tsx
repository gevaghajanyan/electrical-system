import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Electrical Panel Designer
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            A browser-based tool for designing DIN rail electrical distribution boards
          </p>

          <div className="mt-8 space-y-6 text-sm text-zinc-600 dark:text-zinc-300">
            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">Features</h2>
              <ul className="ml-4 list-disc space-y-1 text-zinc-500 dark:text-zinc-400">
                <li>Visual DIN rail panel layout editor</li>
                <li>Drag-and-drop element placement from a component palette</li>
                <li>MCBs, RCDs, RCBOs, isolators, surge protection, and more</li>
                <li>Multi-rail panels with configurable slot counts</li>
                <li>Element property editing (rating, curve, label)</li>
                <li>Design validation with error and warning reporting</li>
                <li>Export to PDF (print) and JSON</li>
                <li>Import panels from JSON files</li>
                <li>Electrical calculators (cable sizing, voltage drop, fault current)</li>
                <li>All data stored locally — no account required</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">Standards</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Designed for use with BS 7671 (IET Wiring Regulations) and IEC 60364.
                Slot widths follow the 18mm DIN rail module convention.
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">Keyboard Shortcuts</h2>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">Delete / ⌫</span>
                  <span>Delete selected element (focus canvas first)</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">Scroll</span>
                  <span>Pan canvas</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">⌘ Scroll</span>
                  <span>Zoom canvas</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">Middle drag</span>
                  <span>Pan canvas</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">Technology</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.
                Canvas rendering uses the HTML5 Canvas API.
                State persisted via localStorage.
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href="/panels"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Get started
            </Link>
            <Link
              href="/calculators"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Calculators
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
