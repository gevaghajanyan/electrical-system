'use client'

import { useTranslation } from 'react-i18next'
import { panelStore } from '@/lib/store/panelStore'
import { usePanelStore } from '@/lib/hooks/usePanelStore'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-800">
      <h2 className="mb-4 text-sm font-semibold text-zinc-800 dark:text-zinc-200">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { settings } = usePanelStore()
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language?.startsWith('ru') ? 'ru' : 'en'

  function handleClearData() {
    if (confirm(t('settings.data.confirmClear'))) {
      localStorage.removeItem('electrical-system-v1')
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t('settings.title')}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t('settings.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          <SettingsSection title={t('settings.newPanelDefaults.title')}>
            <div>
              <Label htmlFor="s-voltage">{t('settings.newPanelDefaults.defaultVoltage')}</Label>
              <Select
                id="s-voltage"
                value={settings.defaultVoltage}
                onChange={(e) =>
                  panelStore.updateSettings({ defaultVoltage: Number(e.target.value) as 230 | 400 })
                }
              >
                <option value={230}>{t('settings.newPanelDefaults.voltage230')}</option>
                <option value={400}>{t('settings.newPanelDefaults.voltage400')}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="s-freq">{t('settings.newPanelDefaults.defaultFrequency')}</Label>
              <Select
                id="s-freq"
                value={settings.defaultFrequency}
                onChange={(e) =>
                  panelStore.updateSettings({ defaultFrequency: Number(e.target.value) as 50 | 60 })
                }
              >
                <option value={50}>{t('settings.newPanelDefaults.freq50')}</option>
                <option value={60}>{t('settings.newPanelDefaults.freq60')}</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="s-slots">{t('settings.newPanelDefaults.slotCount')}</Label>
              <Input
                id="s-slots"
                type="number"
                min={6}
                max={120}
                value={settings.defaultSlotCount}
                onChange={(e) =>
                  panelStore.updateSettings({ defaultSlotCount: Math.max(6, Math.min(120, Number(e.target.value))) })
                }
              />
              <p className="mt-1 text-xs text-zinc-400">{t('settings.newPanelDefaults.slotCountHint')}</p>
            </div>
          </SettingsSection>

          <SettingsSection title={t('settings.appearance.title')}>
            <div>
              <Label htmlFor="s-theme">{t('settings.appearance.theme')}</Label>
              <Select
                id="s-theme"
                value={settings.theme}
                onChange={(e) =>
                  panelStore.updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })
                }
              >
                <option value="system">{t('settings.appearance.themeSystem')}</option>
                <option value="light">{t('settings.appearance.themeLight')}</option>
                <option value="dark">{t('settings.appearance.themeDark')}</option>
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection title={t('settings.language.title')}>
            <div>
              <Label htmlFor="s-lang">{t('settings.language.label')}</Label>
              <Select
                id="s-lang"
                value={currentLang}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="en">{t('lang.en')}</option>
                <option value="ru">{t('lang.ru')}</option>
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection title={t('settings.data.title')}>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('settings.data.description')}
            </p>
            <Button variant="danger" size="sm" onClick={handleClearData}>
              {t('settings.data.clearAll')}
            </Button>
          </SettingsSection>

          <SettingsSection title={t('settings.about.title')}>
            <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <p>{t('settings.about.line1')}</p>
              <p>{t('settings.about.line2')}</p>
              <p>{t('settings.about.line3')}</p>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}
