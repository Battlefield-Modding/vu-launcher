import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en/translation.json'
import de from './locales/de/translation.json'
import zh from './locales/zh/translation.json'
import ru from './locales/ru/translation.json'

export enum i18nLanguageCodes {
  Arabic = 'ar',
  Chinese = 'zh',
  English = 'en',
  Finnish = 'fi',
  French = 'fr',
  German = 'de',
  Spanish = 'es',
  Swedish = 'sv',
  Russian = 'ru',
}

const resources = {
  [i18nLanguageCodes.English]: {
    translation: en,
  },
  [i18nLanguageCodes.German]: {
    translation: de,
  },
  [i18nLanguageCodes.Chinese]: {
    translation: zh,
  },
  [i18nLanguageCodes.Russian]: {
    translation: ru,
  },
}

export type TSupportedLanguages = keyof typeof resources
export const SupportedLanguages = Object.keys(resources) as (keyof typeof resources)[]

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources,
  })

export default i18n
