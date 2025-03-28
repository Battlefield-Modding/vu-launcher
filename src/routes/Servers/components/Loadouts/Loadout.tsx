import { Folder, Loader, Server, User } from 'lucide-react'
import {
  getUserPreferences,
  openExplorerAtLoadout,
  playVUOnLocalServer,
  refreshLoadout,
  startServerLoadout,
  toggleDevBranch,
} from '@/api'
import { toast } from 'sonner'
import { LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { ChooseAccountSheet } from '../Forms/AccountMultiSelect/AccountMultiSelectSheet'
import { StartupSheet } from '../Forms/Startup/StartupSheet'
import { ManageModsInServerSheet } from '../ManageModsInServerSheet/ManageModsInServerSheet'
import { MaplistSheet } from '../Forms/Maplist/MaplistSheet'
import { BanlistSheet } from '../Forms/Banlist/BanlistSheet'
import { RefreshLoadoutTooltip } from './RefreshLoadoutTooltip'
import { LaunchArgumentSheet } from '../Forms/LaunchArguments/LaunchArgumentsSheet'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Switch } from '@/components/ui/switch'
import clsx from 'clsx'

export function Loadout({ loadout }: { loadout: LoadoutJSON }) {
  const queryClient = useQueryClient()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.UserPreferences],
    queryFn: getUserPreferences,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Fetching User Preferences</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>ERROR: No User Preferences</h1>
        <p>{error.message}</p>
      </div>
    )
  }

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
    <div className="m-auto flex flex-col p-4">
      <div className="mb-4 flex gap-2">
        <h1 className="text-2xl text-primary underline">{loadout.name} </h1>
        <div onClick={handleRefreshLoadout} className="w-fit">
          <RefreshLoadoutTooltip />
        </div>
      </div>

      <div className="m-auto mb-8 mt-8">
        <div
          className={clsx(
            'flex gap-8 rounded-md rounded-l-none border-b border-secondary',
            data.use_dev_branch && 'border-green-500 text-green-500 opacity-100',
          )}
        >
          <h1>Use dev branch?</h1>
          <Switch
            defaultChecked={data.use_dev_branch}
            onCheckedChange={async (e) => {
              await toggleDevBranch(e)
              queryClient.invalidateQueries({
                queryKey: [QueryKey.UserPreferences],
                refetchType: 'all',
              })
            }}
          />
        </div>
      </div>

      <div className="m-auto flex flex-col gap-12">
        <div className="flex justify-end gap-4">
          <div
            onClick={handleServer}
            className="flex w-fit gap-2 rounded-md bg-green-800 p-2 text-primary hover:cursor-pointer hover:bg-green-800/80"
          >
            Start Server
            <Server />
          </div>
          <div
            onClick={handlePlay}
            className="flex w-fit justify-between gap-2 rounded-md bg-green-700 p-2 text-primary hover:cursor-pointer hover:bg-green-700/80"
          >
            Start Server and Client
            <Server />
            <User />
          </div>

          {data.show_multiple_account_join && <ChooseAccountSheet loadoutName={loadout.name} />}
        </div>

        <div
          className="m-auto flex w-fit items-center gap-2 rounded-md bg-gray-600 p-2 text-xl text-primary hover:cursor-pointer hover:bg-gray-600/80"
          onClick={handleOpenExplorer}
        >
          Explorer
          <Folder />
        </div>

        <div className="m-auto flex w-fit flex-col items-center gap-4">
          <div>
            <StartupSheet existingLoadout={loadout} />
            <LaunchArgumentSheet existingLoadout={loadout} />
          </div>
          <MaplistSheet loadout={loadout} />
          <BanlistSheet loadout={loadout} />
          <ManageModsInServerSheet loadout={loadout} />
        </div>
      </div>
    </div>
  )
}
