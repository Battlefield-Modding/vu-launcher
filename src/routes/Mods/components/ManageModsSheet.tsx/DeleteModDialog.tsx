import { removeModFromLoadout } from '@/api'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { Trash, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

function DeleteModDialog({ modName, loadoutName }: { modName: string; loadoutName: string }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  async function handleDelete() {
    const status = await removeModFromLoadout(loadoutName, modName)
    if (status) {
      toast(`${t('mods.manage.deleteDialog.toast.success')} ${loadoutName}/${modName}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetModNamesInCache],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllModNames],
        refetchType: 'all',
      })
    } else {
      toast(`${t('mods.manage.deleteDialog.toast.failure')} ${loadoutName}/${modName}`)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md bg-red-500 p-2.5 hover:bg-red-500/80">
          <Trash />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pb-4">
            {t('mods.manage.deleteDialog.title')}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {loadoutName}/{modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </code>
          </DialogTitle>
          <DialogDescription>
            {t('mods.manage.deleteDialog.description')}
            {loadoutName}/{modName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 hover:bg-secondary/80">
              <X />
              {t('mods.manage.deleteDialog.cancel')}
            </p>
          </DialogClose>
          <DialogClose onClick={handleDelete}>
            <p className="flex gap-4 rounded-md bg-red-600 p-2 text-white hover:bg-red-600/80">
              <Trash /> {t('mods.manage.deleteDialog.confirm')}:{' '}
              {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteModDialog
