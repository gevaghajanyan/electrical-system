'use client'

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CalcCard, CalcHeader, Field, FieldRow, ResultBig, ResultRow, fmt } from './shared'

export function PvStringCalc() {
  const { t } = useTranslation()
  const [voc, setVoc] = useState('45')     // V per panel @ STC
  const [vmp, setVmp] = useState('37')
  const [tempCoeff, setTempCoeff] = useState('-0.28') // %/°C for Voc
  const [nPanels, setNPanels] = useState('12')
  const [minT, setMinT] = useState('-20')
  const [maxT, setMaxT] = useState('75')   // module temperature under sun
  const [mpptMin, setMpptMin] = useState('120')
  const [mpptMax, setMpptMax] = useState('550')

  const { vocCold, vmpHot, vocOk, vmpOk } = useMemo(() => {
    const N = Math.max(1, parseInt(nPanels) || 1)
    const Voc = parseFloat(voc) || 0
    const Vmp = parseFloat(vmp) || 0
    const b = (parseFloat(tempCoeff) || -0.3) / 100
    const dTCold = (parseFloat(minT) || -20) - 25 // relative to STC
    const dTHot  = (parseFloat(maxT) || 75) - 25
    const vocCold = N * Voc * (1 + b * dTCold)
    const vmpHot  = N * Vmp * (1 + b * dTHot)
    const vocOk = vocCold <= (parseFloat(mpptMax) || 550)
    const vmpOk = vmpHot  >= (parseFloat(mpptMin) || 120)
    return { vocCold, vmpHot, vocOk, vmpOk }
  }, [voc, vmp, tempCoeff, nPanels, minT, maxT, mpptMin, mpptMax])

  const overall = vocOk && vmpOk

  return (
    <CalcCard>
      <CalcHeader title={t('calc.pv_string.title')} description={t('calc.pv_string.description')} />
      <div className="space-y-4">
        <FieldRow>
          <Field id="pv-voc"  label={t('calc.pv_string.voc')}   value={voc}   onChange={setVoc}   unit="V"     min={10} step={0.5} />
          <Field id="pv-vmp"  label={t('calc.pv_string.vmp')}   value={vmp}   onChange={setVmp}   unit="V"     min={10} step={0.5} />
        </FieldRow>
        <FieldRow>
          <Field id="pv-tc"   label={t('calc.pv_string.tempCoeff')} value={tempCoeff} onChange={setTempCoeff} unit="%/°C" step={0.01} />
          <Field id="pv-n"    label={t('calc.pv_string.nPanels')}   value={nPanels}   onChange={setNPanels}   min={1} step={1} />
        </FieldRow>
        <FieldRow>
          <Field id="pv-tmin" label={t('calc.pv_string.minT')} value={minT} onChange={setMinT} unit="°C" step={1} />
          <Field id="pv-tmax" label={t('calc.pv_string.maxT')} value={maxT} onChange={setMaxT} unit="°C" step={1} />
        </FieldRow>
        <FieldRow>
          <Field id="pv-mppt-min" label={t('calc.pv_string.mpptMin')} value={mpptMin} onChange={setMpptMin} unit="V" step={5} />
          <Field id="pv-mppt-max" label={t('calc.pv_string.mpptMax')} value={mpptMax} onChange={setMpptMax} unit="V" step={5} />
        </FieldRow>

        <div className="mt-4 space-y-2">
          <ResultBig label={t('calc.pv_string.status')} value={overall ? t('calc.pv_string.ok') : t('calc.pv_string.notOk')} tone={overall ? 'success' : 'danger'} />
          <ResultRow label={t('calc.pv_string.vocCold')} value={`${fmt(vocCold, 1)} V`} tone={vocOk ? 'default' : 'danger'} />
          <ResultRow label={t('calc.pv_string.vmpHot')}  value={`${fmt(vmpHot, 1)} V`}  tone={vmpOk ? 'default' : 'warning'} />
        </div>

        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('calc.pv_string.notes')}
        </p>
      </div>
    </CalcCard>
  )
}
