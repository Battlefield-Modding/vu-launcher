import { deleteServerLoadout } from '@/api'
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

export function DeleteLoadoutDialog({
  name,
  setActiveLoadout,
  shouldRefreshActiveLoadout,
}: {
  name: string
  setActiveLoadout: (e: any) => void
  shouldRefreshActiveLoadout: boolean
}) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)
  const dialogCloseRef = useRef(null)

  async function handleDelete() {
    setSubmitLoading(() => true)
    const status = await deleteServerLoadout(name)
    setSubmitLoading(() => false)

    if (status) {
      if (dialogCloseRef.current) {
        const element = dialogCloseRef.current as HTMLDialogElement
        element.click()
        toast(`${t('servers.loadouts.deleteDialog.toast.success')}: ${name}`)
        queryClient.invalidateQueries({
          queryKey: [QueryKey.GetAllLoadoutJSON],
          refetchType: 'all',
        })
        if (shouldRefreshActiveLoadout) {
          setActiveLoadout(() => null)
        }
      }
    } else {
      toast(`${t('servers.loadouts.deleteDialog.toast.failure')}: ${name}`)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md p-1.5 hover:text-red-500">
          <Trash />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pb-4">
            {t('servers.loadouts.deleteDialog.title')}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {name.length >= 20 ? `${name.substring(0, 20)}...` : name}
            </code>
          </DialogTitle>
          <DialogDescription>{t('servers.loadouts.deleteDialog.description')}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 hover:bg-secondary/80">
              <X />
              {t('servers.loadouts.deleteDialog.buttons.cancel')}
            </p>
          </DialogClose>
          {submitLoading && <LoaderComponent />}

          <div onClick={handleDelete}>
            <p className="flex gap-4 rounded-md bg-red-600 p-2 text-white hover:bg-red-600/80">
              <Trash /> {t('servers.loadouts.deleteDialog.buttons.confirm')}:{' '}
              {name.length >= 20 ? `${name.substring(0, 20)}...` : name}
            </p>
          </div>
          <DialogClose ref={dialogCloseRef}></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
