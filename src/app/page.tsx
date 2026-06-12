'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { usePanelStore } from '@/lib/hooks/usePanelStore'

function StatCard({ value, label, href }: { value: number | string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-blue-700 dark:hover:bg-blue-900/10"
    >
      <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{value}</span>
      <span className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
    </Link>
  )
}

export default function HomePage() {
  const { t } = useTranslation()
  const { panels } = usePanelStore()

  const totalElements = panels.reduce((s, p) => s + p.elements.length, 0)
  const totalRails = panels.reduce((s, p) => s + p.rails.length, 0)

  const recent = [...panels]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  function formatDate(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Hero */}
      <div className="mx-auto w-full max-w-4xl px-4 pt-12 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('home.title')}</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{t('home.description')}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pb-12 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard value={panels.length} label="Panels" href="/panels" />
          <StatCard value={totalElements} label="Devices placed" href="/panels" />
          <StatCard value={totalRails} label="DIN rails" href="/panels" />
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Quick start</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { href: '/panels', icon: '🗂', label: 'Panel Editor', desc: 'DIN rail layout' },
              { href: '/schemes', icon: '⚡', label: 'Wiring Schemes', desc: 'Circuit diagrams' },
              { href: '/calculators', icon: '🔢', label: 'Calculators', desc: 'Cable, voltage drop' },
              { href: '/about', icon: '📖', label: 'Shortcuts', desc: 'Keyboard reference' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-blue-700 dark:hover:bg-blue-900/10"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{item.label}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent panels */}
        {recent.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Recent panels</h2>
              <Link href="/panels" className="text-xs text-blue-600 hover:underline dark:text-blue-400">View all →</Link>
            </div>
            <div className="space-y-2">
              {recent.map((p) => (
                <Link
                  key={p.id}
                  href={`/panels/${p.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40 dark:border-zinc-700 dark:bg-zinc-800/60 dark:hover:border-blue-700"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{p.name}</p>
                    {p.location && <p className="text-xs text-zinc-400">{p.location}</p>}
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-3 text-xs text-zinc-400">
                    <span>{p.elements.length} devices</span>
                    <span>{formatDate(p.updatedAt)}</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {panels.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-800/40">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">No panels yet</p>
            <Link
              href="/panels"
              className="mt-3 inline-flex h-9 items-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              Create your first panel
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
