import { useTranslation } from 'react-i18next'

import en from '@/i18n/locales/en/translation.json'
import de from '@/i18n/locales/de/translation.json'
import zh from '@/i18n/locales/zh/translation.json'
import ru from '@/i18n/locales/zh/translation.json'
import { useState } from 'react'
import { i18nLanguageCodes } from '@/i18n/config'
import { defaultStartupArguments } from './Setup/DefaultStartupConfig'

const languageCodeToTranslation = {
  [i18nLanguageCodes.Chinese]: {
    ...zh.startupDescriptions,
  },
  [i18nLanguageCodes.English]: {
    ...en.startupDescriptions,
  },
  [i18nLanguageCodes.German]: {
    ...de.startupDescriptions,
  },
  [i18nLanguageCodes.Russian]: {
    ...ru.startupDescriptions,
  },
} as const

type StartupTranslation = typeof languageCodeToTranslation

export function StartupSearch({
  searchRef,
  setFilteredArgs,
}: {
  searchRef: any
  setFilteredArgs: any
}) {
  const { i18n, t } = useTranslation()
  const { language } = i18n
  const [translations, setTranslations] = useState(
    languageCodeToTranslation[language as keyof StartupTranslation],
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const info = Object.keys(defaultStartupArguments).map((x) => {
      // @ts-ignore
      const filtered_fields = Object.keys(defaultStartupArguments[x])
        .filter((key) => {
          if (translations[x] && translations[x][key]) {
            return translations[x][key].toLowerCase().includes(e.target.value.toLowerCase())
          }
        })
        .reduce((obj, key) => {
          // @ts-ignore
          obj[key] = defaultStartupArguments[x][key]
          return obj
        }, {})

      return {
        name: x,
        values: filtered_fields,
      }
    })

    const combinedObject = {}
    info.forEach((x) => {
      // @ts-ignore
      combinedObject[x.name] = x.values
    })

    setFilteredArgs(() => combinedObject)
  }

  return (
    <input
      type="text"
      placeholder={`${t('servers.loadouts.loadout.startup.form.searchPlaceholder')}     [CTRL + F]`}
      className="fixed top-0 w-[720px] rounded-md border border-gray-500 bg-black p-2 focus:border-cyan-300 focus:outline-none focus:ring-0"
      onChange={handleChange}
      ref={searchRef}
    />
  )
}
