'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

/**
 * "What is electricity?" — an animated wire with electrons that speed up
 * when the user raises the driving voltage.
 */
export function ElectricityIntroLesson() {
  const { t } = useTranslation()
  const [voltage, setVoltage] = useState(6)
  const [electrons, setElectrons] = useState<number[]>(() => Array.from({ length: 8 }, (_, i) => i * 60))
  const rafRef = useRef<number | null>(null)

  // Animate electrons — speed scales with voltage.
  useEffect(() => {
    let last = performance.now()
    function tick(now: number) {
      const dt = Math.min(64, now - last)
      last = now
      const speed = 0.02 + voltage * 0.008  // px per ms
      setElectrons((prev) => prev.map((x) => (x + speed * dt) % 480))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [voltage])

  // Bulb brightness (0..1) as a fraction of voltage.
  const brightness = Math.min(1, voltage / 12)

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.electricity_intro.title')} />
        <Prose>
          <p>{t('learn.lessons.electricity_intro.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="space-y-4">
            <LabelSlider
              label={t('learn.lessons.electricity_intro.sliderVoltage')}
              unit="V"
              value={voltage}
              min={0}
              max={12}
              onChange={setVoltage}
            />

            <svg viewBox="0 0 520 200" className="mx-auto h-auto w-full max-w-2xl">
              <defs>
                <radialGradient id="bulb-glow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stopColor="#fde68a" stopOpacity={brightness} />
                  <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="wire" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#a1a1aa" />
                  <stop offset="0.5" stopColor="#e4e4e7" />
                  <stop offset="1" stopColor="#a1a1aa" />
                </linearGradient>
              </defs>

              {/* Battery — left */}
              <g>
                <rect x="30" y="70" width="60" height="60" rx="4" fill="#1b2740" />
                <text x="60" y="105" textAnchor="middle" fontSize="18" fontWeight="800" fill="#f2bc2e">
                  {voltage}V
                </text>
                <text x="60" y="150" textAnchor="middle" fontSize="10" fontWeight="600" fill="#71717a">BATTERY</text>
                {/* Terminals */}
                <rect x="88" y="90" width="4" height="20" fill="#f2bc2e" />
                <text x="98" y="105" fontSize="12" fontWeight="700" fill="#f2bc2e">+</text>
                <rect x="28" y="90" width="4" height="20" fill="#a1a1aa" />
                <text x="18" y="105" fontSize="12" fontWeight="700" fill="#71717a">−</text>
              </g>

              {/* Bulb glow (background) */}
              <circle cx="430" cy="100" r="60" fill="url(#bulb-glow)" />

              {/* Wire (top half) — battery → bulb */}
              <path
                d="M 92 100 L 380 100"
                stroke="url(#wire)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />

              {/* Bulb */}
              <circle cx="430" cy="100" r="26" fill={brightness > 0.05 ? '#fde68a' : '#e4e4e7'} stroke="#71717a" strokeWidth="1.5" />
              <path d="M 420 90 Q 430 108 440 90" stroke="#78350f" strokeWidth="1.8" fill="none" opacity={brightness > 0.05 ? 1 : 0.4} />
              <rect x="422" y="122" width="16" height="8" fill="#71717a" />
              <rect x="425" y="130" width="10" height="4" fill="#52525b" />

              {/* Return wire (bottom half) */}
              <path
                d="M 430 138 L 430 170 L 60 170 L 60 130"
                stroke="url(#wire)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
              />

              {/* Electrons on the top wire */}
              {electrons.map((x, i) => (
                <circle
                  key={i}
                  cx={92 + (x % 288)}
                  cy={100}
                  r={4}
                  fill="#3b82f6"
                  opacity={brightness > 0.02 ? 1 : 0.3}
                >
                  <animate attributeName="opacity" values="1;0.6;1" dur="1s" repeatCount="indefinite" />
                </circle>
              ))}
            </svg>

            <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              {t('learn.lessons.electricity_intro.watch')}
            </p>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.electricity_intro.point1'),
            t('learn.lessons.electricity_intro.point2'),
            t('learn.lessons.electricity_intro.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
