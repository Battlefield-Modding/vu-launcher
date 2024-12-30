import { Button } from '@/components/ui/button'
import { Edit, Loader, Plus } from 'lucide-react'
import ServerSheet from './components/server-sheet'
import LoadoutBrowser from './components/LoadoutBrowser'
import { QueryKey, STALE } from '@/config/config'
import { getLoadoutNames } from '@/api'
import { useQuery } from '@tanstack/react-query'

export default function Servers() {
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
  // if no server loadouts found
  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center">
      <div className="m-auto mb-0 mt-8 rounded-md bg-primary p-8">
        <ServerSheet />
      </div>
      <div className="m-auto mt-0">
        <LoadoutBrowser loadouts={data as String[]} />
      </div>
    </div>
  )
}
