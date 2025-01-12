import { getLoadoutNames, getModNamesInCache, getModNamesInLoadout } from '@/api'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Book, Loader } from 'lucide-react'
import { useState } from 'react'
import Mod from './Mod'
import clsx from 'clsx'

export default function ManageModsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetModNamesInCache],
    queryFn: async (): Promise<Array<{ name: string; mods: string[] }>> => {
      const modsArray = []

      const modsInCache = await getModNamesInCache()
      modsArray.push({
        name: 'mod-cache',
        mods: modsInCache,
      })

      const loadoutNames = await getLoadoutNames()
      for (const loadout of loadoutNames) {
        const mods = await getModNamesInLoadout(loadout)
        modsArray.push({
          name: loadout,
          mods,
        })
      }

      return modsArray
    },
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Fetching Server Loadouts</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>ERROR: No Loadouts Found</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return <></>
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-gray-600 p-4 text-white hover:bg-gray-600/80">
          Manage Mods <Book />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader></SheetHeader>

        <div className="flex h-full w-full flex-wrap gap-16">
          {data.map((loadout, outerIndex) => {
            if (loadout.mods?.length > 0) {
              return (
                <div
                  className={clsx(
                    'max-w-64 rounded-md',
                    loadout.name === 'mod-cache' ? 'bg-red-300 p-4' : 'bg-gray-300 p-4',
                  )}
                  key={`mod-deletion-container_${loadout.name}`}
                >
                  <SheetTitle className="underline">
                    Mods inside <code>{loadout.name}</code>
                  </SheetTitle>
                  {loadout.mods.map((modName, modIndex) => (
                    <Mod
                      modName={modName}
                      loadoutName={loadout.name}
                      key={`${modName}-${outerIndex}-${modIndex}`}
                    />
                  ))}
                </div>
              )
            }
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
