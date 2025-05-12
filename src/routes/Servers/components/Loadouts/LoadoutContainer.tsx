import { getAllLoadoutNames } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { DeleteLoadoutDialog } from './DeleteLoadoutDialog'
import { CreateLoadoutSheet } from '../Forms/CreateLoadout/CreateLoadoutSheet'
import { UploadLoadoutSheet } from '../Forms/UploadLoadout/UploadLoadoutSheet'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Link, Outlet, useParams } from 'react-router'

export function LoadoutContainer() {
  const { t } = useTranslation()
  const params = useParams()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetAllLoadoutNames],
    queryFn: getAllLoadoutNames,
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

  return (
    <div className="m-auto mt-0 flex w-full flex-1">
      <div className="flex w-64 flex-col border border-b-0 border-l-0 border-secondary bg-secondary">
        {data.map((loadoutName, index) => (
          <div
            key={`${loadoutName}-${index}`}
            className={clsx(
              'flex items-center justify-between hover:cursor-pointer hover:bg-black/60',
              params.loadoutName === loadoutName && 'bg-black/80',
            )}
          >
            <Link to={`./${loadoutName}`} className="flex-1 p-2" viewTransition>
              <p>{loadoutName}</p>
            </Link>
            <DeleteLoadoutDialog name={loadoutName} />
          </div>
        ))}
        <div className="mb-0 mt-auto flex">
          <CreateLoadoutSheet />
          <UploadLoadoutSheet />
        </div>
      </div>
      <div className="flex w-full">
        <Outlet />
      </div>
    </div>
  )
}
