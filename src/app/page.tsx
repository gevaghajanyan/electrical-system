'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { useSchemeStore } from '@/lib/hooks/useSchemeStore'

// ─── Small primitives ─────────────────────────────────────────────────────
function StatCard({ value, label, href }: { value: number | string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:border-blue-500"
    >
      <span className="block text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 tabular-nums">
        {value}
      </span>
      <span className="mt-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-blue-400/10 opacity-0 blur-xl transition-opacity group-hover:opacity-100" />
    </Link>
  )
}

interface QuickActionProps {
  href: string
  icon: React.ReactNode
  label: string
  description: string
  tone?: 'blue' | 'amber' | 'green' | 'violet'
}
const TONES: Record<NonNullable<QuickActionProps['tone']>, string> = {
  blue: 'from-blue-500/15 to-blue-500/0 text-blue-700 dark:text-blue-300',
  amber: 'from-amber-500/15 to-amber-500/0 text-amber-700 dark:text-amber-300',
  green: 'from-green-500/15 to-green-500/0 text-green-700 dark:text-green-300',
  violet: 'from-violet-500/15 to-violet-500/0 text-violet-700 dark:text-violet-300',
}

function QuickAction({ href, icon, label, description, tone = 'blue' }: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800/80 dark:hover:border-blue-500"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${TONES[tone]} opacity-70`} />
      <div className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10 ${TONES[tone].split(' ').slice(-2).join(' ')}`}>
        {icon}
      </div>
      <span className="relative z-10 mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{label}</span>
      <span className="relative z-10 mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</span>
      <svg
        className="relative z-10 mt-auto self-end text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 dark:text-zinc-600"
        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}

// ─── Time-ago helper (locale-aware, no external dep) ──────────────────────
function timeAgo(iso: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  const ru = lang.startsWith('ru')
  if (diff < 60) return ru ? 'только что' : 'just now'
  if (diff < 3600) return ru ? `${Math.floor(diff / 60)} мин` : `${Math.floor(diff / 60)}m`
  if (diff < 86400) return ru ? `${Math.floor(diff / 3600)} ч` : `${Math.floor(diff / 3600)}h`
  return ru ? `${Math.floor(diff / 86400)} дн` : `${Math.floor(diff / 86400)}d`
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { t, i18n } = useTranslation()
  const { panels } = usePanelStore()
  const { schemes } = useSchemeStore()

  const totalElements = panels.reduce((s, p) => s + p.elements.length, 0)
  const totalRails = panels.reduce((s, p) => s + p.rails.length, 0)

  const recentPanels = [...panels]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-16 pb-10 sm:px-6 sm:pt-24 sm:pb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/70 px-3 py-1 text-xs font-medium text-blue-700 backdrop-blur dark:border-blue-800/50 dark:bg-blue-950/50 dark:text-blue-300">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
            {t('home.description').split('.')[0]}
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
            <span className="text-gradient">{t('home.title')}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            {t('home.description')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/panels"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 min-h-[44px]"
            >
              {t('home.openPanels')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-5 py-2.5 text-sm font-semibold text-zinc-700 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200 dark:hover:border-blue-500 min-h-[44px]"
            >
              {t('nav.schemes')}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 space-y-10">
        {/* Stats bento */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard value={panels.length} label={t('home.stats.panels')} href="/panels" />
          <StatCard value={totalElements} label={t('home.stats.elements')} href="/panels" />
          <StatCard value={schemes.length} label={t('home.stats.schemes')} href="/schemes" />
        </section>

        {/* Quick actions bento (asymmetric, modern) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
              {t('home.quickStart')}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              href="/panels"
              tone="blue"
              label={t('home.actions.panels.label')}
              description={t('home.actions.panels.desc')}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="16" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 10h18M3 16h18M9 4v16M15 4v16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <QuickAction
              href="/schemes"
              tone="amber"
              label={t('home.actions.schemes.label')}
              description={t('home.actions.schemes.desc')}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <QuickAction
              href="/calculators"
              tone="green"
              label={t('home.actions.calculators.label')}
              description={t('home.actions.calculators.desc')}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="3" width="16" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
            <QuickAction
              href="/about"
              tone="violet"
              label={t('home.actions.about.label')}
              description={t('home.actions.about.desc')}
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
            />
          </div>
        </section>

        {/* Recent panels + schemes side by side */}
        {(recentPanels.length > 0 || schemes.length > 0) && (
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {recentPanels.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-5 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/70">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t('home.recent.panels')}
                  </h3>
                  <Link href="/panels" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {t('home.recent.viewAll')} →
                  </Link>
                </div>
                <ul className="space-y-1.5">
                  {recentPanels.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/panels/edit?id=${p.id}`}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
                          {p.name}
                        </span>
                        <span className="ml-3 shrink-0 text-xs text-zinc-400 tabular-nums">
                          {p.elements.length} · {timeAgo(p.updatedAt, i18n.language)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {schemes.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-5 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/70">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t('home.recent.schemes')}
                  </h3>
                  <Link href="/schemes" className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    {t('home.recent.viewAll')} →
                  </Link>
                </div>
                <ul className="space-y-1.5">
                  {schemes.slice(0, 4).map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/schemes/edit?id=${s.id}`}
                        className="group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium text-zinc-800 dark:text-zinc-200">
                          {s.name}
                        </span>
                        <span className="ml-3 shrink-0 text-xs text-zinc-400 tabular-nums">
                          {s.nodes.length} · {timeAgo(s.updatedAt, i18n.language)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {panels.length === 0 && schemes.length === 0 && (
          <section className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-12 text-center backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {t('home.emptyState.title')}
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {t('home.emptyState.subtitle')}
            </p>
            <Link
              href="/panels"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 hover:bg-blue-700 min-h-[44px]"
            >
              {t('home.emptyState.cta')}
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
