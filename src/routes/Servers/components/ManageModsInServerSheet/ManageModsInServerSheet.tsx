import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { Book, Loader } from 'lucide-react'
import { useState } from 'react'
import { getModNamesInCache, getModNamesInLoadout } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { LoadoutMod } from './mods/LoadoutMod'
import { ModCacheMod } from './mods/ModCacheMod'
import { useTranslation } from 'react-i18next'

export function ManageModsInServerSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

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
        <h1>{t('servers.loadouts.loadout.mods.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('servers.loadouts.loadout.mods.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-md bg-secondary pl-2 pr-2 text-xl leading-9 text-primary">
        <h1>{t('servers.loadouts.loadout.mods.empty')}</h1>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex w-fit items-center gap-2 rounded-md bg-secondary p-2 text-xl text-primary hover:bg-secondary/80">
          {t('servers.loadouts.loadout.mods.sheet.trigger')}
          <Book />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <div className="m-auto flex max-w-screen-lg flex-col gap-8">
          <div>
            <SheetTitle>
              <code className="underline">{loadout.name}</code>
            </SheetTitle>
            <div className="flex flex-wrap gap-4">
              {data.modsInLoadout.map((x) => {
                return (
                  <LoadoutMod
                    loadout={loadout}
                    modName={x}
                    queryKey={`${QueryKey.GetAllModNames}-${loadout.name}`}
                    isActive={loadout.modlist?.includes(x) || false}
                    key={`${x}-mod`}
                  />
                )
              })}
            </div>
          </div>

          <div>
            <SheetTitle>
              <p>
                <code className="underline">
                  {t('servers.loadouts.loadout.mods.sheet.modCache')}
                </code>
              </p>
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
