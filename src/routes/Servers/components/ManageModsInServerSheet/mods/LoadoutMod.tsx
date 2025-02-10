import VSCodeIcon from '@/assets/VSCodeIcon.svg'
import { DeleteModDialog } from '../dialog/DeleteModDialog'
import { toast } from 'sonner'
import { editServerLoadout, openModWithVsCode } from '@/api'
import { AddModDialog } from '../dialog/AddModDialog'
import { Input } from '@/components/ui/input'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'

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

  async function handleOpenInVSCode() {
    const status = await openModWithVsCode({ name: loadout.name, modname: modName })
    if (status) {
      toast(`Opened ${modName} in vscode`)
    } else {
      toast(`Failed to open ${modName} in vscode`)
    }
  }

  async function handleToggleMod(e: React.ChangeEvent<HTMLInputElement>) {
    const target = e.target as HTMLInputElement
    const value = target.checked
    let tempModList = [...loadout.modlist]
    let message
    if (value) {
      if (!tempModList.includes(modName)) {
        tempModList.push(modName)
        message = `Activated ${modName}`
      }
    } else {
      tempModList = tempModList.filter((x) => x !== modName)
      message = `De-Activated ${modName}`
    }

    const finalLoadout = { ...loadout, modlist: tempModList }

    const status = await editServerLoadout(finalLoadout)

    if (status) {
      toast(message)
      queryClient.invalidateQueries({ queryKey, refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [QueryKey.GetAllLoadoutJSON], refetchType: 'all' })
    } else {
      toast('Error. Failed to update mod status')
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
          className="flex flex-1 rounded-md bg-sidebar-foreground p-1.5 hover:cursor-pointer hover:bg-sidebar-foreground/80"
          onClick={handleOpenInVSCode}
        >
          <img src={VSCodeIcon} className="m-auto"></img>
        </p>
        <DeleteModDialog loadoutName={loadout.name} modName={modName} queryKey={queryKey} />
      </div>
    </div>
  )
}
