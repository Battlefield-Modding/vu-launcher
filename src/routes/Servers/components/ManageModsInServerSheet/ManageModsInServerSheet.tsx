import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { Book, Loader } from 'lucide-react'
import { useState } from 'react'
import { getModNamesInCache, getModNamesInLoadout } from '@/api'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { LoadoutMod } from './mods/LoadoutMod'
import { ModCacheMod } from './mods/ModCacheMod'

export function ManageModsInServerSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [`${QueryKey.GetAllModNames}-${loadout.name}`],
    queryFn: async (): Promise<{ modsInCache: string[]; modsInLoadout: string[] }> => {
      const modsInLoadout = await getModNamesInLoadout(loadout.name)
      const modsInCache = await getModNamesInCache()

      const modInfo = {
        modsInCache,
        modsInLoadout,
      }

      return modInfo
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
        <div className="flex w-fit items-center gap-2 rounded-md bg-secondary p-2 text-xl text-primary hover:bg-secondary/80">
          Mods
          <Book />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <div className="flex flex-col gap-8 text-primary">
          <div className={clsx('rounded-md bg-gray-300 p-4')}>
            <SheetTitle className="text-primary">
              <p>Mods inside</p>
              <code className="underline">{loadout.name}</code>
            </SheetTitle>
            <div className="flex flex-wrap gap-4">
              {data.modsInLoadout.map((x) => {
                return (
                  <LoadoutMod
                    loadout={loadout}
                    modName={x}
                    loadoutName={loadout.name}
                    queryKey={`${QueryKey.GetAllModNames}-${loadout.name}`}
                    isActive={loadout.modlist?.includes(x)}
                    key={`${x}-mod`}
                  />
                )
              })}
            </div>
          </div>

          <div className={clsx('rounded-md bg-gray-300 p-4')}>
            <SheetTitle className="text-primary">
              <p>Mods inside</p>
              <code className="underline">mod-cache</code>
            </SheetTitle>
            <div className="flex flex-wrap gap-4">
              {data.modsInCache.map((x) => {
                return (
                  <ModCacheMod
                    queryKey={`${QueryKey.GetAllModNames}-${loadout.name}`}
                    loadout={loadout}
                    modName={x}
                    key={`${x}-mod`}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
