import { Folder, Loader, Server, User } from 'lucide-react'
import {
  getServerLoadout,
  openExplorerAtLoadout,
  playVUOnLocalServer,
  startServerLoadout,
} from '@/api'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { ChooseAccountSheet } from '../Forms/AccountMultiSelect/AccountMultiSelectSheet'
import { ManageModsSheet } from '../ManageMods/ManageModsSheet'
import { EditLoadoutSheet } from '../Forms/Loadouts/EditLoadout/EditLoadoutSheet'
import { DeleteLoadoutDialog } from './DeleteLoadoutDialog'
import { StartupSheet } from '../Forms/Startup/StartupSheet'

export function Loadout({ loadout }: { loadout: LoadoutJSON }) {
  // const { isPending, isError, data, error } = useQuery({
  //   queryKey: [`${QueryKey.GetServerLoadout}-${name}`],
  //   queryFn: async () => {
  //     const data = await getServerLoadout(name)
  //     return data
  //   },
  //   staleTime: STALE.never,
  // })

  // if (isPending) {
  //   return (
  //     <div>
  //       <h1>Fetching Loadout {name}</h1>
  //       <Loader />
  //     </div>
  //   )
  // }

  // if (isError) {
  //   return (
  //     <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
  //       <h1>ERROR: No Loadouts Found</h1>
  //       <p>{error.message}</p>
  //     </div>
  //   )
  // }

  // if (!data) {
  //   return (
  //     <div className="rounded-md bg-secondary pl-2 pr-2 text-xl leading-9 text-black">
  //       <h1>No information found on loadout</h1>
  //       <p>This should never happen?</p>
  //     </div>
  //   )
  // }

  async function handlePlay() {
    let status = await startServerLoadout(loadout.name)
    if (status) {
      toast('Started VU Server. Starting Client in 1 second...')
      setTimeout(() => {
        playVUOnLocalServer(loadout.startup.vars.gamePassword ?? '')
      }, 1000)
    } else {
      toast(`Failed to start loadout: ${loadout.name}`)
    }
  }

  async function handleServer() {
    let status = await startServerLoadout(loadout.name)
    if (status) {
      toast('Started VU Server...')
    } else {
      toast(`Failed to start loadout: ${loadout.name}`)
    }
  }

  async function handleOpenExplorer() {
    toast(`Opened explorer for loadout: ${loadout.name}`)
    await openExplorerAtLoadout(loadout.name)
  }

  return (
    <div className="max-w-96 rounded-md border border-black bg-black p-4">
      <h1 className="mb-8 flex justify-between gap-2 text-xl">
        {loadout.name.length >= 15 ? `${loadout.name.substring(0, 15)}...` : loadout.name}
        <div className="flex gap-4">
          <StartupSheet existingLoadout={loadout} />
          <ManageModsSheet loadout={loadout} />
          <EditLoadoutSheet existingConfig={loadout} />
        </div>
      </h1>

      <div className="flex justify-between gap-4">
        <DeleteLoadoutDialog name={loadout.name} />
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
        <ChooseAccountSheet name={loadout.name} password={loadout.startup.admin.password ?? ''} />
      </div>
    </div>
  )
}
