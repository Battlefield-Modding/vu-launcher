import { Folder, Server, User } from 'lucide-react'
import {
  openExplorerAtLoadout,
  playVUOnLocalServer,
  refreshLoadout,
  startServerLoadout,
} from '@/api'
import { toast } from 'sonner'
import { LoadoutJSON } from '@/config/config'
import { ChooseAccountSheet } from '../Forms/AccountMultiSelect/AccountMultiSelectSheet'
import { StartupSheet } from '../Forms/Startup/StartupSheet'
import { ManageModsInServerSheet } from '../ManageModsInServerSheet/ManageModsInServerSheet'
import { MaplistSheet } from '../Forms/Maplist/MaplistSheet'
import { BanlistSheet } from '../Forms/Banlist/BanlistSheet'
import { RefreshLoadoutTooltip } from './RefreshLoadoutTooltip'
import { LaunchArgumentSheet } from '../Forms/LaunchArguments/LaunchArgumentsSheet'

export function Loadout({ loadout }: { loadout: LoadoutJSON }) {
  async function handlePlay() {
    let status = await startServerLoadout(loadout.name)
    if (status) {
      toast('Started VU Server. Starting Client in 1 second...')
      setTimeout(() => {
        playVUOnLocalServer(loadout.name)
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

  async function handleRefreshLoadout() {
    const status = await refreshLoadout(loadout.name)
    if (status) {
      toast(`Updated Startup/Maplist/Modlist/Banlist from loadout.json for: ${loadout.name}`)
    } else {
      toast(`Failed to update txt files from loadout.json for: ${loadout.name}`)
    }
  }

  return (
    <div className="m-auto mt-8 flex flex-col gap-8 p-4">
      <div className="mb-4 flex gap-2">
        <h1 className="text-2xl text-secondary underline">{loadout.name} </h1>
        <div onClick={handleRefreshLoadout} className="w-fit">
          <RefreshLoadoutTooltip />
        </div>
      </div>

      <div className="m-auto flex flex-col gap-16">
        <div className="flex justify-end gap-4">
          <div
            onClick={handleServer}
            className="flex w-fit gap-2 rounded-md bg-green-800 p-2 text-secondary hover:cursor-pointer hover:bg-green-800/80"
          >
            Start Server
            <Server />
          </div>
          <div
            onClick={handlePlay}
            className="flex w-fit justify-between gap-2 rounded-md bg-green-700 p-2 text-secondary hover:cursor-pointer hover:bg-green-700/80"
          >
            Start Server and Client
            <Server />
            <User />
          </div>
        </div>

        <div
          className="m-auto flex w-fit items-center gap-2 rounded-md bg-gray-600 p-2 text-xl text-secondary hover:cursor-pointer hover:bg-gray-600/80"
          onClick={handleOpenExplorer}
        >
          Explorer
          <Folder />
        </div>

        <div className="m-auto flex w-fit flex-col items-center gap-4">
          <StartupSheet existingLoadout={loadout} />
          <LaunchArgumentSheet existingLoadout={loadout} />
          <MaplistSheet loadout={loadout} />
          <BanlistSheet loadout={loadout} />
          <ManageModsInServerSheet loadout={loadout} />
        </div>
      </div>

      <ChooseAccountSheet loadoutName={loadout.name} />
    </div>
  )
}
