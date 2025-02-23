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
    queryKey: [QueryKey.GetAllModNames],
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
    return (
      <div className="rounded-md bg-secondary pl-2 pr-2 text-xl leading-9 text-primary">
        <h1>No mods found</h1>
        <p>Once you download some mods they will appear here?</p>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-gray-600 p-4 text-white hover:bg-gray-600/80">
          Manage Mods <Book />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader className="hidden">
          <SheetTitle>Installed Mods Appear Here</SheetTitle>
        </SheetHeader>

        <div className="m-auto flex max-w-screen-lg flex-col gap-8">
          {data.map((loadout, outerIndex) => {
            if (loadout.mods?.length > 0) {
              return (
                <div
                  className={clsx('rounded-md bg-black p-4')}
                  key={`mod-deletion-container_${loadout.name}`}
                >
                  <SheetTitle>
                    <p>Mods inside</p>
                    <code className="underline">{loadout.name}</code>
                  </SheetTitle>
                  <div className="flex flex-wrap gap-4">
                    {loadout.mods.map((modName, modIndex) => (
                      <Mod
                        modName={modName}
                        loadoutName={loadout.name}
                        key={`${modName}-${outerIndex}-${modIndex}`}
                      />
                    ))}
                  </div>
                </div>
              )
            }
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
