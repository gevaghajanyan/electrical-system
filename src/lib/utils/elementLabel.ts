import type { TFunction } from 'i18next'
import type { ElementDef } from '../constants/elementDefs'

/**
 * Localized label for an element definition. Falls back to the hard-coded
 * English def.label if no i18n key exists (so untranslated devices still show
 * *something* readable).
 */
export function getElementLabel(def: ElementDef, t: TFunction): string {
  const key = `elements.${def.id}.label`
  const translated = t(key)
  return translated === key ? def.label : translated
}

export function getElementDescription(def: ElementDef, t: TFunction): string {
  const key = `elements.${def.id}.description`
  const translated = t(key)
  return translated === key ? def.description : translated
}
