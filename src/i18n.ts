import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { EnglishTranslations } from './translations/English'
import { GermanTranslations } from './translations/German'

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

export const supportedLanguages = [i18nLanguageCodes.English, i18nLanguageCodes.German]

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
    resources: {
      [i18nLanguageCodes.English]: {
        translation: {
          // here we will place our translations...
          ...EnglishTranslations,
        },
      },
      [i18nLanguageCodes.German]: {
        translation: {
          ...GermanTranslations,
        },
      },
    },
  })

export default i18n
