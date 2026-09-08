'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader } from './shared'

interface Formula {
  expr: string
  meaning: string
}

interface Group {
  id: string
  titleKey: string
  formulas: Formula[]
}

// Formula content is stable across locales — meanings are i18n-driven.
const GROUPS: Group[] = [
  {
    id: 'ohms_dc',
    titleKey: 'formulas.groups.ohms_dc',
    formulas: [
      { expr: 'V = I · R',           meaning: 'voltage_from_ir' },
      { expr: 'I = V ÷ R',           meaning: 'current_from_vr' },
      { expr: 'R = V ÷ I',           meaning: 'resistance_from_vi' },
      { expr: 'P = V · I',           meaning: 'power_from_vi' },
      { expr: 'P = I² · R',          meaning: 'power_from_ir' },
      { expr: 'P = V² ÷ R',          meaning: 'power_from_vr' },
    ],
  },
  {
    id: 'ohms_ac',
    titleKey: 'formulas.groups.ohms_ac',
    formulas: [
      { expr: 'Z = √(R² + X²)',      meaning: 'impedance' },
      { expr: 'φ = atan(X ÷ R)',     meaning: 'phase_angle' },
      { expr: 'PF = cos φ',          meaning: 'power_factor' },
      { expr: 'P = V · I · cos φ',   meaning: 'real_power' },
      { expr: 'Q = V · I · sin φ',   meaning: 'reactive_power' },
      { expr: 'S = V · I',           meaning: 'apparent_power' },
      { expr: 'S² = P² + Q²',        meaning: 'power_triangle' },
    ],
  },
  {
    id: 'three_phase',
    titleKey: 'formulas.groups.three_phase',
    formulas: [
      { expr: 'P₃φ = √3 · V_L · I_L · cos φ', meaning: 'three_phase_power' },
      { expr: 'I_L = P ÷ (√3 · V_L · cos φ)', meaning: 'three_phase_current' },
      { expr: 'V_L = √3 · V_ph',              meaning: 'line_phase_voltage' },
      { expr: 'I_L = I_ph  (Y)',              meaning: 'star_current' },
      { expr: 'I_L = √3 · I_ph  (Δ)',         meaning: 'delta_current' },
    ],
  },
  {
    id: 'installation',
    titleKey: 'formulas.groups.installation',
    formulas: [
      { expr: 'ΔV = 2 · I · ρ · L ÷ A   (1φ)', meaning: 'vdrop_1p' },
      { expr: 'ΔV = √3 · I · ρ · L ÷ A  (3φ)', meaning: 'vdrop_3p' },
      { expr: 'If = Uo ÷ Zs',                  meaning: 'fault_current' },
      { expr: 'Ib ≤ In ≤ Iz',                  meaning: 'protection_rule' },
      { expr: 'I²t ≤ k² · A²',                 meaning: 'adiabatic_check' },
    ],
  },
  {
    id: 'motor',
    titleKey: 'formulas.groups.motor',
    formulas: [
      { expr: 'I_FL = P ÷ (√3 · V · η · cos φ)', meaning: 'motor_flc' },
      { expr: 'I_start ≈ 5-8 × I_FL (induction)', meaning: 'motor_start' },
      { expr: 'n_s = 60 · f ÷ p',                 meaning: 'sync_speed' },
      { expr: 'slip = (n_s − n) ÷ n_s',           meaning: 'slip' },
      { expr: 'T = 9550 · P_kW ÷ n_rpm',          meaning: 'torque' },
    ],
  },
  {
    id: 'transformer',
    titleKey: 'formulas.groups.transformer',
    formulas: [
      { expr: 'N₁ ÷ N₂ = V₁ ÷ V₂',       meaning: 'turns_ratio' },
      { expr: 'V₁ · I₁ = V₂ · I₂  (ideal)', meaning: 'ideal_power' },
      { expr: 'I₂ ÷ I₁ = N₁ ÷ N₂',        meaning: 'current_ratio' },
      { expr: 'η = P_out ÷ P_in',          meaning: 'efficiency' },
    ],
  },
  {
    id: 'pfc',
    titleKey: 'formulas.groups.pfc',
    formulas: [
      { expr: 'Qc = P · (tan φ₁ − tan φ₂)', meaning: 'qc_kvar' },
      { expr: 'C = Qc · 1000 ÷ (2π · f · V²) [µF]', meaning: 'cap_size' },
    ],
  },
  {
    id: 'reactance',
    titleKey: 'formulas.groups.reactance',
    formulas: [
      { expr: 'X_L = 2π · f · L',      meaning: 'inductive_reactance' },
      { expr: 'X_C = 1 ÷ (2π · f · C)', meaning: 'capacitive_reactance' },
      { expr: 'f_res = 1 ÷ (2π · √(LC))', meaning: 'resonance' },
      { expr: 'τ = R · C',              meaning: 'rc_time' },
      { expr: 'τ = L ÷ R',              meaning: 'rl_time' },
    ],
  },
  {
    id: 'combining',
    titleKey: 'formulas.groups.combining',
    formulas: [
      { expr: 'R_series = ΣRᵢ',                    meaning: 'r_series' },
      { expr: '1 ÷ R_parallel = Σ(1 ÷ Rᵢ)',        meaning: 'r_parallel' },
      { expr: '1 ÷ C_series = Σ(1 ÷ Cᵢ)',          meaning: 'c_series' },
      { expr: 'C_parallel = ΣCᵢ',                  meaning: 'c_parallel' },
    ],
  },
  {
    id: 'energy',
    titleKey: 'formulas.groups.energy',
    formulas: [
      { expr: 'E = P · t',              meaning: 'energy' },
      { expr: '1 kWh = 3.6 MJ',         meaning: 'kwh_j' },
      { expr: 'Q = m · c · ΔT',         meaning: 'heat' },
      { expr: 'E_cap = ½ · C · V²',     meaning: 'capacitor_energy' },
      { expr: 'E_ind = ½ · L · I²',     meaning: 'inductor_energy' },
    ],
  },
  {
    id: 'constants',
    titleKey: 'formulas.groups.constants',
    formulas: [
      { expr: 'ρ_Cu ≈ 0.0175 Ω·mm²/m @ 20°C',  meaning: 'rho_copper' },
      { expr: 'ρ_Al ≈ 0.0282 Ω·mm²/m @ 20°C',  meaning: 'rho_aluminium' },
      { expr: 'α_Cu ≈ 0.00393 /°C',            meaning: 'alpha_copper' },
      { expr: 'k (Cu, PVC 70°C) = 115 A·s^½ ÷ mm²', meaning: 'k_copper_pvc' },
      { expr: 'Uo = V ÷ √3  (3φ)',             meaning: 'uo_definition' },
    ],
  },
]

export function FormulasReference() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GROUPS
    return GROUPS
      .map((g) => ({
        ...g,
        formulas: g.formulas.filter((f) => {
          const meaning = t(`formulas.meanings.${f.meaning}`, { defaultValue: '' }).toLowerCase()
          return f.expr.toLowerCase().includes(q) || meaning.includes(q) || t(g.titleKey).toLowerCase().includes(q)
        }),
      }))
      .filter((g) => g.formulas.length > 0)
  }, [query, t])

  return (
    <CalcCard>
      <CalcHeader title={t('calc.formulas.title')} description={t('calc.formulas.description')} />
      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('calc.formulas.searchPlaceholder')}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-9 pr-3 text-sm text-zinc-800 shadow-sm placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-100"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700">
            {t('calc.formulas.noResults')}
          </div>
        ) : (
          filtered.map((group) => (
            <section key={group.id} className="rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/40">
              <header className="border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-700">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  {t(group.titleKey)}
                </h3>
              </header>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {group.formulas.map((f, i) => (
                  <li key={i} className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sm:items-baseline sm:gap-4">
                    <code className="font-mono text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                      {f.expr}
                    </code>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t(`formulas.meanings.${f.meaning}`, { defaultValue: '' })}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </CalcCard>
  )
}
