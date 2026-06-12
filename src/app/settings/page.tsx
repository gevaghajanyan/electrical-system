'use client'

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

  function handleClearData() {
    if (confirm('This will delete ALL panels and reset all settings. Are you sure?')) {
      localStorage.removeItem('electrical-system-v1')
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Settings</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Configure defaults and preferences
          </p>
        </div>

        <div className="space-y-6">
          <SettingsSection title="New Panel Defaults">
            <div>
              <Label htmlFor="s-voltage">Default Voltage</Label>
              <Select
                id="s-voltage"
                value={settings.defaultVoltage}
                onChange={(e) =>
                  panelStore.updateSettings({ defaultVoltage: Number(e.target.value) as 230 | 400 })
                }
              >
                <option value={230}>230V (single-phase)</option>
                <option value={400}>400V (three-phase)</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="s-freq">Default Frequency</Label>
              <Select
                id="s-freq"
                value={settings.defaultFrequency}
                onChange={(e) =>
                  panelStore.updateSettings({ defaultFrequency: Number(e.target.value) as 50 | 60 })
                }
              >
                <option value={50}>50 Hz</option>
                <option value={60}>60 Hz</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="s-slots">Default Rail Slot Count</Label>
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
              <p className="mt-1 text-xs text-zinc-400">Number of slots on the first rail for new panels</p>
            </div>
          </SettingsSection>

          <SettingsSection title="Appearance">
            <div>
              <Label htmlFor="s-theme">Theme</Label>
              <Select
                id="s-theme"
                value={settings.theme}
                onChange={(e) =>
                  panelStore.updateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })
                }
              >
                <option value="system">System default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </div>
          </SettingsSection>

          <SettingsSection title="Data">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              All panel data is stored locally in your browser. Nothing is sent to a server.
            </p>
            <Button variant="danger" size="sm" onClick={handleClearData}>
              Clear all data
            </Button>
          </SettingsSection>

          <SettingsSection title="About">
            <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
              <p>Electrical System Panel Designer</p>
              <p>Built for BS 7671 / IEC 60364 distribution board layout</p>
              <p>All data stored client-side via localStorage</p>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}
