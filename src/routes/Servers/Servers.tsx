import { Loader } from 'lucide-react'
import LoadoutSheet from './components/LoadoutSheet/LoadoutSheet'
import LoadoutBrowser from './components/Loadouts/LoadoutContainer'
import { QueryKey, STALE } from '@/config/config'
import { serverKeyExists } from '@/api'
import { useQuery } from '@tanstack/react-query'
import FirstTimeSetup from './components/FirstTimeSetup'
import LoadoutUploadSheet from './components/LoadoutUploadSheet/LoadoutUploadSheet'

export default function Servers() {
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
      <div className="m-auto mb-0 mt-0 flex w-full justify-center gap-4 rounded-md bg-primary p-8">
        <LoadoutSheet />
        <LoadoutUploadSheet />
      </div>
      <div className="m-auto mt-0 w-full">
        <LoadoutBrowser />
      </div>
    </div>
  )
}
