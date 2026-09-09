'use client'

import type { ReactNode } from 'react'

export function LessonCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/70 sm:p-6">
      {children}
    </section>
  )
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-5">
      <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>}
    </header>
  )
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">
      {children}
    </div>
  )
}

export function KeyPoints({ points }: { points: string[] }) {
  return (
    <ul className="space-y-2">
      {points.map((p, i) => (
        <li key={i} className="flex items-start gap-2 rounded-lg bg-blue-50/60 p-3 dark:bg-blue-950/30">
          <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm text-zinc-700 dark:text-zinc-200">{p}</span>
        </li>
      ))}
    </ul>
  )
}

export function Playground({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-blue-300 bg-gradient-to-b from-blue-50 to-white p-4 dark:border-blue-800 dark:from-blue-950/40 dark:to-zinc-900 sm:p-6">
      {children}
    </div>
  )
}

/** Range slider with numeric label. */
export function LabelSlider({
  label, unit, value, min, max, step = 1, onChange,
}: {
  label: string
  unit?: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400">
          {value}{unit && ` ${unit}`}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-blue-600 dark:bg-zinc-700"
      />
    </div>
  )
}
