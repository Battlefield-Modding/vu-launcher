import { getAllLoadoutJson } from '@/api'
import { LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { Loadout } from './Loadout'
import { useState } from 'react'
import { DeleteLoadoutDialog } from './DeleteLoadoutDialog'
import { CreateLoadoutSheet } from '../Forms/CreateLoadout/CreateLoadoutSheet'
import { UploadLoadoutSheet } from '../Forms/UploadLoadout/UploadLoadoutSheet'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

export function LoadoutContainer() {
  const { t } = useTranslation()
  const [activeLoadout, setActiveLoadout] = useState<LoadoutJSON | null>(null)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetAllLoadoutJSON],
    queryFn: getAllLoadoutJson,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>{t('servers.loadouts.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('servers.loadouts.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('servers.loadouts.error')}</h1>
      </div>
    )
  }

  if (data.length > 0) {
    return (
      <div className="m-auto mt-0 flex w-full flex-1">
        <div className="flex w-64 flex-col border border-b-0 border-l-0 border-secondary bg-secondary">
          {data.map((loadout, index) => (
            <div
              key={`${loadout.name}-${index}`}
              className={clsx(
                'flex items-center justify-between bg-secondary hover:cursor-pointer hover:bg-black/80',
                (activeLoadout?.name === loadout.name ||
                  (!activeLoadout && data[0].name === loadout.name)) &&
                  'bg-black/60',
              )}
            >
              <div
                onClick={() => {
                  setActiveLoadout(() => loadout)
                }}
                className="flex-1 p-2"
              >
                <p>{loadout.name}</p>
              </div>
              <DeleteLoadoutDialog
                name={loadout.name}
                setActiveLoadout={setActiveLoadout}
                shouldRefreshActiveLoadout={
                  loadout.name === activeLoadout?.name || loadout.name === data[0].name
                }
              />
            </div>
          ))}
          <div className="mb-0 mt-auto flex">
            <CreateLoadoutSheet />
            <UploadLoadoutSheet />
          </div>
        </div>
        <div className="flex w-full">
          {data.length > 0 && <Loadout loadout={activeLoadout ?? data[0]} />}
        </div>
      </div>
    )
  } else {
    return (
      <div className="m-auto mt-0 flex w-full flex-1">
        <div className="flex w-64 flex-col border border-b-0 border-l-0 border-secondary bg-secondary">
          <div className="mb-0 mt-auto flex">
            <CreateLoadoutSheet />
            <UploadLoadoutSheet />
          </div>
        </div>
        <div className="flex w-full flex-col items-center justify-center">
          <p>{t('servers.loadouts.error')}</p>
        </div>
      </div>
    )
  }
}
