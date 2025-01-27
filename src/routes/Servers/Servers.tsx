import { Loader } from 'lucide-react'
import { QueryKey, STALE } from '@/config/config'
import { getAllLoadoutJson, serverKeyExists } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { FirstTimeSetup } from './components/Forms/FirstTimeSetup/FirstTimeSetup'
import { CreateLoadoutSheet } from './components/Forms/Loadouts/CreateLoadout/CreateLoadoutSheet'
import { UploadLoadoutSheet } from './components/Forms/Loadouts/UploadLoadout/UploadLoadoutSheet'
import { StartupSheet } from './components/Forms/Startup/StartupSheet'
import { LoadoutContainer } from './components/Loadouts/LoadoutContainer'
import { Button } from '@/components/ui/button'
import { MaplistSheet } from './components/Forms/Maplist/MaplistSheet'

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
      <div className="m-auto mb-0 mt-0 flex w-full justify-center gap-4 rounded-md bg-primary p-8">
        <CreateLoadoutSheet />
        <UploadLoadoutSheet />
      </div>
      <div className="m-auto mt-0 w-full">
        <StartupSheet />
        <MaplistSheet />
        <LoadoutContainer />

        {/* TODO: Remove this test button */}
        <Button
          variant={'secondary'}
          onClick={async () => {
            const info = await getAllLoadoutJson()
            console.log(info)
          }}
        >
          GetAllLoadoutJSON
        </Button>
      </div>
    </div>
  )
}
