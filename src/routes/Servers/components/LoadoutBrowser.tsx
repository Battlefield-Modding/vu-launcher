import { deleteServerLoadout, getLoadoutNames, playVU, startServerLoadout } from '@/api'
import { Button } from '@/components/ui/button'
import { QueryKey, STALE } from '@/config/config'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Delete, Edit, Loader, Play } from 'lucide-react'
import { toast } from 'sonner'
import ServerSheet from './server-sheet'

function LoadoutBrowser() {
  const queryClient = useQueryClient()
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
        <div key={`${name}-${index}`} className="rounded-md border border-black bg-black p-4">
          <h1 className="mb-8 flex gap-4 text-xl">
            {name.length >= 15 ? `${name.substring(0, 15)}...` : name}
          </h1>

          <div className="flex gap-4">
            <Button
              variant={'destructive'}
              onClick={async () => {
                const wantToDelete = await confirm(`Are you sure you want to delete ${name}?`)
                if (wantToDelete) {
                  const status = await deleteServerLoadout(name)
                  if (status) {
                    toast('Deleted server loadout.')
                    queryClient.invalidateQueries({
                      queryKey: [QueryKey.ServerLoadouts],
                      refetchType: 'all',
                    })
                  } else {
                    toast('Something went wrong.')
                  }
                }
              }}
            >
              <Delete />
            </Button>
            <Button variant={'secondary'}>
              <Edit />
            </Button>
            <Button
              variant={'constructive'}
              onClick={async () => {
                let status = await startServerLoadout(name)
                if (status) {
                  toast('Started VU Server. Starting Client in 10 seconds...')
                  setTimeout(() => {
                    playVU('YOUR_SERVER_PASSWORD_HERE')
                  }, 10000)
                } else {
                  toast('Something went wrong starting VU Server...')
                }
              }}
            >
              <Play />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadoutBrowser
