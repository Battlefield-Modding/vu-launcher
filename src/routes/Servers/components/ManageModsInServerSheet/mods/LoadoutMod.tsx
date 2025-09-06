import VSCodeIcon from '@/assets/VSCodeIcon.svg'
import { DeleteModDialog } from '../dialog/DeleteModDialog'
import { toast } from 'sonner'
import { openModWithVsCode, toggleMod } from '@/api'
import { GameMod, QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/switch'

export function LoadoutMod({
  loadoutName,
  mod,
  isActive,
  queryKey,
}: {
  loadoutName: string
  mod: GameMod
  isActive: boolean
  queryKey: string
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  async function handleOpenInVSCode() {
    const status = await openModWithVsCode({ name: loadoutName, modname: mod.name })
    if (status) {
      toast(`${t('servers.loadouts.loadout.mods.loadoutMod.toast.vsCodeSuccess')}: ${mod.name}`)
    } else {
      toast(`${t('servers.loadouts.loadout.mods.loadoutMod.toast.vsCodeFailure')}: ${mod.name}`)
    }
  }

  async function handleToggleMod(modStatus: boolean) {
    const status = await toggleMod({ gameMod: mod, loadoutName })

    let message
    if (modStatus) {
      message = `${t('servers.loadouts.loadout.mods.loadoutMod.activated')} ${mod.name}`
    } else {
      message = `${t('servers.loadouts.loadout.mods.loadoutMod.deactivated')} ${mod.name}`
    }

    if (status) {
      toast(message)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetLoadoutJSON],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'all' })
    } else {
      toast(`${t('servers.loadouts.loadout.mods.loadoutMod.toast.modFailure')}: ${mod.name}`)
    }
  }

  return (
    <tr className="border border-secondary">
      <td>
        <Switch
          defaultChecked={isActive}
          onCheckedChange={(e) => {
            handleToggleMod(e)
          }}
        />
      </td>

      <td className="border border-secondary">{`${mod.name} `}</td>

      <td className="border border-secondary">
        <code className="text-md text-nowrap rounded-md bg-gray-800 p-1 pl-2 pr-2 text-primary">
          {mod.version}
        </code>
      </td>

      <td className="flex items-center justify-center">
        <p
          className="flex-1 bg-sidebar hover:cursor-pointer hover:bg-sidebar/50"
          onClick={handleOpenInVSCode}
        >
          <img src={VSCodeIcon} className="m-auto"></img>
        </p>
        <DeleteModDialog loadoutName={loadoutName} modName={mod.name} queryKey={queryKey} />
      </td>
    </tr>
  )
}
