'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

/**
 * Earth + RCD safety lesson — user drags a "leakage current" slider,
 * the RCD trips once it exceeds the 30 mA threshold. Shows the current
 * path through the person with and without earth wire.
 */
export function RcdEarthLesson() {
  const { t } = useTranslation()
  const [leakage, setLeakage] = useState(0)        // mA
  const [hasEarth, setHasEarth] = useState(true)

  const rcdThreshold = 30       // mA — standard RCD trip
  const rcdTripped = leakage > rcdThreshold
  // Without earth wire, all leakage flows through the person → dangerous.
  // With earth wire, current is diverted to ground and the RCD trips fast.
  const dangerToPerson = leakage > 10 && !hasEarth && !rcdTripped
  const safe = rcdTripped || leakage <= 10

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.rcd_earth.title')} />
        <Prose>
          <p>{t('learn.lessons.rcd_earth.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="inline-flex cursor-pointer select-none items-center gap-2">
              <input
                type="checkbox"
                checked={hasEarth}
                onChange={(e) => setHasEarth(e.target.checked)}
                className="h-5 w-5 accent-green-600"
              />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('learn.lessons.rcd_earth.earthConnected')}
              </span>
            </label>
          </div>

          <LabelSlider
            label={t('learn.lessons.rcd_earth.leakage')}
            unit="mA"
            value={leakage}
            min={0}
            max={100}
            step={1}
            onChange={setLeakage}
          />

          {/* Diagram */}
          <div className="mt-4 flex justify-center">
            <svg viewBox="0 0 480 240" className="h-auto w-full max-w-2xl">
              {/* Wall socket */}
              <rect x="20" y="90" width="80" height="60" rx="6" fill="#e5e7eb" stroke="#71717a" strokeWidth="1" />
              <circle cx="45" cy="115" r="4" fill="#1b2740" />
              <circle cx="75" cy="115" r="4" fill="#1b2740" />
              <rect x="52" y="135" width="16" height="3" fill="#22c55e" />
              <text x="60" y="80" textAnchor="middle" fontSize="10" fontWeight="700" fill="#71717a">SOCKET</text>

              {/* Live wire from socket to appliance */}
              <line x1="100" y1="115" x2="200" y2="115" stroke="#ef4444" strokeWidth="3" />
              {/* Neutral */}
              <line x1="100" y1="130" x2="200" y2="130" stroke="#3b82f6" strokeWidth="3" />

              {/* Appliance (fridge/heater) */}
              <rect x="200" y="80" width="90" height="100" rx="6" fill="#f4f4f5" stroke="#71717a" strokeWidth="1.5" />
              <text x="245" y="120" textAnchor="middle" fontSize="14" fontWeight="800" fill="#374151">🔌</text>
              <text x="245" y="145" textAnchor="middle" fontSize="10" fontWeight="700" fill="#71717a">APPLIANCE</text>

              {/* Fault: internal leakage — arrow from live to case */}
              {leakage > 0 && (
                <>
                  <path
                    d="M 210 115 Q 220 105 235 105"
                    stroke="#eab308"
                    strokeWidth={Math.max(1, leakage / 15)}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="4 3"
                  >
                    <animate attributeName="stroke-dashoffset" values="0;-14" dur="0.6s" repeatCount="indefinite" />
                  </path>
                  <text x="230" y="98" fontSize="9" fill="#a16207">{leakage}mA</text>
                </>
              )}

              {/* Earth wire — appliance to ground */}
              {hasEarth ? (
                <>
                  <line x1="245" y1="180" x2="245" y2="220" stroke="#facc15" strokeWidth="4" />
                  <path d="M 235 220 L 255 220 M 238 225 L 252 225 M 241 230 L 249 230" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
                  {/* Green stripe indicating current-carrying earth */}
                  {leakage > 0 && !rcdTripped && (
                    <line x1="245" y1="180" x2="245" y2="220" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3">
                      <animate attributeName="stroke-dashoffset" values="0;-12" dur="0.4s" repeatCount="indefinite" />
                    </line>
                  )}
                </>
              ) : (
                <text x="245" y="200" textAnchor="middle" fontSize="20" fill="#ef4444">⚠</text>
              )}

              {/* Person */}
              <g transform="translate(340, 100)">
                <circle cx="0" cy="0" r="14" fill={dangerToPerson ? '#ef4444' : '#fbbf24'} stroke="#78350f" strokeWidth="1" />
                <rect x="-10" y="14" width="20" height="35" rx="5" fill={dangerToPerson ? '#ef4444' : '#fbbf24'} />
                <line x1="0" y1="49" x2="-8" y2="80" stroke={dangerToPerson ? '#ef4444' : '#fbbf24'} strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="49" x2="8" y2="80" stroke={dangerToPerson ? '#ef4444' : '#fbbf24'} strokeWidth="4" strokeLinecap="round" />
                {/* Touching appliance */}
                <line x1="-15" y1="25" x2="-40" y2="15" stroke={dangerToPerson ? '#ef4444' : '#fbbf24'} strokeWidth="4" strokeLinecap="round" />
                {dangerToPerson && (
                  <text x="0" y="-24" textAnchor="middle" fontSize="20" fill="#ef4444">
                    ⚡
                    <animate attributeName="opacity" values="1;0.3;1" dur="0.4s" repeatCount="indefinite" />
                  </text>
                )}
              </g>

              {/* Ground line */}
              <line x1="0" y1="230" x2="480" y2="230" stroke="#a1a1aa" strokeWidth="2" />
              <line x1="340" y1="180" x2="340" y2="230" stroke="#a1a1aa" strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />

              {/* RCD status */}
              <rect x="380" y="20" width="90" height="60" rx="6" fill={rcdTripped ? '#dc2626' : '#22c55e'} />
              <text x="425" y="45" textAnchor="middle" fontSize="10" fontWeight="800" fill="#ffffff">RCD 30 mA</text>
              <text x="425" y="65" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">
                {rcdTripped ? t('learn.lessons.rcd_earth.tripped') : t('learn.lessons.rcd_earth.ok')}
              </text>
            </svg>
          </div>

          {/* Status */}
          <div className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
            dangerToPerson
              ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
              : rcdTripped
                ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
                : safe
                  ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200'
                  : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
          }`}>
            {dangerToPerson
              ? t('learn.lessons.rcd_earth.danger')
              : rcdTripped
                ? t('learn.lessons.rcd_earth.rcdSaved')
                : t('learn.lessons.rcd_earth.safeState')}
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.rcd_earth.point1'),
            t('learn.lessons.rcd_earth.point2'),
            t('learn.lessons.rcd_earth.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
