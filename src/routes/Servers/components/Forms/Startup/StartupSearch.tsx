import { useTranslation } from 'react-i18next'

import { EnglishTranslations } from '@/translations/English'
import { GermanTranslations } from '@/translations/German'
import { ChineseTranslations } from '@/translations/Chinese'
import { useState } from 'react'
import { i18nLanguageCodes } from '@/i18n'
import { defaultStartupArguments } from './Setup/DefaultStartupConfig'

const languageCodeToTranslation = {
  [i18nLanguageCodes.Chinese]: {
    ...ChineseTranslations.startupDescriptions,
  },
  [i18nLanguageCodes.English]: {
    ...EnglishTranslations.startupDescriptions,
  },
  [i18nLanguageCodes.German]: {
    ...GermanTranslations.startupDescriptions,
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
  const { i18n } = useTranslation()
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
            return translations[x][key].toLowerCase().includes(e.target.value)
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
      placeholder={`Search Startup Config     [CTRL + F]`}
      className="fixed top-0 w-[720px] rounded-md border border-gray-500 bg-black p-2 focus:border-cyan-300 focus:outline-none focus:ring-0"
      onChange={handleChange}
      ref={searchRef}
    />
  )
}
