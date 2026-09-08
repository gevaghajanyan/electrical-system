'use client'

import type { ReactNode } from 'react'
import { Label } from '@/components/ui/Label'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

/** Rounds to N decimals then drops trailing zeros. */
export function fmt(n: number, digits = 2): string {
  if (!isFinite(n)) return '—'
  const rounded = Math.round(n * 10 ** digits) / 10 ** digits
  return rounded.toString()
}

export function CalcCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/70">
      {children}
    </div>
  )
}

export function CalcHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-5">
      <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
    </header>
  )
}

export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}

export function Field({
  id, label, value, onChange, unit, type = 'number', min, max, step, hint,
}: {
  id: string
  label: string
  value: number | string
  onChange: (v: string) => void
  unit?: string
  type?: 'number' | 'text'
  min?: number
  max?: number
  step?: number
  hint?: string
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-stretch gap-0">
        <Input
          id={id}
          type={type}
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          className={unit ? 'rounded-r-none' : ''}
        />
        {unit && (
          <span className="inline-flex items-center rounded-r-md border border-l-0 border-zinc-300 bg-zinc-100 px-3 text-xs font-medium text-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
            {unit}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-zinc-400">{hint}</p>}
    </div>
  )
}

export function SelectField<T extends string | number>({
  id, label, value, onChange, options,
}: {
  id: string
  label: string
  value: T
  onChange: (v: string) => void
  options: Array<{ value: T; label: string }>
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={String(o.value)} value={o.value}>{o.label}</option>
        ))}
      </Select>
    </div>
  )
}

export function ResultBig({ label, value, unit, tone = 'brand' }: {
  label: string
  value: string
  unit?: string
  tone?: 'brand' | 'success' | 'warning' | 'danger'
}) {
  const toneClasses: Record<typeof tone, string> = {
    brand: 'from-blue-500 to-blue-700',
    success: 'from-green-500 to-green-700',
    warning: 'from-amber-500 to-amber-700',
    danger: 'from-red-500 to-red-700',
  }
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${toneClasses[tone]} p-5 text-white shadow-md`}>
      <p className="text-xs font-medium uppercase tracking-widest text-white/80">{label}</p>
      <p className="mt-1 text-4xl font-bold tabular-nums leading-tight">
        {value}
        {unit && <span className="ml-2 text-xl font-medium text-white/90">{unit}</span>}
      </p>
    </div>
  )
}

export function ResultRow({ label, value, unit, tone = 'default' }: {
  label: string
  value: string
  unit?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const toneClasses: Record<typeof tone, string> = {
    default: 'text-zinc-800 dark:text-zinc-100',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  }
  return (
    <div className="flex items-baseline justify-between border-b border-zinc-100 py-2 last:border-b-0 dark:border-zinc-700/60">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`font-semibold tabular-nums ${toneClasses[tone]}`}>
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-zinc-500">{unit}</span>}
      </span>
    </div>
  )
}

export function Formula({ children }: { children: ReactNode }) {
  return (
    <code className="rounded bg-zinc-100 px-2 py-1 font-mono text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {children}
    </code>
  )
}
