import { Folder, Loader, Server, User } from 'lucide-react'
import {
  getLoadoutJson,
  getUserPreferences,
  openExplorerAtLoadout,
  playVUOnLocalServer,
  refreshLoadout,
  startServerLoadout,
  toggleDevBranch,
} from '@/api'
import { toast } from 'sonner'
import { LoadoutJSON, QueryKey, STALE, UserPreferences } from '@/config/config'
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
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { TooltipWrapper } from '@/components/TooltipWrapper'

export function Loadout() {
  let { loadoutName } = useParams()
  if (!loadoutName) {
    return <div>No loadoutName specified...</div>
  }

  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetLoadoutJSON, loadoutName],
    queryFn: async (): Promise<{ preferences: UserPreferences; loadout: LoadoutJSON }> => {
      const loadout = (await getLoadoutJson(loadoutName))[0]
      const preferences = await getUserPreferences()

      return { preferences, loadout }
    },
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>{t('servers.loadouts.loadout.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('servers.loadouts.loadout.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  async function handlePlay() {
    let status = await startServerLoadout(loadoutName)
    if (status) {
      toast(t('servers.loadouts.loadout.toast.playSuccess'))
      setTimeout(() => {
        playVUOnLocalServer(loadoutName)
      }, 1000)
    } else {
      toast(`${t('servers.loadouts.loadout.toast.playFailure')}: ${loadoutName}`)
    }
  }

  async function handleServer() {
    let status = await startServerLoadout(loadoutName)
    if (status) {
      toast(t('servers.loadouts.loadout.toast.serverSuccess'))
    } else {
      toast(`${t('servers.loadouts.loadout.toast.serverFailure')}: ${loadoutName}`)
    }
  }

  async function handleOpenExplorer() {
    toast(`${t('servers.loadouts.loadout.toast.openExplorer')}: ${loadoutName}`)
    await openExplorerAtLoadout(loadoutName)
  }

  async function handleRefreshLoadout() {
    const status = await refreshLoadout(loadoutName)
    if (status) {
      //servers.loadouts.loadout.toast.serverFailure
      toast(`${t('servers.loadouts.loadout.toast.refreshSuccess')}: ${loadoutName}`)
    } else {
      toast(`${t('servers.loadouts.loadout.toast.refreshFailure')}: ${loadoutName}`)
    }
  }

  return (
    <div className="m-auto flex flex-col rounded-md bg-sidebar p-8">
      <div className="mb-4 ml-auto mr-auto flex max-w-80 items-center gap-2 lg:max-w-lg xl:max-w-screen-md">
        <h1 className="text-primary xl:text-2xl">{loadoutName} </h1>
        <div onClick={handleRefreshLoadout} className="w-fit">
          <RefreshLoadoutTooltip />
        </div>
      </div>

      <div className="m-auto mb-8 mt-8">
        <div
          className={clsx(
            'flex gap-8 rounded-md rounded-l-none border-b border-secondary',
            data.preferences.use_dev_branch && 'border-green-500 text-green-500 opacity-100',
          )}
        >
          <h1>{t('servers.loadouts.loadout.devToggle')}</h1>
          <Switch
            defaultChecked={data.preferences.use_dev_branch}
            onCheckedChange={async (e) => {
              const status = await toggleDevBranch(e)
              if (status) {
                queryClient.invalidateQueries({
                  queryKey: [QueryKey.UserPreferences],
                  refetchType: 'all',
                })

                toast(t('toggleDevBranch.success'))
              } else {
                toast(t('toggleDevBranch.failure'))
              }
            }}
          />
        </div>
      </div>

      <div className="m-auto flex flex-col gap-8">
        <div className="flex justify-center gap-4">
          <TooltipWrapper text={t('servers.loadouts.loadout.startServer')}>
            <div
              onClick={handleServer}
              className="rounded-md bg-green-800 p-4 text-xl text-primary hover:cursor-pointer hover:bg-green-800/80"
            >
              <Server />
            </div>
          </TooltipWrapper>
          <TooltipWrapper text={t('servers.loadouts.loadout.startServerAndClient')}>
            <div
              onClick={handlePlay}
              className="flex items-center justify-center gap-2 rounded-md bg-green-800 p-4 text-xl text-primary hover:cursor-pointer hover:bg-green-800/80"
            >
              <Server />
              <User />
            </div>
          </TooltipWrapper>
          {data.preferences.show_multiple_account_join && (
            <ChooseAccountSheet loadoutName={loadoutName} />
          )}
        </div>

        <div className="flex justify-center gap-4">
          <MaplistSheet loadout={data.loadout} />
          <ManageModsInServerSheet loadout={data.loadout} />
          <BanlistSheet loadout={data.loadout} />
        </div>

        <div className="flex justify-center gap-4">
          <LaunchArgumentSheet existingLoadout={data.loadout} />
          <StartupSheet existingLoadout={data.loadout} />
        </div>

        <div className="flex justify-center gap-4">
          <TooltipWrapper text={t('servers.loadouts.loadout.openExplorer')}>
            <div
              className="flex items-center justify-center gap-2 rounded-md bg-secondary p-4 text-xl text-primary hover:cursor-pointer hover:bg-secondary/80"
              onClick={handleOpenExplorer}
            >
              <Folder />
            </div>
          </TooltipWrapper>
        </div>
      </div>
    </div>
  )
}
