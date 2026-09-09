'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Search } from 'lucide-react'

type Standard = 'iec' | 'ansi'
type Category = 'sources' | 'passive' | 'active' | 'switch' | 'protection' | 'measurement' | 'earth' | 'loads' | 'connect'

interface SymDef {
  id: string
  cat: Category
  iec: React.ReactNode
  ansi?: React.ReactNode
}

function Box({ children, w = 100, h = 40 }: { children: React.ReactNode; w?: number; h?: number }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-auto">
      <g stroke="#1b2740" strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">{children}</g>
    </svg>
  )
}

const SYMS: SymDef[] = [
  // sources
  { id: 'battery',  cat: 'sources', iec: <Box><line x1={0} y1={20} x2={40} y2={20} /><line x1={40} y1={8} x2={40} y2={32} strokeWidth={2.5} /><line x1={48} y1={14} x2={48} y2={26} strokeWidth={2.5} /><line x1={48} y1={20} x2={100} y2={20} /></Box> },
  { id: 'ac_source', cat: 'sources', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><circle cx={50} cy={20} r={14} /><path d="M 40 20 Q 45 12 50 20 T 60 20" /><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  { id: 'dc_source', cat: 'sources', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><circle cx={50} cy={20} r={14} /><line x1={42} y1={17} x2={58} y2={17} strokeWidth={2} /><line x1={42} y1={23} x2={58} y2={23} strokeDasharray="3 2" /><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  // passive
  { id: 'resistor', cat: 'passive', iec: <Box><line x1={0} y1={20} x2={25} y2={20} /><rect x={25} y={14} width={50} height={12} /><line x1={75} y1={20} x2={100} y2={20} /></Box>, ansi: <Box><line x1={0} y1={20} x2={20} y2={20} /><path d="M 20 20 L 26 10 L 34 30 L 42 10 L 50 30 L 58 10 L 66 30 L 74 10 L 80 20" /><line x1={80} y1={20} x2={100} y2={20} /></Box> },
  { id: 'capacitor', cat: 'passive', iec: <Box><line x1={0} y1={20} x2={45} y2={20} /><line x1={45} y1={8} x2={45} y2={32} strokeWidth={2.5} /><line x1={55} y1={8} x2={55} y2={32} strokeWidth={2.5} /><line x1={55} y1={20} x2={100} y2={20} /></Box> },
  { id: 'inductor',  cat: 'passive', iec: <Box><line x1={0} y1={20} x2={20} y2={20} /><path d="M 20 20 Q 28 8 36 20 Q 44 8 52 20 Q 60 8 68 20 Q 76 8 80 20" /><line x1={80} y1={20} x2={100} y2={20} /></Box> },
  // active
  { id: 'diode',     cat: 'active', iec: <Box><line x1={0} y1={20} x2={35} y2={20} /><polygon points="35,10 35,30 55,20" /><line x1={55} y1={10} x2={55} y2={30} strokeWidth={2.5} /><line x1={55} y1={20} x2={100} y2={20} /></Box> },
  { id: 'led',       cat: 'active', iec: <Box><line x1={0} y1={20} x2={35} y2={20} /><polygon points="35,10 35,30 55,20" /><line x1={55} y1={10} x2={55} y2={30} strokeWidth={2.5} /><line x1={55} y1={20} x2={100} y2={20} /><line x1={60} y1={5} x2={70} y2={-2} /><line x1={65} y1={10} x2={75} y2={3} /></Box> },
  { id: 'transistor_npn', cat: 'active', iec: <Box h={50}><circle cx={50} cy={25} r={16} /><line x1={30} y1={25} x2={44} y2={25} /><line x1={44} y1={15} x2={44} y2={35} /><line x1={44} y1={18} x2={60} y2={5} /><line x1={44} y1={32} x2={60} y2={45} /><polygon points="55,45 60,45 58,40" fill="#1b2740" /></Box> },
  // switch
  { id: 'switch_spst', cat: 'switch', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><circle cx={30} cy={20} r={2.5} fill="#1b2740" /><circle cx={70} cy={20} r={2.5} fill="#1b2740" /><line x1={30} y1={20} x2={65} y2={8} strokeWidth={2} /><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  { id: 'push_button', cat: 'switch', iec: <Box><line x1={0} y1={25} x2={35} y2={25} /><line x1={65} y1={25} x2={100} y2={25} /><line x1={35} y1={18} x2={65} y2={18} strokeWidth={2} /><line x1={50} y1={18} x2={50} y2={8} /><rect x={44} y={2} width={12} height={6} rx={1} fill="#f2bc2e" /></Box> },
  { id: 'switch_2way', cat: 'switch', iec: <Box><line x1={0} y1={20} x2={25} y2={20} /><circle cx={25} cy={20} r={2.5} fill="#1b2740" /><line x1={80} y1={10} x2={100} y2={10} /><line x1={80} y1={30} x2={100} y2={30} /><circle cx={78} cy={10} r={2.5} fill="#1b2740" /><circle cx={78} cy={30} r={2.5} fill="#1b2740" /><line x1={27} y1={20} x2={72} y2={10} strokeWidth={2} /></Box> },
  { id: 'contactor',   cat: 'switch', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><circle cx={30} cy={20} r={2.5} fill="#1b2740" /><circle cx={70} cy={20} r={2.5} fill="#1b2740" /><line x1={30} y1={20} x2={65} y2={8} strokeWidth={2} /><path d="M 47 8 L 55 8" strokeWidth={2} /><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  // protection
  { id: 'fuse',       cat: 'protection', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><rect x={30} y={14} width={40} height={12} /><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  { id: 'mcb',        cat: 'protection', iec: <Box><line x1={0} y1={20} x2={25} y2={20} /><rect x={25} y={10} width={50} height={20} /><line x1={30} y1={30} x2={38} y2={10} strokeWidth={2} /><line x1={75} y1={20} x2={100} y2={20} /></Box> },
  { id: 'rcd',        cat: 'protection', iec: <Box><line x1={0} y1={20} x2={25} y2={20} /><rect x={25} y={10} width={50} height={20} /><text x={50} y={24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1b2740">Iδ</text><line x1={75} y1={20} x2={100} y2={20} /></Box> },
  { id: 'spd',        cat: 'protection', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><rect x={30} y={12} width={40} height={16} /><text x={50} y={24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1b2740">SPD</text><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  // measurement
  { id: 'voltmeter',  cat: 'measurement', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><circle cx={50} cy={20} r={14} /><text x={50} y={24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1b2740">V</text><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  { id: 'ammeter',    cat: 'measurement', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><circle cx={50} cy={20} r={14} /><text x={50} y={24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1b2740">A</text><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  { id: 'wattmeter',  cat: 'measurement', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><circle cx={50} cy={20} r={14} /><text x={50} y={24} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1b2740">W</text><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  { id: 'kwh_meter',  cat: 'measurement', iec: <Box><line x1={0} y1={20} x2={30} y2={20} /><rect x={30} y={8} width={40} height={24} /><text x={50} y={24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#1b2740">kWh</text><line x1={70} y1={20} x2={100} y2={20} /></Box> },
  // earth
  { id: 'earth',      cat: 'earth', iec: <Box><line x1={50} y1={0} x2={50} y2={20} /><line x1={30} y1={20} x2={70} y2={20} strokeWidth={2} /><line x1={36} y1={26} x2={64} y2={26} /><line x1={42} y1={32} x2={58} y2={32} /></Box> },
  { id: 'chassis',    cat: 'earth', iec: <Box><line x1={50} y1={0} x2={50} y2={20} /><line x1={30} y1={20} x2={70} y2={20} strokeWidth={2} /><line x1={30} y1={20} x2={38} y2={30} /><line x1={40} y1={20} x2={48} y2={30} /><line x1={50} y1={20} x2={58} y2={30} /><line x1={60} y1={20} x2={68} y2={30} /></Box> },
  // loads
  { id: 'lamp',       cat: 'loads', iec: <Box h={50}><circle cx={50} cy={22} r={16} /><line x1={39.5} y1={11.5} x2={60.5} y2={32.5} /><line x1={60.5} y1={11.5} x2={39.5} y2={32.5} /><line x1={50} y1={0} x2={50} y2={6} /><line x1={50} y1={38} x2={50} y2={44} /></Box> },
  { id: 'motor',      cat: 'loads', iec: <Box h={50}><circle cx={50} cy={22} r={16} /><text x={50} y={28} textAnchor="middle" fontSize={16} fontWeight={800} fill="#1b2740">M</text><line x1={50} y1={0} x2={50} y2={6} /></Box> },
  { id: 'heater',     cat: 'loads', iec: <Box><line x1={0} y1={20} x2={20} y2={20} /><rect x={20} y={12} width={60} height={16} /><path d="M 25 20 L 35 12 L 45 28 L 55 12 L 65 28 L 75 20" /><line x1={80} y1={20} x2={100} y2={20} /></Box> },
  // connect
  { id: 'junction',   cat: 'connect', iec: <Box><line x1={0} y1={20} x2={100} y2={20} /><line x1={50} y1={0} x2={50} y2={40} /><circle cx={50} cy={20} r={4} fill="#1b2740" /></Box> },
  { id: 'crossing_no_connect', cat: 'connect', iec: <Box><line x1={0} y1={20} x2={100} y2={20} /><line x1={50} y1={0} x2={50} y2={40} /></Box> },
  { id: 'transformer', cat: 'connect', iec: <Box w={140} h={50}><path d="M 30 12 Q 24 25 30 38" /><path d="M 30 12 Q 36 25 30 38" /><line x1={60} y1={5} x2={60} y2={45} strokeDasharray="4 3" /><line x1={64} y1={5} x2={64} y2={45} strokeDasharray="4 3" /><path d="M 94 12 Q 100 25 94 38" /><path d="M 94 12 Q 88 25 94 38" /><line x1={0} y1={15} x2={22} y2={15} /><line x1={0} y1={35} x2={22} y2={35} /><line x1={102} y1={15} x2={140} y2={15} /><line x1={102} y1={35} x2={140} y2={35} /></Box> },
]

const CATS: Category[] = ['sources', 'passive', 'active', 'switch', 'protection', 'measurement', 'earth', 'loads', 'connect']

export default function SymbolsPage() {
  const { t } = useTranslation()
  const [std, setStd] = useState<Standard>('iec')
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    return SYMS.filter((s) => {
      if (cat !== 'all' && s.cat !== cat) return false
      if (q.trim()) {
        const lc = q.toLowerCase()
        const name = t(`reference.symbols.entries.${s.id}`).toLowerCase()
        if (!name.includes(lc) && !s.id.includes(lc)) return false
      }
      return true
    })
  }, [cat, q, t])

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <Link href="/reference" className="mb-4 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100">
        <ArrowLeft size={14} /> {t('reference.back')}
      </Link>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{t('reference.sections.symbols.title')}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t('reference.sections.symbols.desc')}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="grid grid-cols-2 gap-1 rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
          {(['iec', 'ansi'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStd(s)}
              className={`min-h-[36px] rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                std === s ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300'
              }`}
            >
              {t(`reference.symbols.std.${s}`)}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('reference.symbols.search')}
            className="h-9 w-full rounded-lg border border-zinc-300 bg-white pl-8 pr-3 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setCat('all')}
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${cat === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'}`}
        >
          {t('reference.symbols.categories.all')}
        </button>
        {CATS.map((c) => (
          <button key={c} type="button" onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${cat === c ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300'}`}
          >
            {t(`reference.symbols.categories.${c}`)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <div key={s.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
            <div className="flex h-14 items-center justify-center rounded-lg bg-zinc-50 dark:bg-zinc-900/60">
              {std === 'iec' ? s.iec : (s.ansi ?? s.iec)}
            </div>
            <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-100">{t(`reference.symbols.entries.${s.id}`)}</p>
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">{t(`reference.symbols.categories.${s.cat}`)}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-zinc-400">{t('reference.symbols.noResults')}</p>
        )}
      </div>
    </div>
  )
}
