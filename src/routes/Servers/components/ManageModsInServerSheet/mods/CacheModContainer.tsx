import { SheetTitle } from '@/components/ui/sheet'
import { GameMod, LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { Loader } from 'lucide-react'
import { getModNamesInCache } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { ModCacheMod } from './ModCacheMod'
import { useTranslation } from 'react-i18next'

export function CacheModContainer({ loadout }: { loadout: LoadoutJSON }) {
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetModNamesInCache],
    queryFn: async (): Promise<GameMod[]> => {
      const modsInCache = await getModNamesInCache()

      return modsInCache
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

  console.log(data)

  return (
    <div>
      <SheetTitle>
        <p>
          <code className="underline">{t('servers.loadouts.loadout.mods.sheet.modCache')}</code>
        </p>
      </SheetTitle>
      <div>
        {data.map((x, index) => {
          return (
            <ModCacheMod
              queryKey={`${QueryKey.GetAllModNames}-${loadout.name}`}
              loadout={loadout}
              mod={x}
              key={`${x}-cacheMod-${index}`}
            />
          )
        })}
      </div>
    </div>
  )
}
