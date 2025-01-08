import EditLoadoutSheet from './LoadoutSheet/EditLoadoutSheet'
import { Folder, Loader, Server, User } from 'lucide-react'
import { getServerLoadout, openExplorerAtLoadout, playVU, startServerLoadout } from '@/api'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import DeleteLoadoutDialog from './DeleteLoadoutDialog'
import ChooseAccountSheet from './ChooseAccountSheet/ChooseAccountSheet'

function ServerLoadoutPreview({ name }: { name: string }) {
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
        <p>{error.message}</p>
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

  async function handlePlay() {
    let status = await startServerLoadout(name)
    if (status) {
      toast('Started VU Server. Starting Client in 1 second...')
      setTimeout(() => {
        playVU(getServerPassword())
      }, 1000)
    } else {
      toast(`Failed to start loadout: ${name}`)
    }
  }

  async function handleServer() {
    let status = await startServerLoadout(name)
    if (status) {
      toast('Started VU Server...')
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
        <EditLoadoutSheet data={data} />
      </h1>

      <div className="flex justify-between gap-4">
        <DeleteLoadoutDialog name={name} />
        <div
          className="rounded-md bg-secondary p-1.5 text-primary hover:cursor-pointer hover:bg-secondary/80"
          onClick={handleOpenExplorer}
        >
          <Folder />
        </div>
        <div
          onClick={handleServer}
          className="flex rounded-md bg-green-800 p-1.5 hover:cursor-pointer hover:bg-green-800/80"
        >
          <Server />
        </div>
        <div
          onClick={handlePlay}
          className="flex rounded-md bg-green-600 p-1.5 hover:cursor-pointer hover:bg-green-600/80"
        >
          <Server />
          <User />
        </div>
        <ChooseAccountSheet name={name} getServerPassword={getServerPassword} />
      </div>
    </div>
  )
}

export default ServerLoadoutPreview
