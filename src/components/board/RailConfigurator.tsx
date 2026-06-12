'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Rail } from '@/lib/types/panel'
import { panelStore } from '@/lib/store/panelStore'
import { useActivePanel } from '@/lib/hooks/usePanelStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

interface RailRowProps {
  rail: Rail
  index: number
  onEdit: (rail: Rail) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  isFirst: boolean
  isLast: boolean
}

function RailRow({ rail, index, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }: RailRowProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-700 dark:bg-zinc-800">
      <span className="w-5 text-center text-xs text-zinc-400">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
          {rail.label || t('rails.defaultLabel', { n: index + 1 })}
        </p>
        <p className="text-xs text-zinc-500">{t('rails.slots', { count: rail.slotCount })}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" onClick={() => onMoveUp(rail.id)} disabled={isFirst} title="Move up">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onMoveDown(rail.id)} disabled={isLast} title="Move down">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onEdit(rail)} title="Edit">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(rail.id)} title="Delete" className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </div>
  )
}

interface EditRailModalProps {
  rail: Rail | null
  open: boolean
  onClose: () => void
}

function EditRailModal({ rail, open, onClose }: EditRailModalProps) {
  const { t } = useTranslation()
  const [label, setLabel] = useState(rail?.label ?? '')
  const [slotCount, setSlotCount] = useState(rail?.slotCount ?? 24)

  const isNew = !rail

  function handleSubmit() {
    if (isNew) {
      panelStore.addRail({ label, slotCount })
    } else {
      panelStore.updateRail(rail.id, { label, slotCount })
    }
    onClose()
  }

  useEffect(() => {
    setLabel(rail?.label ?? '')
    setSlotCount(rail?.slotCount ?? 24)
  }, [rail?.id])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? t('rails.addRail') : t('rails.editRail')}
      maxWidth="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{t('rails.cancel')}</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isNew ? t('rails.addRail') : t('rails.saveChanges')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="rail-label">{t('rails.labelField')}</Label>
          <Input
            id="rail-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={t('rails.labelPlaceholder')}
          />
        </div>
        <div>
          <Label htmlFor="rail-slots">{t('rails.slotCount')}</Label>
          <Input
            id="rail-slots"
            type="number"
            min={1}
            max={120}
            value={slotCount}
            onChange={(e) => setSlotCount(Math.max(1, Math.min(120, Number(e.target.value))))}
          />
          <p className="mt-1 text-xs text-zinc-500">
            {t('rails.slotCountHint')}
          </p>
        </div>
      </div>
    </Modal>
  )
}

interface RailConfiguratorProps {
  open: boolean
  onClose: () => void
}

export function RailConfigurator({ open, onClose }: RailConfiguratorProps) {
  const { t } = useTranslation()
  const panel = useActivePanel()
  const [editingRail, setEditingRail] = useState<Rail | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)

  if (!panel) return null
  const activePanel = panel

  function handleEdit(rail: Rail) {
    setEditingRail(rail)
    setEditModalOpen(true)
  }

  function handleAdd() {
    setEditingRail(null)
    setEditModalOpen(true)
  }

  function handleDelete(railId: string) {
    if (confirm(t('rails.confirmDelete'))) {
      panelStore.deleteRail(railId)
    }
  }

  function handleMoveUp(railId: string) {
    const ids = activePanel.rails.map((r) => r.id)
    const idx = ids.indexOf(railId)
    if (idx <= 0) return
    ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
    panelStore.reorderRails(ids)
  }

  function handleMoveDown(railId: string) {
    const ids = activePanel.rails.map((r) => r.id)
    const idx = ids.indexOf(railId)
    if (idx < 0 || idx >= ids.length - 1) return
    ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
    panelStore.reorderRails(ids)
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={t('rails.configureTitle')}
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>{t('rails.close')}</Button>
            <Button variant="primary" onClick={handleAdd}>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('rails.addRail')}
            </Button>
          </>
        }
      >
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {activePanel.rails.length === 0 && (
            <p className="py-8 text-center text-sm text-zinc-500">
              {t('rails.noRails')}
            </p>
          )}
          {activePanel.rails.map((rail, index) => (
            <RailRow
              key={rail.id}
              rail={rail}
              index={index}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={index === 0}
              isLast={index === activePanel.rails.length - 1}
            />
          ))}
        </div>
      </Modal>

      <EditRailModal
        rail={editingRail}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </>
  )
}
