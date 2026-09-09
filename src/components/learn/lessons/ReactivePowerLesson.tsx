'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

export function ReactivePowerLesson() {
  const { t } = useTranslation()
  const [P, setP] = useState(3000)    // W (active)
  const [pf, setPf] = useState(0.7)   // cos φ

  const { S, Q, phi, V } = useMemo(() => {
    const phi = Math.acos(pf)
    const S = P / pf
    const Q = S * Math.sin(phi)
    return { S, Q, phi, V: 230 }
  }, [P, pf])
  const currentA = S / V

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.reactive_power.title')} />
        <Prose>
          <p>{t('learn.lessons.reactive_power.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.reactive_power.p')} unit="W" value={P} min={100} max={10000} step={100} onChange={setP} />
            <LabelSlider label={t('learn.lessons.reactive_power.pf')} value={pf} min={0.3} max={1} step={0.01} onChange={setPf} />
          </div>

          {/* Power triangle */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 400 240" className="h-auto w-full">
              {(() => {
                // Scale S to a fixed hypotenuse length; the triangle grows/shrinks
                // in angle only so the visual stays legible.
                const originX = 60, originY = 200
                const hyp = 260
                const px = originX + hyp * Math.cos(phi)
                const py = originY - hyp * Math.sin(phi)
                return (
                  <>
                    {/* Horizontal (P) */}
                    <line x1={originX} y1={originY} x2={originX + hyp * Math.cos(phi)} y2={originY} stroke="#22c55e" strokeWidth={4} />
                    <text x={originX + hyp * Math.cos(phi) / 2} y={originY + 16} textAnchor="middle" fontSize={11} fontWeight={700} fill="#22c55e">
                      P = {P.toFixed(0)} W
                    </text>
                    {/* Vertical (Q) */}
                    <line x1={px} y1={originY} x2={px} y2={py} stroke="#f59e0b" strokeWidth={4} />
                    <text x={px + 8} y={(originY + py) / 2} fontSize={11} fontWeight={700} fill="#f59e0b">
                      Q = {Q.toFixed(0)} VAR
                    </text>
                    {/* Hypotenuse (S) */}
                    <line x1={originX} y1={originY} x2={px} y2={py} stroke="#3b82f6" strokeWidth={4} />
                    <text
                      x={(originX + px) / 2 - 30}
                      y={(originY + py) / 2 - 8}
                      fontSize={11} fontWeight={700} fill="#3b82f6"
                    >
                      S = {S.toFixed(0)} VA
                    </text>
                    {/* Angle arc */}
                    <path
                      d={`M ${originX + 40} ${originY} A 40 40 0 0 0 ${originX + 40 * Math.cos(phi)} ${originY - 40 * Math.sin(phi)}`}
                      fill="none" stroke="#71717a" strokeWidth={1.4}
                    />
                    <text x={originX + 50} y={originY - 12} fontSize={11} fontWeight={700} fill="#71717a">
                      φ = {(phi * 180 / Math.PI).toFixed(1)}°
                    </text>
                  </>
                )
              })()}
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Tile label="cos φ"                             value={pf.toFixed(2)}                    tone="blue" />
            <Tile label={t('learn.lessons.reactive_power.currentAt230')} value={`${currentA.toFixed(1)} A`}      tone="amber" />
            <Tile label={t('learn.lessons.reactive_power.wastedI2R')}    value={`${(currentA * currentA * 0.02).toFixed(1)} W/m`} tone="red" />
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.reactive_power.point1'),
            t('learn.lessons.reactive_power.point2'),
            t('learn.lessons.reactive_power.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Tile({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'amber' | 'red' }) {
  const bg = tone === 'blue' ? 'from-blue-500 to-blue-700' : tone === 'amber' ? 'from-amber-500 to-amber-700' : 'from-red-500 to-red-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
