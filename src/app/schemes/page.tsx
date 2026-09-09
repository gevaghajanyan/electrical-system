'use client'

import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { schemeStore } from '@/lib/store/schemeStore'
import { useSchemeStore } from '@/lib/hooks/useSchemeStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { Scheme, SchemeNodeType } from '@/lib/types/scheme'

// ─── Template registry ─────────────────────────────────────────────────────
interface SchemeTemplate {
  id: string
  i18nKey: string
  nodes: Array<{ type: SchemeNodeType; x: number; y: number; label: string }>
  wires: Array<{ fromNodeIndex: number; fromPortIndex: number; toNodeIndex: number; toPortIndex: number }>
}

const SCHEME_TEMPLATES: SchemeTemplate[] = [
  {
    id: 'tpl_switch_lamp',
    i18nKey: 'single_switch_lamp',
    nodes: [
      { type: 'power_ac',    x: 96,  y: 96,  label: 'AC Power' },
      { type: 'switch_spst', x: 288, y: 120, label: 'Switch' },
      { type: 'lamp_230',    x: 480, y: 96,  label: 'Lamp' },
    ],
    wires: [
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 1, toNodeIndex: 2, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 2, toPortIndex: 1 },
    ],
  },
  {
    id: 'tpl_led_transformer',
    i18nKey: 'led_transformer',
    nodes: [
      { type: 'power_ac',       x: 96,  y: 96,  label: 'AC Power' },
      { type: 'transformer_sd', x: 288, y: 96,  label: 'Transformer' },
      { type: 'led_220',        x: 528, y: 120, label: 'LED' },
    ],
    wires: [
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 1, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 2, toNodeIndex: 2, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 2, toPortIndex: 1 },
    ],
  },
  {
    id: 'tpl_socket',
    i18nKey: 'socket',
    nodes: [
      { type: 'power_ac',      x: 96,  y: 96, label: 'AC Power' },
      { type: 'socket_outlet', x: 360, y: 96, label: 'Socket' },
    ],
    wires: [
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 1, toPortIndex: 1 },
      { fromNodeIndex: 0, fromPortIndex: 2, toNodeIndex: 1, toPortIndex: 2 },
    ],
  },
  {
    id: 'tpl_2way_switching',
    i18nKey: 'two_way_switching',
    nodes: [
      { type: 'power_ac',    x: 72,  y: 120, label: 'AC Power' },
      { type: 'switch_2way', x: 240, y: 96,  label: 'Switch 1' },
      { type: 'switch_2way', x: 432, y: 96,  label: 'Switch 2' },
      { type: 'lamp_230',    x: 624, y: 120, label: 'Lamp' },
    ],
    wires: [
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 1, toNodeIndex: 2, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 2, toNodeIndex: 2, toPortIndex: 2 },
      { fromNodeIndex: 2, fromPortIndex: 0, toNodeIndex: 3, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 3, toPortIndex: 1 },
    ],
  },
  // ─── 3-way (intermediate) switching ─────────────────────────────────────
  {
    id: 'tpl_3way_switching',
    i18nKey: 'three_way_switching',
    nodes: [
      { type: 'power_ac',           x: 48,  y: 144, label: 'AC Power' },
      { type: 'switch_2way',        x: 200, y: 120, label: 'Switch 1' },
      { type: 'switch_intermediate',x: 384, y: 120, label: 'Mid switch' },
      { type: 'switch_2way',        x: 560, y: 120, label: 'Switch 3' },
      { type: 'lamp_230',           x: 744, y: 144, label: 'Lamp' },
    ],
    wires: [
      // L: AC → switch_2way(1).C → mid.A1/A2 → mid.B1/B2 → switch_2way(3).A/B → switch_2way(3).C → lamp.L
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 1, toNodeIndex: 2, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 2, toNodeIndex: 2, toPortIndex: 1 },
      { fromNodeIndex: 2, fromPortIndex: 2, toNodeIndex: 3, toPortIndex: 1 },
      { fromNodeIndex: 2, fromPortIndex: 3, toNodeIndex: 3, toPortIndex: 2 },
      { fromNodeIndex: 3, fromPortIndex: 0, toNodeIndex: 4, toPortIndex: 0 },
      // N return
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 4, toPortIndex: 1 },
    ],
  },
  // ─── DOL motor starter — 3-phase ────────────────────────────────────────
  {
    id: 'tpl_dol_motor',
    i18nKey: 'dol_motor_start',
    nodes: [
      { type: 'power_ac',    x: 48,  y: 40,  label: 'L1 L2 L3' },
      { type: 'contactor',   x: 240, y: 120, label: 'KM1' },
      { type: 'overload',    x: 240, y: 288, label: 'F1' },
      { type: 'motor',       x: 264, y: 432, label: 'M ~' },
      // Coil-side control column
      { type: 'push_button', x: 480, y: 96,  label: 'Stop' },
      { type: 'push_button', x: 480, y: 200, label: 'Start' },
    ],
    wires: [
      // Main power: AC (L1/L2/L3 = port 0,1,2) → contactor top L1/L2/L3
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 1, toPortIndex: 1 },
      { fromNodeIndex: 0, fromPortIndex: 2, toNodeIndex: 1, toPortIndex: 2 },
      // Contactor bottom (T1/T2/T3 = ports 3,4,5) → overload top (L1/L2/L3 = ports 0,1,2)
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 2, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 4, toNodeIndex: 2, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 5, toNodeIndex: 2, toPortIndex: 2 },
      // Overload bottom (T1/T2/T3 = ports 3,4,5) → motor L / N / PE (0, 1, 2)
      { fromNodeIndex: 2, fromPortIndex: 3, toNodeIndex: 3, toPortIndex: 0 },
      { fromNodeIndex: 2, fromPortIndex: 4, toNodeIndex: 3, toPortIndex: 1 },
      { fromNodeIndex: 2, fromPortIndex: 5, toNodeIndex: 3, toPortIndex: 2 },
      // Control coil loop: L1 → Stop NC → Start NO → KM coil A1, A2 → overload 96 → N (AC port 1)
      // Contactor coil is ports 6 (A1), 7 (A2). Simplified: Stop (port 0→1) → Start (0→1) → A1
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 4, toPortIndex: 0 },
      { fromNodeIndex: 4, fromPortIndex: 1, toNodeIndex: 5, toPortIndex: 0 },
      { fromNodeIndex: 5, fromPortIndex: 1, toNodeIndex: 1, toPortIndex: 6 },
      // Coil return: A2 → overload NC 95 → 96 → N
      { fromNodeIndex: 1, fromPortIndex: 7, toNodeIndex: 2, toPortIndex: 6 },
    ],
  },
  // ─── RCD + MCB group (consumer unit style) ──────────────────────────────
  {
    id: 'tpl_rcd_mcb_group',
    i18nKey: 'rcd_mcb_group',
    nodes: [
      { type: 'power_ac', x: 48,  y: 96,  label: 'Mains' },
      { type: 'rcd',      x: 240, y: 120, label: 'RCD 30 mA' },
      { type: 'mcb',      x: 456, y: 264, label: 'C1 lights' },
      { type: 'mcb',      x: 552, y: 264, label: 'C2 sockets' },
      { type: 'mcb',      x: 648, y: 264, label: 'C3 kitchen' },
      { type: 'lamp_230', x: 456, y: 408, label: 'Lights' },
      { type: 'socket_outlet', x: 552, y: 408, label: 'Sockets' },
      { type: 'socket_outlet', x: 648, y: 408, label: 'Kitchen' },
    ],
    wires: [
      // AC → RCD top L / N
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 1, toPortIndex: 1 },
      // RCD bottom L → each MCB top
      { fromNodeIndex: 1, fromPortIndex: 2, toNodeIndex: 2, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 2, toNodeIndex: 3, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 2, toNodeIndex: 4, toPortIndex: 0 },
      // MCB bottom → load L
      { fromNodeIndex: 2, fromPortIndex: 1, toNodeIndex: 5, toPortIndex: 0 },
      { fromNodeIndex: 3, fromPortIndex: 1, toNodeIndex: 6, toPortIndex: 0 },
      { fromNodeIndex: 4, fromPortIndex: 1, toNodeIndex: 7, toPortIndex: 0 },
      // Neutral return from RCD bottom N to each load N
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 5, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 6, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 7, toPortIndex: 1 },
      // PE for the two sockets (from AC PE = port 2)
      { fromNodeIndex: 0, fromPortIndex: 2, toNodeIndex: 6, toPortIndex: 2 },
      { fromNodeIndex: 0, fromPortIndex: 2, toNodeIndex: 7, toPortIndex: 2 },
    ],
  },
  // ─── Star-Delta motor starter ───────────────────────────────────────────
  {
    id: 'tpl_star_delta',
    i18nKey: 'star_delta_start',
    nodes: [
      { type: 'power_ac',  x: 48,  y: 40,  label: 'L1 L2 L3' },
      { type: 'contactor', x: 216, y: 120, label: 'KM1 Main' },
      { type: 'contactor', x: 432, y: 120, label: 'KM2 Star' },
      { type: 'contactor', x: 648, y: 120, label: 'KM3 Delta' },
      { type: 'motor',     x: 432, y: 336, label: 'M ~' },
    ],
    wires: [
      // Mains → KM1 top L1/L2/L3
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 1, toPortIndex: 1 },
      { fromNodeIndex: 0, fromPortIndex: 2, toNodeIndex: 1, toPortIndex: 2 },
      // KM1 bottom → motor U1/V1/W1 (motor ports 0/1/2 stand-in)
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 4, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 4, toNodeIndex: 4, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 5, toNodeIndex: 4, toPortIndex: 2 },
      // Star: KM2 shorts U2/V2/W2 together. In our simplified port model
      // we route KM2 tops from KM1 bottoms and KM2 bottoms all to motor PE
      // as the "neutral point" placeholder.
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 2, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 4, toNodeIndex: 2, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 5, toNodeIndex: 2, toPortIndex: 2 },
      { fromNodeIndex: 2, fromPortIndex: 3, toNodeIndex: 4, toPortIndex: 2 },
      { fromNodeIndex: 2, fromPortIndex: 4, toNodeIndex: 4, toPortIndex: 2 },
      { fromNodeIndex: 2, fromPortIndex: 5, toNodeIndex: 4, toPortIndex: 2 },
      // Delta: KM3 loops U2↔V1, V2↔W1, W2↔U1 (simplified — shares KM1's bottoms)
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 3, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 4, toNodeIndex: 3, toPortIndex: 1 },
      { fromNodeIndex: 1, fromPortIndex: 5, toNodeIndex: 3, toPortIndex: 2 },
    ],
  },
  // ─── Doorbell (transformer + button + bell) ─────────────────────────────
  {
    id: 'tpl_doorbell',
    i18nKey: 'doorbell',
    nodes: [
      { type: 'power_ac',       x: 48,  y: 96,  label: 'Mains 230V' },
      { type: 'transformer_sd', x: 240, y: 96,  label: '230→8V' },
      { type: 'push_button',    x: 480, y: 96,  label: 'Bell push' },
      { type: 'bell',           x: 648, y: 120, label: 'Bell' },
    ],
    wires: [
      // Primary: mains L/N → transformer L1/N1
      { fromNodeIndex: 0, fromPortIndex: 0, toNodeIndex: 1, toPortIndex: 0 },
      { fromNodeIndex: 0, fromPortIndex: 1, toNodeIndex: 1, toPortIndex: 1 },
      // Secondary low-voltage: L2 → push → bell+, N2 → bell−
      { fromNodeIndex: 1, fromPortIndex: 2, toNodeIndex: 2, toPortIndex: 0 },
      { fromNodeIndex: 2, fromPortIndex: 1, toNodeIndex: 3, toPortIndex: 0 },
      { fromNodeIndex: 1, fromPortIndex: 3, toNodeIndex: 3, toPortIndex: 1 },
    ],
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatRelative(iso: string, lang: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return lang.startsWith('ru') ? 'только что' : 'just now'
  if (minutes < 60) return lang.startsWith('ru') ? `${minutes} мин назад` : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return lang.startsWith('ru') ? `${hours} ч назад` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return lang.startsWith('ru') ? `${days} дн назад` : `${days}d ago`
  return new Date(iso).toLocaleDateString(lang.startsWith('ru') ? 'ru-RU' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ─── Template card (visual preview + click-to-use) ─────────────────────────
function TemplateCard({ template }: { template: SchemeTemplate }) {
  const router = useRouter()
  const { t } = useTranslation()
  const name = t(`schemes.templates.${template.i18nKey}.name`)
  const desc = t(`schemes.templates.${template.i18nKey}.description`)
  const nodeCount = template.nodes.length
  const wireCount = template.wires.length

  function handleUse() {
    const scheme = schemeStore.createScheme(name, desc)
    const created: Array<{ id: string }> = []
    for (const n of template.nodes) {
      const node = schemeStore.addNode(n.type, n.x, n.y)
      schemeStore.updateNode(node.id, { label: n.label })
      created.push(node)
    }
    for (const w of template.wires) {
      const from = created[w.fromNodeIndex]
      const to = created[w.toNodeIndex]
      if (from && to) schemeStore.addWire(from.id, w.fromPortIndex, to.id, w.toPortIndex)
    }
    router.push(`/schemes/edit?id=${scheme.id}`)
  }

  return (
    <button
      type="button"
      onClick={handleUse}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-500 min-h-[120px] touch-manipulation"
    >
      {/* Mini SVG diagram */}
      <div className="mb-3 flex h-16 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900/60">
        <TemplateThumbnail template={template} />
      </div>
      <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {name}
      </p>
      <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{desc}</p>
      <div className="mt-auto flex items-center gap-2 pt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
        <span>{t('schemes.templates.component', { count: nodeCount })}</span>
        <span>·</span>
        <span>{t('schemes.templates.wire', { count: wireCount })}</span>
      </div>
    </button>
  )
}

/**
 * Compact SVG thumbnail — dots for nodes, straight lines for wires,
 * bounding-box normalized so every template renders at the same size.
 */
function TemplateThumbnail({ template }: { template: SchemeTemplate }) {
  const { minX, minY, maxX, maxY } = template.nodes.reduce(
    (acc, n) => ({
      minX: Math.min(acc.minX, n.x),
      minY: Math.min(acc.minY, n.y),
      maxX: Math.max(acc.maxX, n.x),
      maxY: Math.max(acc.maxY, n.y),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  )
  const w = Math.max(1, maxX - minX + 40)
  const h = Math.max(1, maxY - minY + 40)
  const norm = (x: number, y: number) => ({ x: x - minX + 20, y: y - minY + 20 })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-auto" aria-hidden>
      {template.wires.map((wire, i) => {
        const from = norm(template.nodes[wire.fromNodeIndex].x, template.nodes[wire.fromNodeIndex].y)
        const to = norm(template.nodes[wire.toNodeIndex].x, template.nodes[wire.toNodeIndex].y)
        return (
          <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                stroke="var(--c-brand-400)" strokeWidth="4" strokeLinecap="round" />
        )
      })}
      {template.nodes.map((n, i) => {
        const p = norm(n.x, n.y)
        return <circle key={i} cx={p.x} cy={p.y} r="7" fill="var(--c-brand-600)" stroke="white" strokeWidth="2" />
      })}
    </svg>
  )
}

// ─── Scheme card ───────────────────────────────────────────────────────────
function SchemeCard({ scheme, lang }: { scheme: Scheme; lang: string }) {
  const { t } = useTranslation()

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(t('schemes.card.confirmDelete', { name: scheme.name }))) {
      schemeStore.deleteScheme(scheme.id)
    }
  }

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    schemeStore.duplicateScheme(scheme.id)
  }

  return (
    <div className="group relative flex flex-col rounded-xl border border-zinc-200 bg-white transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-500">
      <Link
        href={`/schemes/edit?id=${scheme.id}`}
        className="flex flex-1 flex-col p-5"
        onClick={() => schemeStore.setActiveScheme(scheme.id)}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {scheme.name}
          </h3>
          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {t('schemes.card.badge')}
          </span>
        </div>
        {scheme.description && (
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
            {scheme.description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-4 text-[11px] text-zinc-400 dark:text-zinc-500">
          <span>{t('schemes.templates.component', { count: scheme.nodes.length })}</span>
          <span>·</span>
          <span>{t('schemes.templates.wire', { count: scheme.wires.length })}</span>
          <span className="ml-auto">{formatRelative(scheme.updatedAt, lang)}</span>
        </div>
      </Link>
      <div className="flex items-center gap-1 border-t border-zinc-100 px-3 py-2 dark:border-zinc-700/70">
        <Link
          href={`/schemes/edit?id=${scheme.id}`}
          onClick={() => schemeStore.setActiveScheme(scheme.id)}
          className="inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {t('schemes.card.edit')}
        </Link>
        <Button size="sm" variant="ghost" onClick={handleDuplicate} className="text-xs">
          {t('schemes.card.duplicate')}
        </Button>
        <button
          type="button"
          onClick={handleDelete}
          className="ml-auto inline-flex h-8 items-center rounded-md px-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
        >
          {t('schemes.card.delete')}
        </button>
      </div>
    </div>
  )
}

// ─── New scheme modal ─────────────────────────────────────────────────────
function NewSchemeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  function reset() { setName(''); setDescription('') }
  function handleClose() { onClose(); reset() }
  function handleCreate() {
    if (!name.trim()) return
    const scheme = schemeStore.createScheme(name.trim(), description.trim())
    handleClose()
    router.push(`/schemes/edit?id=${scheme.id}`)
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('schemes.modal.title')}
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>{t('schemes.modal.cancel')}</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()}>
            {t('schemes.modal.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="new-scheme-name" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('schemes.modal.nameLabel')} <span className="text-red-500">*</span>
          </label>
          <Input
            id="new-scheme-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('schemes.modal.namePlaceholder')}
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          />
        </div>
        <div>
          <label htmlFor="new-scheme-description" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('schemes.modal.descriptionLabel')}
          </label>
          <Input
            id="new-scheme-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('schemes.modal.descriptionPlaceholder')}
          />
        </div>
      </div>
    </Modal>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function SchemesPage() {
  const { t, i18n } = useTranslation()
  const { schemes } = useSchemeStore()
  const [newOpen, setNewOpen] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sorted = useMemo(
    () => [...schemes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [schemes],
  )

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const scheme = JSON.parse(text) as Scheme
      if (!scheme.id || !scheme.name) throw new Error('Invalid scheme file')
      const freshId = Date.now().toString(36) + Math.random().toString(36).slice(2)
      const fresh: Scheme = {
        ...scheme,
        id: freshId,
        name: `${scheme.name} (imported)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      const state = schemeStore.getState()
      localStorage.setItem(
        'electrical-schemes-v1',
        JSON.stringify({ ...state, schemes: [...state.schemes, fresh], activeSchemeId: freshId }),
      )
      window.location.reload()
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
    e.target.value = ''
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t('schemes.title')}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('schemes.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {t('schemes.import')}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setNewOpen(true)}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('schemes.newScheme')}
            </Button>
          </div>
        </div>

        {/* Templates */}
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/60">
          <button
            type="button"
            onClick={() => setTemplatesOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('schemes.templates.sectionTitle')}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {t('schemes.templates.sectionHint')}
                </p>
              </div>
            </div>
            <svg
              className={`h-4 w-4 text-zinc-400 transition-transform ${templatesOpen ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {templatesOpen && (
            <div className="grid grid-cols-1 gap-3 border-t border-zinc-100 p-5 pt-4 dark:border-zinc-800 sm:grid-cols-2 lg:grid-cols-4">
              {SCHEME_TEMPLATES.map((tpl) => (
                <TemplateCard key={tpl.id} template={tpl} />
              ))}
            </div>
          )}
        </section>

        {/* Schemes grid or empty state */}
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-20 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <svg className="h-12 w-12 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
            <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {t('schemes.empty.title')}
            </p>
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              {t('schemes.empty.subtitle')}
            </p>
            <Button variant="primary" className="mt-6" onClick={() => setNewOpen(true)}>
              {t('schemes.empty.cta')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} lang={i18n.language} />
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
      <NewSchemeModal open={newOpen} onClose={() => setNewOpen(false)} />
    </div>
  )
}
