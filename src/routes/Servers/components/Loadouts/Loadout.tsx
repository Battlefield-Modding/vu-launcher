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
import { DeleteLoadoutDialog } from './DeleteLoadoutDialog'
import { LoadoutSkeleton } from './LoadoutSkeleton'

export function Loadout() {
  let { loadoutName } = useParams()
  const { t } = useTranslation()

  const queryClient = useQueryClient()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetLoadoutJSON, loadoutName],
    queryFn: async (): Promise<{
      preferences: UserPreferences | undefined
      loadout: LoadoutJSON | undefined
    }> => {
      if (!loadoutName) {
        return { preferences: undefined, loadout: undefined }
      }

      const loadout = (await getLoadoutJson(loadoutName as string))[0]
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
    let status = await startServerLoadout(loadoutName as string)
    if (status) {
      toast(t('servers.loadouts.loadout.toast.playSuccess'))
      setTimeout(() => {
        playVUOnLocalServer(loadoutName as string)
      }, 1000)
    } else {
      toast(`${t('servers.loadouts.loadout.toast.playFailure')}: ${loadoutName}`)
    }
  }

  async function handleServer() {
    let status = await startServerLoadout(loadoutName as string)
    if (status) {
      toast(t('servers.loadouts.loadout.toast.serverSuccess'))
    } else {
      toast(`${t('servers.loadouts.loadout.toast.serverFailure')}: ${loadoutName}`)
    }
  }

  async function handleOpenExplorer() {
    toast(`${t('servers.loadouts.loadout.toast.openExplorer')}: ${loadoutName}`)
    await openExplorerAtLoadout(loadoutName as string)
  }

  async function handleRefreshLoadout() {
    const status = await refreshLoadout(loadoutName as string)
    if (status) {
      //servers.loadouts.loadout.toast.serverFailure
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetLoadoutJSON, loadoutName],
        refetchType: 'all',
      })
      toast(`${t('servers.loadouts.loadout.toast.refreshSuccess')}: ${loadoutName}`)
    } else {
      toast(`${t('servers.loadouts.loadout.toast.refreshFailure')}: ${loadoutName}`)
    }
  }

  if (loadoutName == undefined || data.preferences == undefined || data.loadout == undefined) {
    return <LoadoutSkeleton />
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-0">
      <div className="mb-4 ml-auto mr-auto flex max-w-80 items-center gap-2 lg:max-w-lg xl:max-w-screen-md">
        <h1 className="text-primary xl:text-2xl">{loadoutName} </h1>
        <div onClick={handleRefreshLoadout} className="w-fit">
          <RefreshLoadoutTooltip />
        </div>
        <DeleteLoadoutDialog name={loadoutName} />
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
                queryClient.invalidateQueries({
                  queryKey: [QueryKey.GetLoadoutJSON, loadoutName],
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

      <div className="flex flex-col gap-8">
        <div className="flex justify-center gap-4">
          <TooltipWrapper text={t('servers.loadouts.loadout.startServer')}>
            <div
              onClick={handleServer}
              className="rounded-md bg-green-700 p-4 text-xl text-primary hover:cursor-pointer hover:bg-green-700/80"
            >
              <Server />
            </div>
          </TooltipWrapper>
          <TooltipWrapper text={t('servers.loadouts.loadout.startServerAndClient')}>
            <div
              onClick={handlePlay}
              className="flex items-center justify-center gap-2 rounded-md bg-green-700 p-4 text-xl text-primary hover:cursor-pointer hover:bg-green-700/80"
            >
              <Server />
              <User />
            </div>
          </TooltipWrapper>
          {data.preferences.show_multiple_account_join && (
            <ChooseAccountSheet loadoutName={loadoutName} />
          )}
        </div>

        <table className="text-center">
          <tbody>
            <tr>
              <th className="border border-secondary">
                {t('servers.loadouts.loadout.tableHeaderOne')}
              </th>
              <th className="border border-secondary">
                {t('servers.loadouts.loadout.tableHeaderTwo')}
              </th>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.maplist.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <MaplistSheet loadout={data.loadout} />
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.mods.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <ManageModsInServerSheet loadout={data.loadout} />
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.banlist.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <BanlistSheet loadout={data.loadout} />
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.startup.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <StartupSheet existingLoadout={data.loadout} />
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.launchArgs.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <LaunchArgumentSheet existingLoadout={data.loadout} />
              </td>
            </tr>
          </tbody>
        </table>

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
