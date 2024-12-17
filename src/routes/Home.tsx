import { getUserPreferences, getUsers, playVU, vuIsInstalled } from '@/api'
import { Button } from '@/components/ui/button'
import { STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Download, Loader, Play, Search } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentWindow } from '@tauri-apps/api/window'
import CredentialsSheet from '@/components/credentials-sheet'
import AppSelectUser from '@/components/app-select-user'

export default function Home() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['vu-is-installed'],
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

  // TODO: Remove the ! after building is done
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
              playVU()
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
        <div className="m-auto flex max-h-96 max-w-96 flex-col justify-between gap-8 rounded-md bg-primary p-8">
          <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9 text-white">
            <h1 className="flex-1">VU is installed?</h1>
            <Button variant={'secondary'}>
              <Search /> Find VU
            </Button>
          </div>

          <div className="flex flex-1 justify-center gap-4 align-middle text-xl leading-9">
            <h1 className="flex-1 text-white">VU not installed?</h1>
            <Button
              variant={'secondary'}
              className=""
              onClick={() => {
                toast('Downloading VU...')
                // downloadVU
              }}
            >
              <Download size={'10px'} />
              <p>Download VU</p>
            </Button>
          </div>

          <Button variant={'destructive'} className="flex p-8 text-2xl" disabled>
            <Play />
            PLAY
          </Button>
        </div>
      </div>
    )
  }
  console.log(data)
}
