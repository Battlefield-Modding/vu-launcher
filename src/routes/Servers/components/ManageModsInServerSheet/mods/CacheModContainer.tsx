import { GameMod, LoadoutJSON, QueryKey, routes, STALE } from '@/config/config'
import { Loader } from 'lucide-react'
import { getModNamesInCache } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { ModCacheMod } from './ModCacheMod'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

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

  return (
    <>
      {data.length == 0 && (
        <div className="flex items-center gap-4">
          <h1>{t('servers.loadouts.loadout.mods.sheet.noMods')}</h1>
          <Link to={routes.MODS}>
            <Button variant={'outline'}>{t('sidebar.routes.mods')}</Button>
          </Link>
        </div>
      )}
      <table className="text-center">
        <tr className="border border-secondary">
          <th className="h-auto border border-secondary">
            {t('servers.loadouts.loadout.mods.tableHeaderOneCacheMod')}
          </th>
          <th className="h-auto border border-secondary">
            {t('servers.loadouts.loadout.mods.tableHeaderTwo')}
          </th>
          <th className="h-auto border border-secondary">
            {t('servers.loadouts.loadout.mods.tableHeaderThree')}
          </th>
          <th className="h-auto border border-secondary">
            {t('servers.loadouts.loadout.mods.tableHeaderFour')}
          </th>
        </tr>
        {data.map((x, index) => {
          return (
            <ModCacheMod
              queryKey={`${QueryKey.GetAllModNames}-${loadout.name}`}
              loadout={loadout}
              mod={x}
              key={`${x.name}-cacheMod-${index}`}
            />
          )
        })}
      </table>
    </>
  )
}
