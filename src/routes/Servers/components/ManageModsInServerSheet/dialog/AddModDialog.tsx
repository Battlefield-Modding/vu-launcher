import { editServerLoadout } from '@/api'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function AddModDialog({
  modName,
  loadout,
  queryKey,
}: {
  modName: string
  loadout: LoadoutJSON
  queryKey: string
}) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  async function handleClick() {
    let tempModList = [...(loadout.modlist as string[])]
    tempModList.push(modName)
    const finalLoadout = { ...loadout, modlist: tempModList }

    const status = await editServerLoadout(finalLoadout)

    if (status) {
      toast(`${t('servers.loadouts.loadout.mods.addModDialog.toast.success')}: ${modName}`)
      queryClient.invalidateQueries({
        queryKey: [queryKey],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllLoadoutJSON],
        refetchType: 'all',
      })
    } else {
      toast(`${t('servers.loadouts.loadout.mods.addModDialog.toast.failure')}: ${modName}`)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md bg-green-600 p-2.5 hover:bg-green-600/80">
          <Plus />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pb-4">
            {t('servers.loadouts.loadout.mods.addModDialog.title')}{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2">
              {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </code>
          </DialogTitle>
          <DialogDescription>
            {t('servers.loadouts.loadout.mods.addModDialog.description')} {loadout.name}/{modName}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 hover:bg-secondary/80">
              <X />
              {t('servers.loadouts.loadout.mods.addModDialog.cancel')}
            </p>
          </DialogClose>
          <DialogClose onClick={handleClick}>
            <p className="flex gap-4 rounded-md bg-green-600 p-2 hover:bg-green-600/80">
              <Plus /> {t('servers.loadouts.loadout.mods.addModDialog.confirm')}:{' '}
              {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
