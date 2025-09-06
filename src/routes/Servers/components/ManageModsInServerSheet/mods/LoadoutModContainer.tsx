import { GameMod, QueryKey, STALE } from '@/config/config'
import { Loader } from 'lucide-react'
import { getModNamesInLoadout } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { LoadoutMod } from './LoadoutMod'
import { useTranslation } from 'react-i18next'

export function LoadoutModContainer({ loadoutName }: { loadoutName: string }) {
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [`${QueryKey.GetAllModNames}-${loadoutName}`],
    queryFn: async (): Promise<GameMod[]> => {
      const modsInLoadout = await getModNamesInLoadout(loadoutName)

      return modsInLoadout
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
    <table className="text-center">
      <tbody>
        <tr className="border border-secondary">
          <th className="h-auto border border-secondary">
            {t('servers.loadouts.loadout.mods.tableHeaderOne')}
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
            <LoadoutMod
              loadoutName={loadoutName}
              mod={x}
              queryKey={`${QueryKey.GetAllModNames}-${loadoutName}`}
              isActive={x.enabled}
              key={`${x.name}-loadoutMod-${index}`}
            />
          )
        })}
      </tbody>
    </table>
  )
}
