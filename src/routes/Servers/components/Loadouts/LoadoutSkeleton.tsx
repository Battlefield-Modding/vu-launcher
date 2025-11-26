import {
  Book,
  Folder,
  Hammer,
  Map,
  RefreshCcw,
  Rocket,
  Server,
  Trash,
  User,
  Wrench,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { TooltipWrapper } from '@/components/TooltipWrapper'
import { Button } from '@/components/ui/button'

export function LoadoutSkeleton() {
  const { t } = useTranslation()
  return (
    <div className="flex w-full flex-col items-center justify-center gap-0 opacity-50">
      <div className="mb-4 ml-auto mr-auto flex max-w-80 items-center gap-2 lg:max-w-lg xl:max-w-screen-md">
        <h1 className="text-primary xl:text-2xl">
          {t('servers.loadouts.createLoadout.sheet.title')}
        </h1>
        <div className="w-fit">
          <Button className="cursor-not-allowed">
            <RefreshCcw />
          </Button>
        </div>
        <div className="cursor-not-allowed rounded-md p-1.5 hover:text-red-500">
          <Trash />
        </div>
      </div>

      <div className="m-auto mb-8 mt-8">
        <div className={clsx('flex gap-8 rounded-md rounded-l-none border-b border-secondary')}>
          <h1>{t('servers.loadouts.loadout.devToggle')}</h1>
          <Switch defaultChecked={false} className="cursor-not-allowed" />
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex justify-center gap-4">
          <TooltipWrapper text={t('servers.loadouts.loadout.startServer')}>
            <div className="hover: cursor-not-allowed rounded-md bg-green-700 p-4 text-xl text-primary hover:bg-green-700/80">
              <Server />
            </div>
          </TooltipWrapper>
          <TooltipWrapper text={t('servers.loadouts.loadout.startServerAndClient')}>
            <div className="hover: flex cursor-not-allowed items-center justify-center gap-2 rounded-md bg-green-700 p-4 text-xl text-primary hover:bg-green-700/80">
              <Server />
              <User />
            </div>
          </TooltipWrapper>
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
                <div className="m-auto flex h-full w-full cursor-not-allowed bg-secondary p-1 text-center text-xl text-primary">
                  <Map className="m-auto" />
                </div>
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.mods.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <div className="m-auto flex h-full w-full cursor-not-allowed bg-secondary p-1 text-center text-xl text-primary">
                  <Book className="m-auto" />
                </div>
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.banlist.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <div className="m-auto flex h-full w-full cursor-not-allowed bg-secondary p-1 text-center text-xl text-primary">
                  <Hammer className="m-auto" />
                </div>
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.startup.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <div className="m-auto flex h-full w-full cursor-not-allowed bg-secondary p-1 text-center text-xl text-primary">
                  <Wrench className="m-auto" />
                </div>
              </td>
            </tr>

            <tr className="border border-secondary">
              <td className="border border-secondary">
                {t('servers.loadouts.loadout.launchArgs.sheet.trigger')}
              </td>
              <td className="border border-secondary">
                <div className="m-auto flex h-full w-full cursor-not-allowed bg-secondary p-1 text-center text-xl text-primary">
                  <Rocket className="m-auto" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-center gap-4">
          <TooltipWrapper text={t('servers.loadouts.loadout.openExplorer')}>
            <div className="flex cursor-not-allowed items-center justify-center gap-2 rounded-md bg-secondary p-4 text-xl text-primary">
              <Folder />
            </div>
          </TooltipWrapper>
        </div>
      </div>
    </div>
  )
}
