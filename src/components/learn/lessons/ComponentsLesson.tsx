'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

/**
 * Beginner guide to the fundamental electronic components. Each entry has a
 * hand-drawn SVG that emphasizes shape/purpose over exact schematic accuracy.
 */

interface Comp {
  id: string
  color: string
  emoji: string
}

const COMPS: Comp[] = [
  { id: 'resistor',    color: '#f59e0b', emoji: 'Ω'   },
  { id: 'capacitor',   color: '#8b5cf6', emoji: '‖'   },
  { id: 'inductor',    color: '#0ea5e9', emoji: '◠'   },
  { id: 'diode',       color: '#22c55e', emoji: '▷|'  },
  { id: 'led',         color: '#ef4444', emoji: '●'   },
  { id: 'transistor',  color: '#0f766e', emoji: 'Q'   },
  { id: 'ic',          color: '#374151', emoji: '⎡⎦'  },
  { id: 'battery',     color: '#1b2740', emoji: '⚡'   },
]

function ResistorArt() {
  return (
    <svg viewBox="0 0 200 80" className="h-auto w-full max-w-xs">
      <rect x="30" y="26" width="140" height="28" rx="10" fill="#f4a020" stroke="#78350f" strokeWidth="1.5" />
      {/* Colour bands */}
      <rect x="55"  y="26" width="9" height="28" fill="#8b4513" />
      <rect x="75"  y="26" width="9" height="28" fill="#000000" />
      <rect x="95"  y="26" width="9" height="28" fill="#ef4444" />
      <rect x="140" y="26" width="9" height="28" fill="#facc15" />
      {/* Leads */}
      <line x1="0"   y1="40" x2="30"  y2="40" stroke="#a1a1aa" strokeWidth="3" />
      <line x1="170" y1="40" x2="200" y2="40" stroke="#a1a1aa" strokeWidth="3" />
    </svg>
  )
}

function CapacitorArt() {
  return (
    <svg viewBox="0 0 200 80" className="h-auto w-full max-w-xs">
      {/* Two vertical plates */}
      <line x1="0" y1="40" x2="90" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      <rect x="90" y="12" width="6" height="56" fill="#8b5cf6" />
      <rect x="104" y="12" width="6" height="56" fill="#8b5cf6" />
      <line x1="110" y1="40" x2="200" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      {/* + / − */}
      <text x="83" y="20" textAnchor="end" fontSize="16" fontWeight="800" fill="#f2bc2e">+</text>
      <text x="118" y="20" fontSize="16" fontWeight="800" fill="#71717a">−</text>
    </svg>
  )
}

