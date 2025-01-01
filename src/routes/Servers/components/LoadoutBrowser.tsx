import { getLoadoutNames } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'
import ServerLoadoutPreview from './ServerLoadoutPreview'

function LoadoutBrowser() {
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
      </div>
    )
  }

  if (!data) {
    return <></>
  }
  return (
    <div className="grid grid-cols-2 gap-8 p-8 text-white">
      {data.map((name, index) => (
        <ServerLoadoutPreview name={name} index={index} key={`${name}-${index}`} />
      ))}
    </div>
  )
}

export default LoadoutBrowser
