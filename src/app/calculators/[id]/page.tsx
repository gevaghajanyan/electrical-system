import { notFound } from 'next/navigation'
import { CALCULATORS } from '@/components/calculators/registry'
import { CalculatorDetail } from '@/components/calculators/CalculatorDetail'

/** Prerender one HTML file per calculator ID for `output: 'export'`. */
export function generateStaticParams() {
  return CALCULATORS.map((c) => ({ id: c.id }))
}

export const dynamicParams = false

export default async function CalculatorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const idx = CALCULATORS.findIndex((c) => c.id === id)
  if (idx === -1) notFound()

  const current = CALCULATORS[idx]
  const prev = idx > 0 ? CALCULATORS[idx - 1] : null
  const next = idx < CALCULATORS.length - 1 ? CALCULATORS[idx + 1] : null

  return (
    <CalculatorDetail
      currentId={current.id}
      prevId={prev?.id ?? null}
      nextId={next?.id ?? null}
    />
  )
}
