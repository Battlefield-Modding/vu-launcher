import { Loader } from 'lucide-react'
import { QueryKey, STALE } from '@/config/config'
import { serverKeyExists } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { FirstTimeSetup } from './components/Forms/FirstTimeSetup/FirstTimeSetup'
import { LoadoutContainer } from './components/Loadouts/LoadoutContainer'

export function Servers() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.ServerKeyExists],
    queryFn: serverKeyExists,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Checking for Server Key</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>ERROR: No Server Key</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return <FirstTimeSetup />
  }

  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center">
      <LoadoutContainer />
    </div>
  )
}
