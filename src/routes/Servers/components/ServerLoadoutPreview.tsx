import EditServerSheet from './EditServerSheet'
import { Button } from '@/components/ui/button'
import { Folder, Loader, Play, Trash } from 'lucide-react'
import {
  deleteServerLoadout,
  getServerLoadout,
  openExplorerAtLoadout,
  playVU,
  startServerLoadout,
} from '@/api'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'

function ServerLoadoutPreview({ name, index }: { name: string; index: number }) {
  const queryClient = useQueryClient()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [`${QueryKey.GetServerLoadout}-${name}`],
    queryFn: async () => {
      const data = await getServerLoadout(name)
      return data
    },
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Fetching Loadout {name}</h1>
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

  function getServerPassword() {
    let finalPassword = ''
    const startupFileContent = data.startup as string
    const positionOfPassword = startupFileContent.indexOf('vars.gamePassword')

    const passwordLine = startupFileContent
      .substring(positionOfPassword, startupFileContent.length)
      .split('\n')[0]

    if (passwordLine.indexOf(' ') !== -1) {
      const passwordWithQuotesMaybe = passwordLine.split(' ')[1]
      finalPassword = passwordWithQuotesMaybe
      if (passwordWithQuotesMaybe.indexOf('"') !== -1) {
        const splitPassword = passwordWithQuotesMaybe.split('"')
        finalPassword = splitPassword[1]
      } else {
        finalPassword = passwordWithQuotesMaybe
      }
    } else {
      toast(`Password in [${name}] startup needs a space`)
    }

    return finalPassword
  }

  async function handleDelete() {
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
        toast(`Failed to delete loadout: ${name}`)
      }
    }
  }

  async function handlePlay() {
    let status = await startServerLoadout(name)
    if (status) {
      toast('Started VU Server. Starting Client in 10 seconds...')
      setTimeout(() => {
        playVU(getServerPassword())
      }, 10000)
    } else {
      toast(`Failed to start loadout: ${name}`)
    }
  }

  async function handleOpenExplorer() {
    toast(`Opened explorer for loadout: ${name}`)
    await openExplorerAtLoadout(name)
  }

  return (
    <div className="max-w-96 rounded-md border border-black bg-black p-4">
      <h1 className="mb-8 flex justify-between text-xl">
        {name.length >= 15 ? `${name.substring(0, 15)}...` : name}
        <EditServerSheet name={name} data={data} />
      </h1>

      <div className="flex justify-between gap-4">
        <Button variant={'destructive'} onClick={handleDelete}>
          <Trash />
        </Button>
        <Button variant={'secondary'} onClick={handleOpenExplorer}>
          <Folder />
        </Button>
        <Button variant={'constructive'} onClick={handlePlay} className="flex-1">
          <Play />
        </Button>
      </div>
    </div>
  )
}

export default ServerLoadoutPreview
