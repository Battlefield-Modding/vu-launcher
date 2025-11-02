import { useTranslation } from 'react-i18next'

import { useEffect, useState } from 'react'
import { defaultStartupArguments } from './Setup/DefaultStartupConfig'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

export function StartupSearch({
  searchRef,
  setFilteredArgs,
}: {
  searchRef: any
  setFilteredArgs: any
}) {
  const { t } = useTranslation()
  const [tabFilter, setTabFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  // @ts-ignore
  const [translations, setTranslations] = useState(
    t('startupDescriptions', { returnObjects: true }),
  )

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    const info = Object.keys(defaultStartupArguments).map((x) => {
      if (tabFilter.length > 0) {
        if (tabFilter === x) {
          // @ts-ignore
          const filtered_fields = Object.keys(defaultStartupArguments[x])
            .filter((key) => {
              // @ts-ignore
              if (translations[x] && translations[x][key]) {
                // @ts-ignore
                return translations[x][key]
                  .toLowerCase()
                  .includes(searchRef.current.value.toLowerCase())
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
        } else {
          return {
            name: x,
            values: undefined,
          }
        }
      } else {
        // @ts-ignore
        const filtered_fields = Object.keys(defaultStartupArguments[x])
          .filter((key) => {
            // @ts-ignore
            if (translations[x] && translations[x][key]) {
              // @ts-ignore
              return translations[x][key]
                .toLowerCase()
                .includes(searchRef.current.value.toLowerCase())
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
      }
    })

    const combinedObject = {}
    info.forEach((x) => {
      // @ts-ignore
      combinedObject[x.name] = x.values
    })

    setFilteredArgs(() => combinedObject)
  }, [searchQuery, tabFilter])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(() => e.target.value)
  }

  return (
    <div
      className={clsx(
        "ease-out' transition-all duration-700",
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <input
        type="text"
        placeholder={`${t('servers.loadouts.loadout.startup.form.searchPlaceholder')}     [CTRL + F]`}
        className="w-[720px] rounded-md border border-gray-500 bg-black p-2 focus:border-cyan-300 focus:outline-none focus:ring-0"
        onChange={handleChange}
        ref={searchRef}
      />
      <div className="flex justify-center">
        {Object.keys(defaultStartupArguments).map((x) => (
          <Button
            variant={'secondary'}
            key={`StartupArgumentButton-${x}`}
            className={clsx('pb-0 pt-0', tabFilter === x && 'bg-cyan-700 hover:bg-cyan-700/80')}
            onClick={(e) => {
              e.preventDefault()
              if (tabFilter === x) {
                setTabFilter(() => '')
                searchRef.current?.parentNode?.parentNode?.parentNode?.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              } else {
                setTabFilter(() => x)
                searchRef.current?.parentNode?.parentNode?.parentNode?.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                })
              }
            }}
          >
            {x}
          </Button>
        ))}
      </div>
    </div>
  )
}
