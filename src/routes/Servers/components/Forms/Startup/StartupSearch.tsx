import { useTranslation } from 'react-i18next'

import { useState } from 'react'
import { defaultStartupArguments } from './Setup/DefaultStartupConfig'

export function StartupSearch({
  searchRef,
  setFilteredArgs,
}: {
  searchRef: any
  setFilteredArgs: any
}) {
  const { t } = useTranslation()
  const [translations, setTranslations] = useState(
    t('startupDescriptions', { returnObjects: true }),
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
