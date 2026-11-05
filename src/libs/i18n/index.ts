import en from './locales/en.json'

export type TranslationKey = keyof typeof en

// TODO: Integrate an i18n library here when multiple locales are required.
export function t(key: TranslationKey): string {
  return en[key]
}
