'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

interface Shortcut {
  keys: string
  desc: string
}

export default function AboutPage() {
  const { t } = useTranslation()

  const featureItems = t('about.features.items', { returnObjects: true }) as string[]
  const shortcuts = t('about.shortcuts.items', { returnObjects: true }) as Shortcut[]
  const privacyItems = t('about.privacy.items', { returnObjects: true }) as string[]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-800">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {t('about.title')}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {t('about.subtitle')}
          </p>

          <div className="mt-8 space-y-6 text-sm text-zinc-600 dark:text-zinc-300">
            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.features.title')}</h2>
              <ul className="ml-4 list-disc space-y-1 text-zinc-500 dark:text-zinc-400">
                {featureItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.offline.title')}</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {t('about.offline.description')}
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.privacy.title')}</h2>
              <ul className="ml-4 list-disc space-y-1 text-zinc-500 dark:text-zinc-400">
                {privacyItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.standards.title')}</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {t('about.standards.description')}
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.shortcuts.title')}</h2>
              <div className="space-y-1 font-mono text-xs">
                {shortcuts.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="w-28 shrink-0 text-zinc-400">{s.keys}</span>
                    <span>{s.desc}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.technology.title')}</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {t('about.technology.description')}
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.languages.title')}</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {t('about.languages.description')}
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/panels"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('about.getStarted')}
            </Link>
            <Link
              href="/schemes"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {t('about.schemes')}
            </Link>
            <Link
              href="/calculators"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {t('about.calculators')}
            </Link>
            <Link
              href="/learn"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {t('about.learn')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
