import { getAllLoadoutNames } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { CreateLoadoutSheet } from '../Forms/CreateLoadout/CreateLoadoutSheet'
import { UploadLoadoutSheet } from '../Forms/UploadLoadout/UploadLoadoutSheet'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Outlet, useNavigate, useParams } from 'react-router'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LoadoutContainer() {
  const { t } = useTranslation()
  const params = useParams()
  const navigate = useNavigate()

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
    <div className="flex h-full flex-col items-center">
      <div className="mt-16">
        <Select
          onValueChange={(e) => {
            navigate(`./${e}`)
          }}
        >
          <SelectTrigger className="w-fit">
            <SelectValue placeholder={params.loadoutName ?? 'Choose Loadout'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Active Loadout</SelectLabel>
              {data.map((loadoutName, index) => (
                <SelectItem
                  key={`${loadoutName}-${index}`}
                  value={loadoutName}
                  className={clsx(
                    'flex items-center justify-between hover:cursor-pointer hover:bg-black/60',
                    params.loadoutName === loadoutName && 'bg-black/80',
                  )}
                >
                  {loadoutName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="m-auto flex w-full">
        <Outlet />
      </div>

      <div className="mb-0">
        <CreateLoadoutSheet />
        <UploadLoadoutSheet />
      </div>
    </div>
  )
}
