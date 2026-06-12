'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const { t } = useTranslation()

  const featureItems = t('about.features.items', { returnObjects: true }) as string[]

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
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.standards.title')}</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {t('about.standards.description')}
              </p>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.shortcuts.title')}</h2>
              <div className="space-y-1 font-mono text-xs">
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">{t('about.shortcuts.deleteKey')}</span>
                  <span>{t('about.shortcuts.deleteDesc')}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">{t('about.shortcuts.scroll')}</span>
                  <span>{t('about.shortcuts.scrollDesc')}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">{t('about.shortcuts.cmdScroll')}</span>
                  <span>{t('about.shortcuts.cmdScrollDesc')}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-24 text-zinc-400">{t('about.shortcuts.middleDrag')}</span>
                  <span>{t('about.shortcuts.middleDragDesc')}</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">{t('about.technology.title')}</h2>
              <p className="text-zinc-500 dark:text-zinc-400">
                {t('about.technology.description')}
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-3">
            <Link
              href="/panels"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('about.getStarted')}
            </Link>
            <Link
              href="/calculators"
              className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              {t('about.calculators')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
