'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Trash2, RotateCw, CheckCircle2, AlertCircle, Info,
  Battery, Lightbulb, Cable, Zap, Circle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LessonCard, SectionHeader, Prose, KeyPoints, Playground } from '../shared'

type Kind = 'battery' | 'wire' | 'resistor' | 'capacitor' | 'led'

interface Placed {
  id: string
  kind: Kind
  col: number
  row: number
  horizontal: boolean
}

// ─── Breadboard geometry (mini-breadboard: rails + 5-hole strips + trough) ──

const COLS = 20
const CELL = 22
const TOP_RAIL_ROWS = 2   // + rail rows
const BOT_RAIL_ROWS = 2   // − rail rows
const STRIP_ROWS = 5      // 5-hole vertical strips (top & bottom halves)
const TROUGH_ROWS = 1     // central gap
const BOARD_ROWS =
  TOP_RAIL_ROWS + 1 /* gap */ +
  STRIP_ROWS +
  TROUGH_ROWS +
  STRIP_ROWS + 1 /* gap */ +
  BOT_RAIL_ROWS

const TOP_RAIL_END = TOP_RAIL_ROWS
const TOP_STRIP_START = TOP_RAIL_END + 1
const TOP_STRIP_END = TOP_STRIP_START + STRIP_ROWS
const TROUGH_START = TOP_STRIP_END
const TROUGH_END = TROUGH_START + TROUGH_ROWS
const BOT_STRIP_START = TROUGH_END
const BOT_STRIP_END = BOT_STRIP_START + STRIP_ROWS
const BOT_RAIL_START = BOT_STRIP_END + 1

function isHoleValid(row: number): boolean {
  return (
    row < TOP_RAIL_END ||
    (row >= TOP_STRIP_START && row < TOP_STRIP_END) ||
    (row >= BOT_STRIP_START && row < BOT_STRIP_END) ||
    row >= BOT_RAIL_START
  )
}

