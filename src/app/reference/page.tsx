'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { BookMarked, Shapes, Palette, TableProperties, Boxes, ChevronRight } from 'lucide-react'

const SECTIONS = [
  { id: 'standards',  href: '/reference/standards',   Icon: BookMarked,       color: '#0891b2' },
  { id: 'symbols',    href: '/reference/symbols',     Icon: Shapes,           color: '#7c3aed' },
  { id: 'wireColors', href: '/reference/wire-colors', Icon: Palette,          color: '#a16207' },
  { id: 'ampacity',   href: '/reference/ampacity',    Icon: TableProperties,  color: '#0d9488' },
  { id: 'components', href: '/reference/components',  Icon: Boxes,            color: '#dc2626' },
] as const

export default function ReferencePage() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 pt-10 pb-6 sm:px-6 sm:pt-12">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            <span className="text-gradient">{t('reference.pageTitle')}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
            {t('reference.pageSubtitle')}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => {
            const Icon = s.Icon
            return (
              <Link
                key={s.id}
                href={s.href}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:border-blue-500 touch-manipulation min-h-[160px]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: s.color }}>
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {t(`reference.sections.${s.id}.title`)}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {t(`reference.sections.${s.id}.desc`)}
                </p>
                <ChevronRight size={18} className="ml-auto mt-auto text-zinc-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500 dark:text-zinc-600" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
