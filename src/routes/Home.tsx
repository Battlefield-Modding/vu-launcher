import { playVU, vuIsInstalled } from '@/api'
import { Button } from '@/components/ui/button'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader, Play } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentWindow } from '@tauri-apps/api/window'
import CredentialsSheet from '@/components/credentials-sheet'
import AppSelectUser from '@/components/app-select-user'
import InstallVU from '@/components/InstallVU'

export default function Home() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.IsVuInstalled],
    queryFn: vuIsInstalled,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Home Route LOADING</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div>
        <h1>Home Route Error</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  const vuInstalled = data

  if (vuInstalled) {
    return (
      <div className="m-auto flex min-h-[100vh] flex-col justify-center">
        <div className="m-auto flex max-h-96 max-w-96 flex-col justify-between gap-8 rounded-md bg-primary p-8">
          <div className="flex flex-1 flex-wrap gap-1 rounded-md bg-secondary p-2">
            <CredentialsSheet />

            <AppSelectUser />
          </div>

          <Button
            variant={'constructive'}
            className="p-8 text-2xl"
            onClick={() => {
              toast('Starting VU...')
              playVU('')
              setTimeout(() => {
                getCurrentWindow().minimize()
              }, 1500)
            }}
          >
            <Play />
            PLAY
          </Button>
        </div>
      </div>
    )
  } else {
    return (
      <div className="m-auto flex min-h-[100vh] flex-col justify-center">
        <InstallVU />
      </div>
    )
  }
}
