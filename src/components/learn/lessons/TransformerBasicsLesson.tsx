'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground, LabelSlider } from '../shared'

/**
 * Transformer voltage / current ratio playground. Turns ratio a = Np/Ns drives:
 *   Vs = Vp / a,  Is = Ip * a  (ideal, lossless)
 */
export function TransformerBasicsLesson() {
  const { t } = useTranslation()
  const [Vp, setVp] = useState(230)
  const [Np, setNp] = useState(1000)
  const [Ns, setNs] = useState(50)
  const [Ip, setIp] = useState(0.5)

  const a = Np / Math.max(1, Ns)
  const Vs = Vp / a
  const Is = Ip * a
  const Pp = Vp * Ip
  const Ps = Vs * Is

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.transformer_basics.title')} />
        <Prose>
          <p>{t('learn.lessons.transformer_basics.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <LabelSlider label={t('learn.lessons.transformer_basics.vp')} unit="V" value={Vp} min={12} max={400} step={1} onChange={setVp} />
            <LabelSlider label={t('learn.lessons.transformer_basics.ip')} unit="A" value={Ip} min={0.1} max={10} step={0.1} onChange={setIp} />
            <LabelSlider label={t('learn.lessons.transformer_basics.np')} value={Np} min={50} max={5000} step={10} onChange={setNp} />
            <LabelSlider label={t('learn.lessons.transformer_basics.ns')} value={Ns} min={5}  max={5000} step={5}  onChange={setNs} />
          </div>

          {/* Live equation card */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label={t('learn.lessons.transformer_basics.ratio')} value={`${a.toFixed(2)} : 1`} tone="blue" />
            <Metric label={t('learn.lessons.transformer_basics.vs')}    value={`${Vs.toFixed(1)} V`}  tone="green" />
            <Metric label={t('learn.lessons.transformer_basics.is')}    value={`${Is.toFixed(2)} A`} tone="amber" />
          </div>

          {/* Transformer diagram */}
          <div className="mt-4 rounded-xl bg-white p-4 shadow-inner dark:bg-zinc-900">
            <svg viewBox="0 0 400 160" className="h-auto w-full">
              {/* Primary side */}
              <line x1={20}  y1={40}  x2={140} y2={40}  stroke="#dc2626" strokeWidth={2.2} />
              <line x1={20}  y1={120} x2={140} y2={120} stroke="#2563eb" strokeWidth={2.2} />
              <text x={16} y={36}  fontSize={11} fontWeight={700} fill="#dc2626">L1</text>
              <text x={16} y={135} fontSize={11} fontWeight={700} fill="#2563eb">N1</text>
              <text x={70} y={22}  fontSize={10} fill="#71717a">{t('learn.lessons.transformer_basics.primary')} — {Vp.toFixed(0)} V, {Ip.toFixed(2)} A</text>
              {/* Primary coil */}
              <path d="M 140 40 Q 130 80 140 120" stroke="#1b2740" strokeWidth={2} fill="none" />
              <path d="M 148 40 Q 138 80 148 120" stroke="#1b2740" strokeWidth={2} fill="none" />
              {/* Core */}
              <line x1={168} y1={30} x2={168} y2={130} stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 3" />
              <line x1={172} y1={30} x2={172} y2={130} stroke="#71717a" strokeWidth={1.5} strokeDasharray="4 3" />
              {/* Secondary coil */}
              <path d="M 200 40 Q 210 80 200 120" stroke="#1b2740" strokeWidth={2} fill="none" />
              <path d="M 192 40 Q 202 80 192 120" stroke="#1b2740" strokeWidth={2} fill="none" />
              {/* Secondary side */}
              <line x1={200} y1={40}  x2={380} y2={40}  stroke="#dc2626" strokeWidth={2.2} />
              <line x1={200} y1={120} x2={380} y2={120} stroke="#2563eb" strokeWidth={2.2} />
              <text x={356} y={36}  fontSize={11} fontWeight={700} fill="#dc2626">L2</text>
              <text x={356} y={135} fontSize={11} fontWeight={700} fill="#2563eb">N2</text>
              <text x={230} y={22}  fontSize={10} fill="#71717a">{t('learn.lessons.transformer_basics.secondary')} — {Vs.toFixed(1)} V, {Is.toFixed(2)} A</text>
              {/* Turns label */}
              <text x={148} y={155} fontSize={9}  fill="#71717a">Np = {Np}</text>
              <text x={186} y={155} fontSize={9}  fill="#71717a">Ns = {Ns}</text>
            </svg>
          </div>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {t('learn.lessons.transformer_basics.powerBalance', { pp: Pp.toFixed(1), ps: Ps.toFixed(1) })}
          </p>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.transformer_basics.point1'),
            t('learn.lessons.transformer_basics.point2'),
            t('learn.lessons.transformer_basics.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'green' | 'amber' }) {
  const bg = tone === 'blue' ? 'from-blue-500 to-blue-700' : tone === 'green' ? 'from-green-500 to-green-700' : 'from-amber-500 to-amber-700'
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-4 text-center text-white shadow-md`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 font-mono text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
