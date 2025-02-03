import { getAllLoadoutJson } from '@/api'
import { LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { Loadout } from './Loadout'
import { useState } from 'react'
import { DeleteLoadoutDialog } from './DeleteLoadoutDialog'
import { CreateLoadoutSheet } from '../Forms/Loadouts/CreateLoadout/CreateLoadoutSheet'
import { UploadLoadoutSheet } from '../Forms/Loadouts/UploadLoadout/UploadLoadoutSheet'
import clsx from 'clsx'

export function LoadoutContainer() {
  const [activeLoadout, setActiveLoadout] = useState<LoadoutJSON | null>(null)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetAllLoadoutJSON],
    queryFn: getAllLoadoutJson,
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
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>No Loadouts Found</h1>
        <p>Create a loadout and it will appear here.</p>
      </div>
    )
  }

  if (data.length > 0) {
    return (
      <div className="m-auto mt-0 flex w-full flex-1">
        <div className="flex w-64 flex-col border border-b-0 border-l-0 border-primary bg-sidebar-foreground text-white">
          {data.map((loadout, index) => (
            <div
              key={`${loadout.name}-${index}`}
              className={clsx(
                'flex items-center justify-between bg-primary hover:cursor-pointer hover:bg-primary/80',
                (activeLoadout?.name === loadout.name ||
                  (!activeLoadout && data[0].name === loadout.name)) &&
                  'bg-primary/60',
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
        <div className="flex w-64 flex-col bg-sidebar-foreground text-white">
          <div className="mb-0 mt-auto flex">
            <CreateLoadoutSheet />
            <UploadLoadoutSheet />
          </div>
        </div>
        <div className="flex w-full flex-col justify-center bg-primary text-center text-secondary">
          <p>No loadouts Found</p>
        </div>
      </div>
    )
  }
}