function isRailRow(row: number): boolean {
  return row < TOP_RAIL_END || row >= BOT_RAIL_START
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const PALETTE: Array<{ kind: Kind; color: string; Icon: LucideIcon }> = [
  { kind: 'battery',   color: '#1b2740', Icon: Battery },
  { kind: 'wire',      color: '#22c55e', Icon: Cable },
  { kind: 'resistor',  color: '#f59e0b', Icon: Zap },
  { kind: 'capacitor', color: '#8b5cf6', Icon: Circle },
  { kind: 'led',       color: '#ef4444', Icon: Lightbulb },
]

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// ─── Validator — component-count guided (not a real simulator) ──────────────

type Status =
  | { kind: 'empty' }
  | { kind: 'need_battery' }
  | { kind: 'need_led' }
  | { kind: 'need_resistor' }
  | { kind: 'need_wires' }
  | { kind: 'works' }
  | { kind: 'danger_multiple_batteries' }

function validateCircuit(placed: Placed[]): Status {
  if (placed.length === 0) return { kind: 'empty' }
  const batteries = placed.filter((p) => p.kind === 'battery').length
  const leds = placed.filter((p) => p.kind === 'led').length
  const resistors = placed.filter((p) => p.kind === 'resistor').length
  const wires = placed.filter((p) => p.kind === 'wire').length

  if (batteries === 0) return { kind: 'need_battery' }
  if (batteries > 1) return { kind: 'danger_multiple_batteries' }
  if (leds === 0) return { kind: 'need_led' }
  if (resistors === 0) return { kind: 'need_resistor' }
  if (wires < 2) return { kind: 'need_wires' }
  return { kind: 'works' }
}

// ─── Component ──────────────────────────────────────────────────────────────

export function BreadboardPlaygroundLesson() {
  const { t } = useTranslation()
  const [armed, setArmed] = useState<Kind | null>('battery')
  const [placed, setPlaced] = useState<Placed[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const status = useMemo(() => validateCircuit(placed), [placed])
  const svgRef = useRef<SVGSVGElement>(null)
  // Drag-to-move state — tracks the pointer that started the drag so multi-touch
  // pinches don't hijack a move-in-progress.
  const dragRef = useRef<{
    id: string
    pointerId: number
    grabOffsetCol: number
    grabOffsetRow: number
    moved: boolean
  } | null>(null)

  function handleCellClick(col: number, row: number) {
    if (!armed) return
    if (!isHoleValid(row)) return
    if (placed.some((p) => p.col === col && p.row === row)) return
    setPlaced((prev) => [...prev, { id: newId(), kind: armed, col, row, horizontal: true }])
  }
  function rotate() {
    if (!selectedId) return
    setPlaced((prev) => prev.map((p) => (p.id === selectedId ? { ...p, horizontal: !p.horizontal } : p)))
  }
  function remove() {
    if (!selectedId) return
    setPlaced((prev) => prev.filter((p) => p.id !== selectedId))
    setSelectedId(null)
  }
  function clear() {
    setPlaced([])
    setSelectedId(null)
  }
  function nudge(dCol: number, dRow: number) {
    if (!selectedId) return
    setPlaced((prev) => prev.map((p) => {
      if (p.id !== selectedId) return p
      const nc = Math.max(0, Math.min(COLS - 1, p.col + dCol))
      const nr = Math.max(0, Math.min(BOARD_ROWS - 1, p.row + dRow))
      if (!isHoleValid(nr)) return p
      // Refuse the move if it would land on another placed component.
      if (prev.some((q) => q.id !== p.id && q.col === nc && q.row === nr)) return p
      return { ...p, col: nc, row: nr }
    }))
  }

  // ─── Pointer-based drag-to-move on placed components ──────────────────────
  function svgPointToCell(clientX: number, clientY: number): { col: number; row: number } | null {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    // The viewBox is 0..W × 0..H; scale mouse coords into that space.
    const vbX = ((clientX - rect.left) / rect.width) * (COLS * CELL)
    const vbY = ((clientY - rect.top)  / rect.height) * (BOARD_ROWS * CELL)
    const col = Math.floor(vbX / CELL)
    const row = Math.floor(vbY / CELL)
    if (col < 0 || col >= COLS || row < 0 || row >= BOARD_ROWS) return null
    return { col, row }
  }

  function handleCompPointerDown(e: React.PointerEvent, p: Placed) {
    // Only left-mouse / touch / pen — right-click should not start a drag.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.stopPropagation()
    try { (e.currentTarget as Element).setPointerCapture(e.pointerId) } catch {}
    dragRef.current = {
      id: p.id,
      pointerId: e.pointerId,
      grabOffsetCol: 0,
      grabOffsetRow: 0,
      moved: false,
    }
    setSelectedId(p.id)
  }

  function handleCompPointerMove(e: React.PointerEvent) {
    const d = dragRef.current
    if (!d || d.pointerId !== e.pointerId) return
    const cell = svgPointToCell(e.clientX, e.clientY)
    if (!cell) return
    setPlaced((prev) => {
      const target = prev.find((p) => p.id === d.id)
      if (!target) return prev
      // Snap the *centre* of the component to the pointer's cell. For
      // horizontal orientation the component spans col..col+4 (see rendering
      // which uses `CELL * 2` half-width), so its "centre" is the drop point.
      const newCol = Math.max(0, Math.min(COLS - 1, cell.col))
      const newRow = Math.max(0, Math.min(BOARD_ROWS - 1, cell.row))
      if (target.col === newCol && target.row === newRow) return prev
      if (!isHoleValid(newRow)) return prev
      // Don't overlap another component.
      if (prev.some((q) => q.id !== d.id && q.col === newCol && q.row === newRow)) return prev
      d.moved = true
      return prev.map((q) => (q.id === d.id ? { ...q, col: newCol, row: newRow } : q))
    })
  }

  function handleCompPointerUp(e: React.PointerEvent) {
    if (dragRef.current?.pointerId === e.pointerId) {
      try { (e.currentTarget as Element).releasePointerCapture(e.pointerId) } catch {}
      dragRef.current = null
    }
  }

  // ─── Global keyboard shortcuts ────────────────────────────────────────────
  // Digits 1..5 arm the palette; R rotates the selected component; Delete /
  // Backspace deletes it; Esc deselects; arrows nudge by one hole.
  // Shift-Del clears all. Skipped while typing in an input.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      // Palette arm (1..5)
      const kindByDigit: Record<string, Kind> = {
        '1': 'battery', '2': 'wire', '3': 'resistor', '4': 'capacitor', '5': 'led',
      }
      if (kindByDigit[e.key]) {
        setArmed(kindByDigit[e.key])
        return
      }
      // Palette arm (letter aliases): B/W/C/L don't clash with anything else.
      const kindByLetter: Record<string, Kind> = {
        b: 'battery', w: 'wire', c: 'capacitor', l: 'led',
      }
      const lower = e.key.toLowerCase()
      if (!e.metaKey && !e.ctrlKey && kindByLetter[lower]) {
        setArmed(kindByLetter[lower])
        return
      }
      if (!e.metaKey && !e.ctrlKey && (e.key === 'r' || e.key === 'R')) {
        // R rotates the selected component; if nothing is selected, it becomes
        // a shortcut to arm the resistor (no rotation would fire either way).
        if (selectedId) rotate()
        else setArmed('resistor')
        return
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
        setArmed(null)
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if ((e.shiftKey || e.metaKey || e.ctrlKey)) {
          clear()
          e.preventDefault()
          return
        }
        if (selectedId) {
          remove()
          e.preventDefault()
        }
        return
      }
      if (e.key === 'ArrowUp')    { nudge(0, -1); e.preventDefault(); return }
      if (e.key === 'ArrowDown')  { nudge(0,  1); e.preventDefault(); return }
      if (e.key === 'ArrowLeft')  { nudge(-1, 0); e.preventDefault(); return }
      if (e.key === 'ArrowRight') { nudge( 1, 0); e.preventDefault(); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const W = COLS * CELL
  const H = BOARD_ROWS * CELL

  return (
    <div className="space-y-6">
      <LessonCard>
        <SectionHeader title={t('learn.lessons.breadboard.title')} />
        <Prose>
          <p>{t('learn.lessons.breadboard.intro')}</p>
        </Prose>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.tryYourself')} />
        <Playground>
          {/* Palette */}
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              {t('learn.lessons.breadboard.palette')}
            </span>
            {PALETTE.map((item) => {
              const active = armed === item.kind
              const Icon = item.Icon
              return (
                <button
                  key={item.kind}
                  type="button"
                  onClick={() => setArmed(item.kind)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all touch-manipulation min-h-[36px] ${
                    active
                      ? 'text-white shadow-sm scale-105'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                  }`}
                  style={active ? { background: item.color } : undefined}
                >
                  <Icon size={14} />
                  {t(`learn.lessons.breadboard.items.${item.kind}`)}
                </button>
              )
            })}
          </div>

          {/* Realistic breadboard */}
          <div className="overflow-x-auto rounded-2xl bg-gradient-to-b from-[#f8ecd4] to-[#f1dfaf] p-3 shadow-inner ring-1 ring-black/5 dark:from-[#e8cd8a] dark:to-[#c9945e]">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${W} ${H}`}
              className="mx-auto h-auto w-full max-w-3xl"
              onClick={() => setSelectedId(null)}
            >
              {/* + rail band */}
              <rect x={0} y={0} width={W} height={TOP_RAIL_ROWS * CELL} fill="#fef2f2" opacity="0.5" />
              <line
                x1={CELL * 0.6} x2={W - CELL * 0.6}
                y1={CELL / 2} y2={CELL / 2}
                stroke="#ef4444" strokeWidth="2" strokeLinecap="round"
              />
              <text x={CELL * 0.2} y={CELL * 0.7} fontSize="10" fontWeight="800" fill="#ef4444">+</text>
              <text x={W - CELL * 0.7} y={CELL * 0.7} fontSize="10" fontWeight="800" fill="#ef4444">+</text>

              {/* − rail band */}
              <rect x={0} y={BOT_RAIL_START * CELL} width={W} height={BOT_RAIL_ROWS * CELL} fill="#eff6ff" opacity="0.5" />
              <line
                x1={CELL * 0.6} x2={W - CELL * 0.6}
                y1={BOT_RAIL_START * CELL + CELL / 2}
                y2={BOT_RAIL_START * CELL + CELL / 2}
                stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"
              />
              <text x={CELL * 0.2} y={BOT_RAIL_START * CELL + CELL * 0.7} fontSize="10" fontWeight="800" fill="#3b82f6">−</text>
              <text x={W - CELL * 0.7} y={BOT_RAIL_START * CELL + CELL * 0.7} fontSize="10" fontWeight="800" fill="#3b82f6">−</text>

              {/* Central trough (physical gap in a real board) */}
              <rect x={0} y={TROUGH_START * CELL - 1} width={W} height={CELL + 2} fill="#dfb977" opacity="0.5" />
              <line
                x1={0} x2={W}
                y1={TROUGH_START * CELL + CELL / 2}
                y2={TROUGH_START * CELL + CELL / 2}
                stroke="#8b6640" strokeWidth="0.8" strokeDasharray="3 4" opacity="0.55"
              />

              {/* Column numbers */}
              {Array.from({ length: COLS }).map((_, c) => (
                <text
                  key={`col-${c}`}
                  x={c * CELL + CELL / 2}
                  y={TOP_RAIL_END * CELL + 8}
                  textAnchor="middle" fontSize="6.5" fill="#a08050" opacity="0.7"
                >
                  {c + 1}
                </text>
              ))}
              {/* Row letters (top-strip left side) */}
              {['a', 'b', 'c', 'd', 'e'].map((letter, i) => (
                <text
                  key={`rowT-${letter}`}
                  x={2} y={(TOP_STRIP_START + i) * CELL + CELL / 2 + 3}
                  fontSize="7" fill="#a08050" opacity="0.7"
                >
                  {letter}
                </text>
              ))}
              {['f', 'g', 'h', 'i', 'j'].map((letter, i) => (
                <text
                  key={`rowB-${letter}`}
                  x={2} y={(BOT_STRIP_START + i) * CELL + CELL / 2 + 3}
                  fontSize="7" fill="#a08050" opacity="0.7"
                >
                  {letter}
                </text>
              ))}

              {/* Hole grid */}
              {Array.from({ length: BOARD_ROWS }).map((_, r) =>
                Array.from({ length: COLS }).map((_, c) => {
                  if (!isHoleValid(r)) return null
                  const isRail = isRailRow(r)
                  return (
                    <g
                      key={`${r}-${c}`}
                      onClick={(e) => { e.stopPropagation(); handleCellClick(c, r) }}
                      style={{ cursor: armed ? 'copy' : 'default' }}
                    >
                      <rect x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill="transparent" />
                      <rect
                        x={c * CELL + CELL / 2 - 2.5}
                        y={r * CELL + CELL / 2 - 2.5}
                        width={5} height={5} rx={0.5}
                        fill={isRail ? '#3f3f46' : '#0f172a'}
                      />
                    </g>
                  )
                }),
              )}

              {/* Placed components */}
              {placed.map((p) => (
                <BoardComponent
                  key={p.id} placed={p}
                  selected={p.id === selectedId}
                  onSelect={() => setSelectedId(p.id)}
                  onPointerDown={(e) => handleCompPointerDown(e, p)}
                  onPointerMove={handleCompPointerMove}
                  onPointerUp={handleCompPointerUp}
                />
              ))}
            </svg>
          </div>

          {/* Status banner + component counts */}
          <StatusBanner status={status} placed={placed} />

          {/* Controls */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={rotate}
              disabled={!selectedId}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 touch-manipulation min-h-[40px]"
            >
              <RotateCw size={14} />
              {t('learn.lessons.breadboard.rotate')}
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={!selectedId}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:bg-zinc-800 dark:text-red-400 touch-manipulation min-h-[40px]"
            >
              <Trash2 size={14} />
              {t('learn.lessons.breadboard.delete')}
            </button>
            <button
              type="button"
              onClick={clear}
              className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 touch-manipulation min-h-[40px]"
            >
              {t('learn.lessons.breadboard.clear')}
            </button>
          </div>

          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {t('learn.lessons.breadboard.hint')}
          </p>

          {/* Hotkey cheat-sheet */}
          <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
            <Kbd>1–5</Kbd><span>{t('learn.lessons.breadboard.hk.arm')}</span>
            <span className="mx-1 text-zinc-300">·</span>
            <Kbd>R</Kbd><span>{t('learn.lessons.breadboard.hk.rotate')}</span>
            <span className="mx-1 text-zinc-300">·</span>
            <Kbd>↑ ↓ ← →</Kbd><span>{t('learn.lessons.breadboard.hk.nudge')}</span>
            <span className="mx-1 text-zinc-300">·</span>
            <Kbd>Del</Kbd><span>{t('learn.lessons.breadboard.hk.delete')}</span>
            <span className="mx-1 text-zinc-300">·</span>
            <Kbd>Esc</Kbd><span>{t('learn.lessons.breadboard.hk.deselect')}</span>
            <span className="mx-1 text-zinc-300">·</span>
            <Kbd>⇧+Del</Kbd><span>{t('learn.lessons.breadboard.hk.clear')}</span>
          </div>
        </Playground>
      </LessonCard>

      <LessonCard>
        <SectionHeader title={t('learn.keyPoints')} />
        <KeyPoints
          points={[
            t('learn.lessons.breadboard.point1'),
            t('learn.lessons.breadboard.point2'),
            t('learn.lessons.breadboard.point3'),
          ]}
        />
      </LessonCard>
    </div>
  )
}

// ─── Status banner with per-component counts ─────────────────────────────────

function StatusBanner({ status, placed }: { status: Status; placed: Placed[] }) {
  const { t } = useTranslation()

  const counts: Record<Kind, number> = {
    battery:   placed.filter((p) => p.kind === 'battery').length,
    led:       placed.filter((p) => p.kind === 'led').length,
    resistor:  placed.filter((p) => p.kind === 'resistor').length,
    capacitor: placed.filter((p) => p.kind === 'capacitor').length,
    wire:      placed.filter((p) => p.kind === 'wire').length,
  }

  let tone =
    status.kind === 'works'   ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200' :
    status.kind === 'empty'   ? 'border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300' :
    status.kind === 'danger_multiple_batteries' ?
                                'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'
    :                           'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'

  const Icon =
    status.kind === 'works'   ? CheckCircle2 :
    status.kind === 'empty'   ? Info :
    status.kind === 'danger_multiple_batteries' ? AlertCircle : AlertCircle

  return (
    <div className={`mt-4 rounded-xl border p-3 ${tone}`}>
      <div className="flex items-start gap-2.5">
        <Icon size={20} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {t(`learn.lessons.breadboard.status.${status.kind}`)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <CountChip icon={Battery}   count={counts.battery}   label="battery"   />
            <CountChip icon={Lightbulb} count={counts.led}       label="led"       />
            <CountChip icon={Zap}       count={counts.resistor}  label="resistor"  />
            <CountChip icon={Circle}    count={counts.capacitor} label="capacitor" />
            <CountChip icon={Cable}     count={counts.wire}      label="wire"      />
          </div>
        </div>
      </div>
    </div>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded border border-zinc-300 bg-zinc-50 px-1.5 py-[1px] font-mono text-[10px] font-semibold text-zinc-700 shadow-[0_1px_0_0_#e4e4e7] dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:shadow-[0_1px_0_0_#3f3f46]">
      {children}
    </kbd>
  )
}

function CountChip({ icon: Icon, count, label }: { icon: LucideIcon; count: number; label: string }) {
  const { t } = useTranslation()
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold tabular-nums dark:bg-black/25 ${count > 0 ? '' : 'opacity-45'}`}
      title={t(`learn.lessons.breadboard.items.${label}`)}
    >
      <Icon size={11} />
      {count}
    </span>
  )
}

// ─── Placed-component art ────────────────────────────────────────────────────

function BoardComponent({
  placed, selected, onSelect,
  onPointerDown, onPointerMove, onPointerUp,
}: {
  placed: Placed
  selected: boolean
  onSelect: () => void
  onPointerDown?: (e: React.PointerEvent) => void
  onPointerMove?: (e: React.PointerEvent) => void
  onPointerUp?: (e: React.PointerEvent) => void
}) {
  const cx = placed.col * CELL + CELL / 2
  const cy = placed.row * CELL + CELL / 2
  const rot = placed.horizontal ? 0 : 90

  return (
    <g
      transform={`rotate(${rot} ${cx} ${cy})`}
      style={{ cursor: 'grab', touchAction: 'none' }}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {selected && (
        <rect
          x={cx - CELL * 2 - 3} y={cy - CELL - 3}
          width={CELL * 4 + 6} height={CELL * 2 + 6} rx={5}
          fill="#3b82f6" fillOpacity="0.12"
          stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 3"
        />
      )}
      {placed.kind === 'resistor' && (
        <g>
          <rect x={cx - CELL * 2} y={cy - 6} width={CELL * 4} height={12} rx={2.5} fill="#f4a020" stroke="#78350f" strokeWidth="0.6" />
          <rect x={cx - 24} y={cy - 6} width={4} height={12} fill="#8b4513" />
          <rect x={cx - 10} y={cy - 6} width={4} height={12} fill="#000000" />
          <rect x={cx + 6}  y={cy - 6} width={4} height={12} fill="#ef4444" />
          <rect x={cx + 22} y={cy - 6} width={4} height={12} fill="#facc15" />
        </g>
      )}
      {placed.kind === 'capacitor' && (
        <g>
          <line x1={cx - CELL * 2} y1={cy} x2={cx - 4} y2={cy} stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
          <rect x={cx - 4} y={cy - 12} width={3} height={24} fill="#8b5cf6" />
          <rect x={cx + 1} y={cy - 12} width={3} height={24} fill="#8b5cf6" />
          <line x1={cx + 4} y1={cy} x2={cx + CELL * 2} y2={cy} stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {placed.kind === 'led' && (
        <g>
          <line x1={cx - CELL * 2} y1={cy} x2={cx - 10} y2={cy} stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="16" fill="#ef4444" opacity="0.18" />
          <polygon points={`${cx - 10},${cy - 9} ${cx - 10},${cy + 9} ${cx + 5},${cy}`} fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" />
          <rect x={cx + 5} y={cy - 9} width={2.5} height={18} fill="#7f1d1d" />
          <line x1={cx + 8} y1={cy} x2={cx + CELL * 2} y2={cy} stroke="#a1a1aa" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {placed.kind === 'wire' && (
        <g>
          <line x1={cx - CELL * 2} y1={cy} x2={cx + CELL * 2} y2={cy} stroke="#22c55e" strokeWidth="4" strokeLinecap="round" />
          <circle cx={cx - CELL * 2} cy={cy} r="3" fill="#166534" />
          <circle cx={cx + CELL * 2} cy={cy} r="3" fill="#166534" />
        </g>
      )}
      {placed.kind === 'battery' && (
        <g>
          <rect x={cx - CELL * 2} y={cy - 11} width={CELL * 4} height={22} rx={4} fill="#1b2740" stroke="#0f172a" strokeWidth="0.8" />
          <rect x={cx + CELL * 2} y={cy - 5} width={3} height={10} fill="#a1a1aa" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="800" fill="#f2bc2e">9V</text>
          <text x={cx - CELL * 2 + 6} y={cy - 3} fontSize="7" fontWeight="800" fill="#22c55e">+</text>
          <text x={cx + CELL * 2 - 6} y={cy - 3} textAnchor="end" fontSize="7" fontWeight="800" fill="#a1a1aa">−</text>
        </g>
      )}
    </g>
  )
}
