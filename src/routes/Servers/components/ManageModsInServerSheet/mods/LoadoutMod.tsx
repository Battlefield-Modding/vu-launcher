import VSCodeIcon from '@/assets/VSCodeIcon.svg'
import { DeleteModDialog } from '../dialog/DeleteModDialog'
import { toast } from 'sonner'
import { editServerLoadout, openModWithVsCode } from '@/api'
import { Input } from '@/components/ui/input'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'

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

  async function handleToggleMod(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = target.checked
    let tempModList = [...(loadout.modlist as string[])]
    let message = `${t('servers.loadouts.loadout.mods.loadoutMod.activated')} ${modName}`
    if (value) {
      if (!tempModList.includes(modName)) {
        tempModList.push(modName)
      }
    } else {
      tempModList = tempModList.filter((x) => x !== modName)
      message = `${t('servers.loadouts.loadout.mods.loadoutMod.deactivated')} ${modName}`
    }

    const finalLoadout = { ...loadout, modlist: tempModList }

    const status = await editServerLoadout(finalLoadout)

    if (status) {
      toast(message)
      queryClient.invalidateQueries({ queryKey: [queryKey], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [QueryKey.GetAllLoadoutJSON], refetchType: 'all' })
    } else {
      toast(`${t('servers.loadouts.loadout.mods.loadoutMod.toast.modFailure')}: ${modName}`)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-md bg-secondary p-4">
      <div className="flex flex-col items-center">
        <Input
          type="checkbox"
          className="w-8"
          defaultChecked={isActive}
          onChange={handleToggleMod}
        />
        <h1 className="">{modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}</h1>
      </div>
      <div className="flex justify-end">
        <p
          className="flex flex-1 rounded-md bg-sidebar p-1.5 hover:cursor-pointer hover:bg-sidebar/50"
          onClick={handleOpenInVSCode}
        >
          <img src={VSCodeIcon} className="m-auto"></img>
        </p>
        <DeleteModDialog loadoutName={loadout.name} modName={modName} queryKey={queryKey} />
      </div>
    </div>
  )
}
