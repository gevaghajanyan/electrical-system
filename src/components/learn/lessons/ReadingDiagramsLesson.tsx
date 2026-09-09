'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Standard = 'iec' | 'ansi'

interface SymRow {
  id: string
  iec: React.ReactNode
  ansi: React.ReactNode
}

/** Small symbol row — always draws inside 80×32 viewBox. */
function Sym({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 80 32" className="h-8 w-20">
      <g stroke="#1b2740" strokeWidth={1.6} fill="none" strokeLinecap="round">
        {children}
      </g>
    </svg>
  )
}

const ROWS: SymRow[] = [
  {
    id: 'resistor',
    iec: (
      <Sym>
        <line x1={0} y1={16} x2={20} y2={16} />
        <rect x={20} y={10} width={40} height={12} fill="#fef9c3" stroke="#1b2740" />
        <line x1={60} y1={16} x2={80} y2={16} />
      </Sym>
    ),
    ansi: (
      <Sym>
        <line x1={0} y1={16} x2={16} y2={16} />
        <path d="M 16 16 L 22 6 L 30 26 L 38 6 L 46 26 L 54 6 L 62 16" />
        <line x1={62} y1={16} x2={80} y2={16} />
      </Sym>
    ),
  },
  {
    id: 'capacitor',
    iec: (
      <Sym>
        <line x1={0} y1={16} x2={34} y2={16} />
        <line x1={34} y1={4} x2={34} y2={28} strokeWidth={2.4} />
        <line x1={40} y1={4} x2={40} y2={28} strokeWidth={2.4} />
        <line x1={40} y1={16} x2={80} y2={16} />
      </Sym>
    ),
    ansi: (
      <Sym>
        <line x1={0} y1={16} x2={34} y2={16} />
        <line x1={34} y1={4} x2={34} y2={28} strokeWidth={2.4} />
        <path d="M 40 4 Q 44 16 40 28" strokeWidth={2.4} fill="none" />
        <line x1={40} y1={16} x2={80} y2={16} />
      </Sym>
    ),
  },
  {
    id: 'switch',
    iec: (
      <Sym>
        <line x1={0}  y1={16} x2={22} y2={16} />
        <line x1={58} y1={16} x2={80} y2={16} />
        <circle cx={22} cy={16} r={2.2} fill="#1b2740" />
        <circle cx={58} cy={16} r={2.2} fill="#1b2740" />
        <line x1={24} y1={16} x2={54} y2={4} strokeWidth={2.2} />
      </Sym>
    ),
    ansi: (
      <Sym>
        <line x1={0}  y1={16} x2={22} y2={16} />
        <line x1={58} y1={16} x2={80} y2={16} />
        <circle cx={22} cy={16} r={2.2} fill="#1b2740" />
        <circle cx={58} cy={16} r={2.2} fill="#1b2740" />
        <line x1={24} y1={16} x2={54} y2={8}  strokeWidth={2.2} />
      </Sym>
    ),
  },
  {
    id: 'ground',
    iec: (
      <Sym>
        <line x1={40} y1={2}  x2={40} y2={16} />
        <line x1={22} y1={16} x2={58} y2={16} strokeWidth={2.2} />
        <line x1={28} y1={22} x2={52} y2={22} />
        <line x1={34} y1={28} x2={46} y2={28} />
      </Sym>
    ),
    ansi: (
      <Sym>
        <line x1={40} y1={2}  x2={40} y2={16} />
        <line x1={22} y1={16} x2={58} y2={16} strokeWidth={2.2} />
        <line x1={22} y1={16} x2={30} y2={26} />
        <line x1={30} y1={16} x2={38} y2={26} />
        <line x1={38} y1={16} x2={46} y2={26} />
        <line x1={46} y1={16} x2={54} y2={26} />
      </Sym>
    ),
  },
]

export function ReadingDiagramsLesson() {
  const { t } = useTranslation()
  const [std, setStd] = useState<Standard>('iec')

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.reading_diagrams.title')} />
        <Prose>
          <p>{t('learn.lessons.reading_diagrams.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
            {(['iec', 'ansi'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStd(s)}
                className={`min-h-[40px] rounded-md px-2 py-1.5 text-sm font-medium transition-colors touch-manipulation ${
                  std === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.reading_diagrams.standards.${s}`)}
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
                <tr>
                  <th className="px-3 py-2">{t('learn.lessons.reading_diagrams.component')}</th>
                  <th className="px-3 py-2">{t(`learn.lessons.reading_diagrams.standards.${std}`)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {ROWS.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      {t(`learn.lessons.reading_diagrams.rows.${row.id}`)}
                    </td>
                    <td className="px-3 py-2">{std === 'iec' ? row.iec : row.ansi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Line-type legend */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <LegendLine label={t('learn.lessons.reading_diagrams.line.solid')}    dash="none" />
            <LegendLine label={t('learn.lessons.reading_diagrams.line.dashed')}   dash="4 3" />
            <LegendLine label={t('learn.lessons.reading_diagrams.line.dotted')}   dash="1 3" />
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.reading_diagrams.point1'),
            t('learn.lessons.reading_diagrams.point2'),
            t('learn.lessons.reading_diagrams.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function LegendLine({ label, dash }: { label: string; dash: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-zinc-50 p-2 dark:bg-zinc-900/60">
      <svg viewBox="0 0 80 16" className="h-4 w-20 shrink-0">
        <line x1={2} y1={8} x2={78} y2={8} stroke="#1b2740" strokeWidth={2} strokeDasharray={dash === 'none' ? undefined : dash} />
      </svg>
      <span className="text-xs text-zinc-700 dark:text-zinc-200">{label}</span>
    </div>
  )
}
