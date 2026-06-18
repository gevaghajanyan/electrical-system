'use client'

import { useState } from 'react'

type InstallationMethod = 'B2' | 'B' | 'C' | 'D' | 'E'
type SystemType = 'single' | 'three'

interface CableSize {
  size: number
  capacity: number
}

const CABLE_DATA: Record<InstallationMethod, CableSize[]> = {
  B2: [
    { size: 1.5, capacity: 13 }, { size: 2.5, capacity: 18 }, { size: 4, capacity: 24 },
    { size: 6, capacity: 31 }, { size: 10, capacity: 43 }, { size: 16, capacity: 57 },
    { size: 25, capacity: 75 }, { size: 35, capacity: 92 }, { size: 50, capacity: 112 },
    { size: 70, capacity: 136 }, { size: 95, capacity: 163 }, { size: 120, capacity: 188 },
  ],
  B: [
    { size: 1.5, capacity: 13 }, { size: 2.5, capacity: 18 }, { size: 4, capacity: 24 },
    { size: 6, capacity: 31 }, { size: 10, capacity: 43 }, { size: 16, capacity: 57 },
    { size: 25, capacity: 75 }, { size: 35, capacity: 92 }, { size: 50, capacity: 112 },
    { size: 70, capacity: 136 }, { size: 95, capacity: 163 }, { size: 120, capacity: 188 },
  ],
  C: [
    { size: 1.5, capacity: 18 }, { size: 2.5, capacity: 24 }, { size: 4, capacity: 32 },
    { size: 6, capacity: 41 }, { size: 10, capacity: 57 }, { size: 16, capacity: 76 },
    { size: 25, capacity: 96 }, { size: 35, capacity: 119 }, { size: 50, capacity: 144 },
    { size: 70, capacity: 174 }, { size: 95, capacity: 208 }, { size: 120, capacity: 240 },
  ],
  D: [
    { size: 1.5, capacity: 22 }, { size: 2.5, capacity: 29 }, { size: 4, capacity: 38 },
    { size: 6, capacity: 47 }, { size: 10, capacity: 64 }, { size: 16, capacity: 85 },
    { size: 25, capacity: 110 }, { size: 35, capacity: 134 }, { size: 50, capacity: 161 },
    { size: 70, capacity: 198 }, { size: 95, capacity: 238 }, { size: 120, capacity: 276 },
  ],
  E: [
    { size: 1.5, capacity: 20 }, { size: 2.5, capacity: 27 }, { size: 4, capacity: 36 },
    { size: 6, capacity: 46 }, { size: 10, capacity: 64 }, { size: 16, capacity: 85 },
    { size: 25, capacity: 110 }, { size: 35, capacity: 135 }, { size: 50, capacity: 163 },
    { size: 70, capacity: 197 }, { size: 95, capacity: 236 }, { size: 120, capacity: 272 },
  ],
}

const RHO = 0.01786

function calcVdrop(length: number, current: number, size: number, system: SystemType): number {
  if (system === 'single') {
    return (2 * length * current * RHO) / size
  }
  return (Math.sqrt(3) * length * current * RHO) / size
}

interface CableResult {
  size: number
  capacity: number
  vdrop: number
  vdropPct: number
}

function getResults(
  rating: number,
  length: number,
  method: InstallationMethod,
  system: SystemType
): CableResult[] {
  const supplyVoltage = system === 'single' ? 230 : 400
  const cables = CABLE_DATA[method]
  return cables
    .filter((c) => c.capacity >= rating)
    .map((c) => {
      const vdrop = calcVdrop(length, rating, c.size, system)
      const vdropPct = (vdrop / supplyVoltage) * 100
      return { size: c.size, capacity: c.capacity, vdrop, vdropPct }
    })
}

function getRecommended(results: CableResult[]): CableResult | null {
  return results.find((r) => r.vdropPct <= 5) ?? null
}

function VerdictBadge({ pct }: { pct: number }) {
  if (pct <= 3) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
        Within limit
      </span>
    )
  }
  if (pct <= 5) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Acceptable
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
      Exceeds limit
    </span>
  )
}

function StatusIcon({ pct }: { pct: number }) {
  if (pct <= 3) return <span className="text-green-600 dark:text-green-400">✓</span>
  if (pct <= 5) return <span className="text-amber-600 dark:text-amber-400">⚠</span>
  return <span className="text-red-600 dark:text-red-400">✗</span>
}

export function WireSizeCalculator() {
  const [rating, setRating] = useState('')
  const [length, setLength] = useState('')
  const [method, setMethod] = useState<InstallationMethod>('C')
  const [system, setSystem] = useState<SystemType>('single')

  const ratingNum = parseFloat(rating)
  const lengthNum = parseFloat(length)
  const isValid =
    !isNaN(ratingNum) &&
    !isNaN(lengthNum) &&
    ratingNum >= 1 &&
    ratingNum <= 400 &&
    lengthNum >= 1 &&
    lengthNum <= 1000

  const allResults = isValid ? getResults(ratingNum, lengthNum, method, system) : []
  const recommended = isValid ? getRecommended(allResults) : null

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Breaker / circuit rating (A)
          </label>
          <input
            type="number"
            min={1}
            max={400}
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="e.g. 32"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Cable length (m)
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="e.g. 25"
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            Installation method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as InstallationMethod)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="B2">B2 – In conduit on wall</option>
            <option value="B">B – In wall / partition</option>
            <option value="C">C – Clipped direct to surface</option>
            <option value="D">D – Underground / buried</option>
            <option value="E">E – Free air</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            System type
          </label>
          <select
            value={system}
            onChange={(e) => setSystem(e.target.value as SystemType)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="single">Single phase (230 V)</option>
            <option value="three">Three phase (400 V)</option>
          </select>
        </div>
      </div>

      {isValid && (
        <div className="space-y-4">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Recommendation
            </p>
            {recommended ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {recommended.size} mm²
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Capacity: {recommended.capacity} A
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  V-drop: {recommended.vdrop.toFixed(2)} V ({recommended.vdropPct.toFixed(2)}%)
                </span>
                <VerdictBadge pct={recommended.vdropPct} />
              </div>
            ) : (
              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                No suitable cable
              </span>
            )}
          </div>

          {allResults.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Size (mm²)
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Capacity (A)
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Volt drop (V)
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Volt drop (%)
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                  {allResults.map((r) => (
                    <tr key={r.size} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      <td className="px-3 py-2 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                        {r.size}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {r.capacity}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {r.vdrop.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {r.vdropPct.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <StatusIcon pct={r.vdropPct} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
