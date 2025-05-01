import VSCodeIcon from '@/assets/VSCodeIcon.svg'
import { DeleteModDialog } from '../dialog/DeleteModDialog'
import { toast } from 'sonner'
import { editServerLoadout, openModWithVsCode } from '@/api'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Switch } from '@/components/ui/switch'

export function LoadoutMod({
  loadout,
  modName,
  isActive,
  queryKey,
}: {
  loadout: LoadoutJSON
  modName: string
  isActive: boolean
  queryKey: string
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  async function handleOpenInVSCode() {
    const status = await openModWithVsCode({ name: loadout.name, modname: modName })
    if (status) {
      toast(`${t('servers.loadouts.loadout.mods.loadoutMod.toast.vsCodeSuccess')}: ${modName}`)
    } else {
      toast(`${t('servers.loadouts.loadout.mods.loadoutMod.toast.vsCodeFailure')}: ${modName}`)
    }
  }

  async function handleToggleMod(modStatus: boolean) {
    let tempModList = [...(loadout.modlist as string[])]
    console.log(`Your temporary mod list is: ${tempModList}`)
    let message = `${t('servers.loadouts.loadout.mods.loadoutMod.activated')} ${modName}`
    if (modStatus) {
      if (!tempModList.includes(modName)) {
        tempModList.push(modName)
      }
    } else {
      tempModList = tempModList.filter((x) => x !== modName && x !== '')
      message = `${t('servers.loadouts.loadout.mods.loadoutMod.deactivated')} ${modName}`
    }

    const finalLoadout = { ...loadout, modlist: tempModList }

    const status = await editServerLoadout(finalLoadout)

    if (status) {
      toast(message)
      queryClient.invalidateQueries({ queryKey: [QueryKey.GetAllLoadoutJSON], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'all' })
    } else {
      toast(`${t('servers.loadouts.loadout.mods.loadoutMod.toast.modFailure')}: ${modName}`)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Switch
        defaultChecked={isActive}
        onCheckedChange={(e) => {
          handleToggleMod(e)
        }}
      />

      <h1>{modName}</h1>
      <code className="text-md text-nowrap rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
        v0.1.0
      </code>
      <p
        className="ml-auto mr-0 rounded-md bg-sidebar p-1.5 hover:cursor-pointer hover:bg-sidebar/50"
        onClick={handleOpenInVSCode}
      >
        <img src={VSCodeIcon} className="m-auto"></img>
      </p>
      <DeleteModDialog loadoutName={loadout.name} modName={modName} queryKey={queryKey} />
    </div>
  )
}
