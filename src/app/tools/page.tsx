import type { Metadata } from 'next'
import { WireSizeCalculator } from '@/components/WireSizeCalculator'

export const metadata: Metadata = {
  title: 'Electrical Tools',
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Electrical Tools</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Reference calculators for electrical installation work
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Wire Size Calculator
          </h2>
          <WireSizeCalculator />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            Phase Load Calculator
          </h2>
          <p className="text-sm text-zinc-400">Coming soon</p>
        </div>
      </div>
    </div>
  )
}
