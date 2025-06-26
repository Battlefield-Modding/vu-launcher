import { SheetTitle } from '@/components/ui/sheet'
import { GameMod, LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { Loader } from 'lucide-react'
import { getModNamesInLoadout } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { LoadoutMod } from './LoadoutMod'
import { useTranslation } from 'react-i18next'

export function LoadoutModContainer({ loadout }: { loadout: LoadoutJSON }) {
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [`${QueryKey.GetAllModNames}-${loadout.name}`],
    queryFn: async (): Promise<GameMod[]> => {
      const modsInLoadout = await getModNamesInLoadout(loadout.name)

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
    <div>
      <div>
        <SheetTitle>
          <code className="underline">{loadout.name}</code>
        </SheetTitle>
        <div>
          {data.map((x, index) => {
            return (
              <LoadoutMod
                loadout={loadout}
                mod={x}
                queryKey={`${QueryKey.GetAllModNames}-${loadout.name}`}
                isActive={x.enabled}
                key={`${x.name}-loadoutMod-${index}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
