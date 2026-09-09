'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type System = 'tn_c' | 'tn_s' | 'tn_cs' | 'tt' | 'it'

/**
 * The 5 IEC earthing systems explained with a schematic diagram of the fault
 * path. Users tap a system to see how the utility, cable and load are
 * connected and what protection strategy works there.
 */
export function GroundingSystemsLesson() {
  const { t } = useTranslation()
  const [system, setSystem] = useState<System>('tn_cs')

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.grounding.title')} />
        <Prose>
          <p>{t('learn.lessons.grounding.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-3 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700 sm:grid-cols-5">
            {(['tn_c', 'tn_s', 'tn_cs', 'tt', 'it'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSystem(s)}
                className={`min-h-[40px] rounded-md px-1.5 py-1.5 text-xs font-semibold transition-colors touch-manipulation ${
                  system === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                }`}
              >
                {t(`learn.lessons.grounding.systems.${s}.short`)}
              </button>
            ))}
          </div>

          {/* Diagram */}
          <div className="mt-4 rounded-xl bg-white p-4 dark:bg-zinc-900">
            <SystemDiagram system={system} />
          </div>

          {/* System explanation */}
          <div className="mt-4 space-y-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {t(`learn.lessons.grounding.systems.${system}.name`)}
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {t(`learn.lessons.grounding.systems.${system}.description`)}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-green-700 dark:text-green-300">
                  {t('learn.lessons.grounding.pros')}
                </p>
                <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-200">
                  {t(`learn.lessons.grounding.systems.${system}.pros`)}
                </p>
              </div>
              <div className="rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 dark:text-red-300">
                  {t('learn.lessons.grounding.cons')}
                </p>
                <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-200">
                  {t(`learn.lessons.grounding.systems.${system}.cons`)}
                </p>
              </div>
            </div>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.grounding.point1'),
            t('learn.lessons.grounding.point2'),
            t('learn.lessons.grounding.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function SystemDiagram({ system }: { system: System }) {
  const combined = system === 'tn_c'
  const separate = system === 'tn_s' || system === 'tn_cs'
  const localEarth = system === 'tt' || system === 'it'
  const isolated = system === 'it'

  return (
    <svg viewBox="0 0 520 240" className="h-auto w-full">
      {/* Transformer (utility) */}
      <rect x="10" y="60" width="80" height="80" rx="6" fill="#1b2740" />
      <text x="50" y="100" textAnchor="middle" fontSize="10" fontWeight="700" fill="#f2bc2e">HV / LV</text>
      <text x="50" y="115" textAnchor="middle" fontSize="9" fill="#f2bc2e" opacity="0.7">TRAFO</text>

      {/* Neutral point on the transformer */}
      <circle cx="90" cy="100" r="4" fill="#3b82f6" />
      <text x="98" y="94" fontSize="8" fill="#3b82f6">N</text>

      {/* Utility earth rod (transformer neutral to ground) */}
      {!isolated && (
        <g>
          <line x1="50" y1="140" x2="50" y2="180" stroke="#facc15" strokeWidth="2.5" />
          <path d="M 40 180 L 60 180 M 43 185 L 57 185 M 46 190 L 54 190" stroke="#166534" strokeWidth="2" />
          <text x="55" y="200" fontSize="8" fill="#166534">Utility earth</text>
        </g>
      )}
      {isolated && (
        <g>
          <text x="50" y="165" textAnchor="middle" fontSize="14" fill="#ef4444">✕</text>
          <text x="55" y="180" fontSize="7" fill="#ef4444">Neutral isolated</text>
        </g>
      )}

      {/* Line wire (L) */}
      <line x1="90" y1="80" x2="380" y2="80" stroke="#ef4444" strokeWidth="3" />
      <text x="230" y="72" textAnchor="middle" fontSize="9" fill="#ef4444" fontWeight="700">L</text>

      {/* Neutral wire (or PEN) */}
      <line x1="90" y1="100" x2="380" y2="100" stroke={combined ? '#3b82f6' : '#3b82f6'} strokeWidth="3" />
      <text x="230" y="115" textAnchor="middle" fontSize="9" fill="#3b82f6" fontWeight="700">
        {combined ? 'PEN' : 'N'}
      </text>

      {/* Separate PE conductor (only for TN-S, TN-C-S) */}
      {separate && (
        <>
          <line x1="90" y1="120" x2="380" y2="120" stroke="#facc15" strokeWidth="3" />
          <text x="230" y="135" textAnchor="middle" fontSize="9" fill="#a16207" fontWeight="700">PE</text>
        </>
      )}
      {/* TN-C-S: PEN splits into N and PE at the load side */}
      {system === 'tn_cs' && (
        <>
          <line x1="300" y1="100" x2="300" y2="120" stroke="#facc15" strokeWidth="2" />
          <circle cx="300" cy="100" r="3" fill="#3b82f6" />
          <text x="305" y="94" fontSize="7" fill="#a16207">Split</text>
        </>
      )}

      {/* Load / appliance */}
      <rect x="380" y="65" width="100" height="90" rx="6" fill="#f4f4f5" stroke="#71717a" strokeWidth="1" />
      <text x="430" y="105" textAnchor="middle" fontSize="12" fill="#374151">🔌</text>
      <text x="430" y="125" textAnchor="middle" fontSize="9" fontWeight="700" fill="#71717a">APPLIANCE</text>

      {/* Load-side earth (TT / IT) */}
      {localEarth && (
        <g>
          <line x1="430" y1="155" x2="430" y2="200" stroke="#facc15" strokeWidth="2.5" />
          <path d="M 420 200 L 440 200 M 423 205 L 437 205 M 426 210 L 434 210" stroke="#166534" strokeWidth="2" />
          <text x="430" y="222" textAnchor="middle" fontSize="8" fill="#166534">Local earth</text>
        </g>
      )}
      {/* PE connection to appliance case (TN-S / TN-C-S) */}
      {separate && (
        <line x1="380" y1="120" x2="430" y2="155" stroke="#facc15" strokeWidth="2.5" />
      )}

      {/* Ground reference bar */}
      <line x1="0" y1="230" x2="520" y2="230" stroke="#a1a1aa" strokeWidth="1.5" />
    </svg>
  )
}
