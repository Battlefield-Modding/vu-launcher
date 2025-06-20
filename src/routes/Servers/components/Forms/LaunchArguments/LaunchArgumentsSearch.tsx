import { useTranslation } from 'react-i18next'

import { useEffect, useState } from 'react'
import { defaultLaunchArguments } from './setup/LaunchArguments'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

export function LaunchArgumentsSearch({
  searchRef,
  setFilteredArgs,
}: {
  searchRef: any
  setFilteredArgs: any
}) {
  const { t } = useTranslation()
  const [tabFilter, setTabFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  // @ts-expect-error
  const [translations, setTranslations] = useState(
    t('launchArgumentDescriptions', { returnObjects: true }),
  )

  useEffect(() => {
    const info = Object.keys(defaultLaunchArguments).map((x) => {
      if (tabFilter.length > 0) {
        if (tabFilter === x) {
          // @ts-ignore
          const filtered_fields = Object.keys(defaultLaunchArguments[x])
            .filter((key) =>
              // @ts-ignore
              translations[x][key].toLowerCase().includes(searchRef.current.value.toLowerCase()),
            )
            .reduce((obj, key) => {
              // @ts-ignore
              obj[key] = defaultLaunchArguments[x][key]
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
        const filtered_fields = Object.keys(defaultLaunchArguments[x])
          .filter((key) =>
            // @ts-ignore
            translations[x][key].toLowerCase().includes(searchRef.current.value.toLowerCase()),
          )
          .reduce((obj, key) => {
            // @ts-ignore
            obj[key] = defaultLaunchArguments[x][key]
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
    <div className="fixed top-0">
      <input
        type="text"
        placeholder={`${t('servers.loadouts.loadout.launchArgs.form.searchPlaceholder')}     [CTRL + F]`}
        className="w-[720px] rounded-md border border-gray-500 bg-black p-2 focus:border-cyan-300 focus:outline-none focus:ring-0"
        onChange={handleChange}
        ref={searchRef}
      />

      <div className="flex justify-center">
        {Object.keys(defaultLaunchArguments).map((x) => (
          <Button
            variant={'secondary'}
            key={`LaunchArgumentButton-${x}`}
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
