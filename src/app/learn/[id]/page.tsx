import { notFound } from 'next/navigation'
import { LESSONS } from '@/components/learn/registry'
import { LessonDetail } from '@/components/learn/LessonDetail'

export function generateStaticParams() {
  return LESSONS.map((l) => ({ id: l.id }))
}

export const dynamicParams = false

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const idx = LESSONS.findIndex((l) => l.id === id)
  if (idx === -1) notFound()
  const current = LESSONS[idx]
  const prev = idx > 0 ? LESSONS[idx - 1] : null
  const next = idx < LESSONS.length - 1 ? LESSONS[idx + 1] : null

  return (
    <LessonDetail
      currentId={current.id}
      prevId={prev?.id ?? null}
      nextId={next?.id ?? null}
    />
  )
}
