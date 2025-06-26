import { installModToLoadoutFromCache } from '@/api'
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
import { GameMod, LoadoutJSON, QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function AddModDialog({
  mod,
  loadout,
  queryKey,
}: {
  mod: GameMod
  loadout: LoadoutJSON
  queryKey: string
}) {
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)
  const { t } = useTranslation()
  const dialogCloseRef = useRef(null)

  async function handleClick() {
    setSubmitLoading(() => true)
    const status = await installModToLoadoutFromCache({ loadoutName: loadout.name, gameMod: mod })
    setSubmitLoading(() => false)

    if (status) {
      toast(`${t('servers.loadouts.loadout.mods.addModDialog.toast.success')}: ${mod.name}`)
      queryClient.invalidateQueries({
        queryKey: [queryKey],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetLoadoutJSON, loadout.name],
        refetchType: 'all',
      })
    } else {
      toast(`${t('servers.loadouts.loadout.mods.addModDialog.toast.failure')}: ${mod.name}`)
    }

    // @ts-ignore
    dialogCloseRef?.current?.click()
  }

  return (
    <Dialog>
      <DialogTrigger className="flex flex-1 bg-green-700 p-1 hover:bg-green-700/80">
        <Plus className="m-auto" />
      </DialogTrigger>
      <DialogContent>
        {submitLoading && <LoaderComponent />}
        <DialogHeader>
          <DialogTitle className="pb-4">
            {t('servers.loadouts.loadout.mods.addModDialog.title')}{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2">
              {mod.name.length >= 20 ? `${mod.name.substring(0, 20)}...` : mod.name}
            </code>
          </DialogTitle>
          <DialogDescription>
            {t('servers.loadouts.loadout.mods.addModDialog.description')} {loadout.name}/{mod.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 hover:bg-secondary/80">
              <X />
              {t('servers.loadouts.loadout.mods.addModDialog.cancel')}
            </p>
          </DialogClose>
          <div onClick={handleClick}>
            <p className="flex gap-4 rounded-md bg-green-600 p-2 hover:bg-green-600/80">
              <Plus /> {t('servers.loadouts.loadout.mods.addModDialog.confirm')}:{' '}
              {mod.name.length >= 20 ? `${mod.name.substring(0, 20)}...` : mod.name}
            </p>
          </div>
          <DialogClose ref={dialogCloseRef}></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
