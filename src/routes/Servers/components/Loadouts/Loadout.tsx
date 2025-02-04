import { Folder, Server, User } from 'lucide-react'
import { openExplorerAtLoadout, playVUOnLocalServer, startServerLoadout } from '@/api'
import { toast } from 'sonner'
import { LoadoutJSON } from '@/config/config'
import { ChooseAccountSheet } from '../Forms/AccountMultiSelect/AccountMultiSelectSheet'
import { StartupSheet } from '../Forms/Startup/StartupSheet'
import { ManageModsInServerSheet } from '../ManageModsInServerSheet/ManageModsInServerSheet'
import { MaplistSheet } from '../Forms/Maplist/MaplistSheet'

export function Loadout({ loadout }: { loadout: LoadoutJSON }) {
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
    <div className="m-auto mt-8 flex flex-col gap-8 p-4">
      <h1 className="mb-4 text-2xl text-secondary underline">{loadout.name}</h1>

      <div className="m-auto flex flex-col gap-16">
        <div className="flex flex-col justify-end gap-4">
          <div
            onClick={handleServer}
            className="flex gap-2 rounded-md bg-green-800 p-1.5 text-secondary hover:cursor-pointer hover:bg-green-800/80"
          >
            Start Server
            <Server />
          </div>
          <div
            onClick={handlePlay}
            className="flex justify-between gap-2 rounded-md bg-green-600 p-1.5 text-secondary hover:cursor-pointer hover:bg-green-600/80"
          >
            Start Server and Client
            <Server />
            <User />
          </div>
        </div>

        <div className="m-auto flex w-fit flex-col items-center gap-4">
          <div
            className="flex items-center gap-2 rounded-md bg-primary p-2 text-xl text-secondary hover:cursor-pointer hover:bg-primary/80"
            onClick={handleOpenExplorer}
          >
            Explorer
            <Folder />
          </div>
          <MaplistSheet loadout={loadout} />
          <StartupSheet existingLoadout={loadout} />
          <ManageModsInServerSheet loadout={loadout} />
          {/* <EditLoadoutSheet existingConfig={loadout} /> */}
        </div>
      </div>

      {/* <ChooseAccountSheet name={loadout.name} password={loadout.startup.admin.password ?? ''} /> */}
    </div>
  )
}
