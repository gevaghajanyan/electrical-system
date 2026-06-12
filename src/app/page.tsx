import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Electrical Panel Designer
        </h1>
        <p className="mt-3 text-base text-zinc-500 dark:text-zinc-400">
          Design DIN rail distribution boards with drag-and-drop simplicity.
          Export to PDF or JSON. All data stays in your browser.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/panels"
            className="flex h-10 items-center rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            Open Panels
          </Link>
          <Link
            href="/calculators"
            className="flex h-10 items-center rounded-lg border border-zinc-300 px-6 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Calculators
          </Link>
          <Link
            href="/about"
            className="flex h-10 items-center px-4 text-sm text-zinc-500 hover:text-zinc-700 transition-colors dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Learn more →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 text-left">
          {[
            { icon: '⚡', title: 'Full element library', desc: 'MCBs, RCDs, RCBOs, isolators, busbars & more' },
            { icon: '📐', title: 'DIN rail layout', desc: 'Drag elements onto configurable DIN rails' },
            { icon: '📄', title: 'PDF & JSON export', desc: 'Print to PDF or share as JSON files' },
          ].map((item) => (
            <div key={item.title} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-xl">{item.icon}</p>
              <p className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">{item.title}</p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
