import { getRandomNumber, playVU } from '@/api'
import { Button } from '@/components/ui/button'
import { DEFAULT_STALE_TIME, routes } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Download, Loader, Play, Server } from 'lucide-react'
import { toast } from 'sonner'
import { getCurrentWindow } from '@tauri-apps/api/window'
import CredentialsSheet from '@/components/credentials-sheet'
import { Link } from 'react-router'

export default function Home() {
  const { isPending, isError, data, error } = useQuery({
    queryKey: ['random-num'],
    queryFn: getRandomNumber,
    staleTime: DEFAULT_STALE_TIME,
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

  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center">
      <div className="m-auto flex h-[50vh] w-[50vw] flex-col justify-between gap-8 rounded-md bg-primary p-8">
        <Button
          variant={'secondary'}
          className="p-8 text-4xl"
          onClick={() => {
            toast('Starting VU...')
            playVU()
            setTimeout(() => {
              getCurrentWindow().minimize()
            }, 1500)
          }}
        >
          <Play />
          <p>Play</p>
        </Button>

        <div className="flex flex-wrap gap-1 rounded-md bg-secondary p-2">
          <CredentialsSheet />
          <Link to={routes.SERVERS}>
            <Button>
              Servers
              <Server />
            </Button>
          </Link>
          <Button>
            Install VU
            <Download />
          </Button>
        </div>
      </div>
    </div>
  )
}
