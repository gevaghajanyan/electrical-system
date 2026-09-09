'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Answer = 'yes' | 'no'
type StepId =
  | 'start' | 'q_immediately' | 'q_hot_wire' | 'q_after_appliance'
  | 'q_rcd_only' | 'q_after_storm'
  | 'r_short' | 'r_overload' | 'r_leakage' | 'r_surge_damage' | 'r_nuisance'

interface Step {
  id: StepId
  kind: 'question' | 'result'
  q?: string
  yes?: StepId
  no?: StepId
  result?: string
  tone?: 'red' | 'amber' | 'green'
}

const STEPS: Record<StepId, Step> = {
  start: {
    id: 'start', kind: 'question',
    q: 'q_immediately',
    yes: 'q_hot_wire',
    no: 'q_after_appliance',
  },
  q_immediately: { id: 'q_immediately', kind: 'question', q: 'q_immediately', yes: 'q_hot_wire', no: 'q_after_appliance' },
  q_hot_wire: {
    id: 'q_hot_wire', kind: 'question',
    q: 'q_hot_wire',
    yes: 'r_short',
    no: 'q_rcd_only',
  },
  q_after_appliance: {
    id: 'q_after_appliance', kind: 'question',
    q: 'q_after_appliance',
    yes: 'r_overload',
    no: 'q_after_storm',
  },
  q_rcd_only: {
    id: 'q_rcd_only', kind: 'question',
    q: 'q_rcd_only',
    yes: 'r_leakage',
    no: 'r_nuisance',
  },
  q_after_storm: {
    id: 'q_after_storm', kind: 'question',
    q: 'q_after_storm',
    yes: 'r_surge_damage',
    no: 'r_nuisance',
  },
  r_short:        { id: 'r_short',        kind: 'result', result: 'r_short',        tone: 'red'   },
  r_overload:     { id: 'r_overload',     kind: 'result', result: 'r_overload',     tone: 'amber' },
  r_leakage:      { id: 'r_leakage',      kind: 'result', result: 'r_leakage',      tone: 'amber' },
  r_surge_damage: { id: 'r_surge_damage', kind: 'result', result: 'r_surge_damage', tone: 'red'   },
  r_nuisance:     { id: 'r_nuisance',     kind: 'result', result: 'r_nuisance',     tone: 'green' },
}

export function FaultTreeLesson() {
  const { t } = useTranslation()
  const [cursor, setCursor] = useState<StepId>('start')
  const [history, setHistory] = useState<StepId[]>([])

  const step = STEPS[cursor]

  function answer(a: Answer) {
    if (step.kind !== 'question') return
    const next = a === 'yes' ? step.yes : step.no
    if (!next) return
    setHistory((h) => [...h, cursor])
    setCursor(next)
  }
  function reset() {
    setCursor('start')
    setHistory([])
  }
  function back() {
    setHistory((h) => {
      const prev = h[h.length - 1]
      if (prev) setCursor(prev)
      return h.slice(0, -1)
    })
  }

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.fault_tree.title')} />
        <Prose>
          <p>{t('learn.lessons.fault_tree.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          {step.kind === 'question' ? (
            <div>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {t(`learn.lessons.fault_tree.questions.${step.q!}`)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => answer('yes')}
                  className="min-h-[48px] rounded-xl bg-green-600 text-sm font-semibold text-white shadow-sm hover:bg-green-700 touch-manipulation"
                >
                  {t('learn.lessons.fault_tree.yes')}
                </button>
                <button
                  type="button"
                  onClick={() => answer('no')}
                  className="min-h-[48px] rounded-xl bg-zinc-200 text-sm font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-100 touch-manipulation"
                >
                  {t('learn.lessons.fault_tree.no')}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                {t('learn.lessons.fault_tree.diagnosis')}
              </p>
              <p className={`mt-1 text-base font-semibold ${
                step.tone === 'red' ? 'text-red-700 dark:text-red-300'
                : step.tone === 'amber' ? 'text-amber-700 dark:text-amber-300'
                : 'text-green-700 dark:text-green-300'
              }`}>
                {t(`learn.lessons.fault_tree.results.${step.result!}.title`)}
              </p>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-200">
                {t(`learn.lessons.fault_tree.results.${step.result!}.desc`)}
              </p>
              <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
                <span className="font-semibold">{t('learn.lessons.fault_tree.action')}: </span>
                {t(`learn.lessons.fault_tree.results.${step.result!}.action`)}
              </p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={back}
              disabled={history.length === 0}
              className="inline-flex min-h-[40px] items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 touch-manipulation"
            >
              ← {t('learn.lessons.fault_tree.back')}
            </button>
            <button
              type="button"
              onClick={reset}
              className="ml-auto inline-flex min-h-[40px] items-center gap-1 rounded-md border border-zinc-300 bg-white px-3 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 touch-manipulation"
            >
              {t('learn.lessons.fault_tree.restart')}
            </button>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.fault_tree.point1'),
            t('learn.lessons.fault_tree.point2'),
            t('learn.lessons.fault_tree.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}
