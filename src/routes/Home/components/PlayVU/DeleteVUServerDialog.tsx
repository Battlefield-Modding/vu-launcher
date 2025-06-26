import { deleteServer } from '@/api'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { QueryKey, SavedServer } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { Trash, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

function DeleteVUServerDialog({ server }: { server: SavedServer }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  async function handleDelete() {
    const status = await deleteServer({ server })
    if (status) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.ServerList],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({ queryKey: [QueryKey.PlayVUInformation], refetchType: 'all' })
      toast(`${t('home.playVu.form.deleteServerDialog.toast.success')} ${server.nickname}`)
    } else {
      toast(`${t('home.playVu.form.deleteServerDialog.toast.failure')} ${server.nickname}`)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md text-red-500 transition hover:text-red-500/80">
          <Trash />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pb-4">
            {t('home.playVu.form.deleteServerDialog.title')}{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-primary">
              {server.nickname.length >= 20
                ? `${server.nickname.substring(0, 20)}...`
                : server.nickname}
            </code>
          </DialogTitle>
          <DialogDescription>
            {t('home.playVu.form.deleteServerDialog.description')}: {server.nickname}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 hover:bg-secondary/80">
              <X />
              {t('home.playVu.form.deleteServerDialog.cancel')}
            </p>
          </DialogClose>
          <DialogClose onClick={handleDelete}>
            <p className="flex gap-4 rounded-md bg-red-600 p-2 text-primary hover:bg-red-600/80">
              <Trash /> {t('home.playVu.form.deleteServerDialog.confirm')}:{' '}
              {server.nickname.length >= 20
                ? `${server.nickname.substring(0, 20)}...`
                : server.nickname}
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteVUServerDialog
