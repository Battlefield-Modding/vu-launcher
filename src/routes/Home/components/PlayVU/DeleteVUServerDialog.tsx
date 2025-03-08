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
import { toast } from 'sonner'

function DeleteVUServerDialog({ server }: { server: SavedServer }) {
  const queryClient = useQueryClient()

  async function handleDelete() {
    const status = await deleteServer({ server })
    if (status) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.ServerList],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({ queryKey: [QueryKey.PlayVUInformation], refetchType: 'all' })
      toast(`Success! Deleted saved Quick-Join server ${server.nickname}`)
    } else {
      toast(`Failed to delete Quick-Join server ${server.nickname}`)
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
            DELETE stored credentials:{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {server.nickname.length >= 20
                ? `${server.nickname.substring(0, 20)}...`
                : server.nickname}
            </code>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete {server.nickname} from local
            list of accounts.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-secondary p-2 hover:bg-secondary/80">
              <X />
              Cancel
            </p>
          </DialogClose>
          <DialogClose onClick={handleDelete}>
            <p className="flex gap-4 rounded-md bg-red-600 p-2 text-white hover:bg-red-600/80">
              <Trash /> Delete:{' '}
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
