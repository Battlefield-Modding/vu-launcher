import { getLoadoutNames } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import { Loadout } from './Loadout'

export function LoadoutContainer() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.ServerLoadouts],
    queryFn: getLoadoutNames,
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
  return (
    <div className="m- flex w-full flex-wrap justify-center gap-4 p-8 text-white">
      {data.map((name, index) => (
        <Loadout name={name} key={`${name}-${index}`} />
      ))}
    </div>
  )
}