function InductorArt() {
  return (
    <svg viewBox="0 0 200 80" className="h-auto w-full max-w-xs">
      <line x1="0" y1="40" x2="40" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      {/* Four coils */}
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M ${40 + i * 30} 40 A 15 15 0 0 1 ${70 + i * 30} 40`}
          fill="none"
          stroke="#0ea5e9"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
      <line x1="160" y1="40" x2="200" y2="40" stroke="#a1a1aa" strokeWidth="3" />
    </svg>
  )
}

function DiodeArt() {
  return (
    <svg viewBox="0 0 200 80" className="h-auto w-full max-w-xs">
      <line x1="0" y1="40" x2="70" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      <polygon points="70,20 70,60 110,40" fill="#22c55e" stroke="#166534" strokeWidth="1.5" />
      <rect x="110" y="20" width="6" height="40" fill="#166534" />
      <line x1="116" y1="40" x2="200" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      <text x="60" y="16" fontSize="12" fontWeight="700" fill="#166534">+</text>
      <text x="130" y="16" fontSize="12" fontWeight="700" fill="#71717a">−</text>
    </svg>
  )
}

function LedArt({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 200 80" className="h-auto w-full max-w-xs">
      <line x1="0" y1="40" x2="70" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      <polygon points="70,20 70,60 110,40" fill={on ? '#ef4444' : '#fecaca'} stroke="#7f1d1d" strokeWidth="1.5" />
      <rect x="110" y="20" width="6" height="40" fill="#7f1d1d" />
      <line x1="116" y1="40" x2="200" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      {on && (
        <>
          <circle cx="90" cy="40" r="30" fill="#ef4444" opacity="0.25" />
          <line x1="130" y1="10" x2="140" y2="0" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="140" y1="10" x2="150" y2="0" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          <line x1="150" y1="10" x2="160" y2="0" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function TransistorArt() {
  return (
    <svg viewBox="0 0 200 100" className="h-auto w-full max-w-xs">
      {/* Base line */}
      <line x1="0" y1="50" x2="70" y2="50" stroke="#a1a1aa" strokeWidth="3" />
      <line x1="70" y1="20" x2="70" y2="80" stroke="#0f766e" strokeWidth="4" />
      {/* Collector */}
      <line x1="70" y1="35" x2="120" y2="15" stroke="#0f766e" strokeWidth="3" />
      <line x1="120" y1="15" x2="200" y2="15" stroke="#a1a1aa" strokeWidth="3" />
      {/* Emitter with arrow */}
      <line x1="70" y1="65" x2="120" y2="85" stroke="#0f766e" strokeWidth="3" />
      <line x1="120" y1="85" x2="200" y2="85" stroke="#a1a1aa" strokeWidth="3" />
      <polygon points="112,80 122,88 122,80" fill="#0f766e" />
      {/* Labels */}
      <text x="20" y="42" fontSize="11" fontWeight="700" fill="#0f766e">B</text>
      <text x="180" y="10" fontSize="11" fontWeight="700" fill="#0f766e">C</text>
      <text x="180" y="98" fontSize="11" fontWeight="700" fill="#0f766e">E</text>
    </svg>
  )
}

function IcArt() {
  return (
    <svg viewBox="0 0 200 120" className="h-auto w-full max-w-xs">
      {/* Chip body */}
      <rect x="30" y="30" width="140" height="60" rx="4" fill="#111827" stroke="#000" strokeWidth="1" />
      {/* Notch */}
      <circle cx="42" cy="42" r="4" fill="none" stroke="#f4f4f5" strokeWidth="1" />
      {/* Pins (8) */}
      {[0, 1, 2, 3].map((i) => (
        <g key={`t${i}`}>
          <rect x={50 + i * 28} y={15} width={10} height={16} rx="2" fill="#9ca3af" />
        </g>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <g key={`b${i}`}>
          <rect x={50 + i * 28} y={89} width={10} height={16} rx="2" fill="#9ca3af" />
        </g>
      ))}
      <text x="100" y="66" textAnchor="middle" fontSize="16" fontWeight="800" fill="#f4f4f5" fontFamily="monospace">
        LM555
      </text>
    </svg>
  )
}

function BatteryArt() {
  return (
    <svg viewBox="0 0 200 80" className="h-auto w-full max-w-xs">
      <line x1="0" y1="40" x2="70" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      {/* Long line = + */}
      <line x1="80" y1="15" x2="80" y2="65" stroke="#1b2740" strokeWidth="5" />
      {/* Short line = − */}
      <line x1="95" y1="25" x2="95" y2="55" stroke="#1b2740" strokeWidth="5" />
      {/* Long line = + */}
      <line x1="110" y1="15" x2="110" y2="65" stroke="#1b2740" strokeWidth="5" />
      {/* Short line = − */}
      <line x1="125" y1="25" x2="125" y2="55" stroke="#1b2740" strokeWidth="5" />
      <line x1="130" y1="40" x2="200" y2="40" stroke="#a1a1aa" strokeWidth="3" />
      <text x="72" y="10" fontSize="14" fontWeight="800" fill="#f2bc2e">+</text>
      <text x="123" y="10" fontSize="14" fontWeight="800" fill="#71717a">−</text>
    </svg>
  )
}

const ART: Record<string, (props: { on?: boolean }) => React.JSX.Element> = {
  resistor:   () => <ResistorArt />,
  capacitor:  () => <CapacitorArt />,
  inductor:   () => <InductorArt />,
  diode:      () => <DiodeArt />,
  led:        (p) => <LedArt on={!!p.on} />,
  transistor: () => <TransistorArt />,
  ic:         () => <IcArt />,
  battery:    () => <BatteryArt />,
}

export function ComponentsLesson() {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<string>('resistor')
  const [ledOn, setLedOn] = useState(true)
  const Art = ART[selected]

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.components.title')} />
        <Prose>
          <p>{t('learn.lessons.components.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          {/* Component chips */}
          <div className="flex flex-wrap gap-1.5">
            {COMPS.map((c) => {
              const active = c.id === selected
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all touch-manipulation min-h-[36px] ${
                    active
                      ? 'text-white shadow-sm'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                  style={active ? { background: c.color } : undefined}
                >
                  <span className="font-mono text-sm">{c.emoji}</span>
                  {t(`learn.lessons.components.items.${c.id}.name`)}
                </button>
              )
            })}
          </div>

          {/* Selected component art */}
          <div className="mt-6 rounded-xl bg-white p-6 shadow-inner dark:bg-zinc-900">
            <Art on={ledOn} />
          </div>

          {selected === 'led' && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setLedOn((v) => !v)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors touch-manipulation min-h-[40px] ${
                  ledOn
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200'
                }`}
              >
                {ledOn ? t('learn.lessons.components.turnOff') : t('learn.lessons.components.turnOn')}
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
            <h3 className="mb-2 text-sm font-semibold text-blue-900 dark:text-blue-200">
              {t(`learn.lessons.components.items.${selected}.name`)}
            </h3>
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {t(`learn.lessons.components.items.${selected}.description`)}
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold">{t('learn.lessons.components.usedFor')}:</span>{' '}
              {t(`learn.lessons.components.items.${selected}.usedFor`)}
            </p>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.components.point1'),
            t('learn.lessons.components.point2'),
            t('learn.lessons.components.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
