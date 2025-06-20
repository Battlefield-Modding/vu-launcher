import { removeModFromLoadout } from '@/api'
import { LoaderComponent } from '@/components/LoaderComponent'
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
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function DeleteModDialog({
  modName,
  loadoutName,
  queryKey,
}: {
  modName: string
  loadoutName: string
  queryKey: string
}) {
  const [submitLoading, setSubmitLoading] = useState(false)
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const dialogCloseRef = useRef(null)

  async function handleDelete() {
    setSubmitLoading(() => true)
    const status = await removeModFromLoadout(loadoutName, modName)
    setSubmitLoading(() => false)
    if (status) {
      toast(
        `${t('servers.loadouts.loadout.mods.deleteModDialog.toast.success')}: ${loadoutName}/${modName}`,
      )
      queryClient.invalidateQueries({
        queryKey: [queryKey],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetLoadoutJSON],
        refetchType: 'all',
      })
    } else {
      toast(
        `${t('servers.loadouts.loadout.mods.deleteModDialog.toast.failure')}: ${loadoutName}/${modName}`,
      )
    }

    // @ts-ignore
    dialogCloseRef?.current?.click()
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md bg-red-500 p-2.5 text-primary hover:bg-red-500/80">
          <Trash />
        </div>
      </DialogTrigger>
      <DialogContent>
        {submitLoading && <LoaderComponent />}
        <DialogHeader>
          <DialogTitle className="pb-4">
            {t('servers.loadouts.loadout.mods.deleteModDialog.title')}:{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </code>
          </DialogTitle>
          <DialogDescription>
            {t('servers.loadouts.loadout.mods.deleteModDialog.description')} {loadoutName}/{modName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 text-white hover:bg-secondary/80">
              <X />
              {t('servers.loadouts.loadout.mods.deleteModDialog.cancel')}
            </p>
          </DialogClose>
          <div onClick={handleDelete}>
            <p className="flex gap-4 rounded-md bg-red-600 p-2 text-white hover:bg-red-600/80">
              <Trash /> {t('servers.loadouts.loadout.mods.deleteModDialog.confirm')}:{' '}
              {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </p>
          </div>
          <DialogClose ref={dialogCloseRef}></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
