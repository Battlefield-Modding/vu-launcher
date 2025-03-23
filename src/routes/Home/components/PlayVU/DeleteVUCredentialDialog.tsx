import { deleteUserCredentials } from '@/api'
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
import { toast } from 'sonner'

function DeleteVUCredentialDialog({ username }: { username: string }) {
  const queryClient = useQueryClient()

  async function handleDelete() {
    const status = await deleteUserCredentials({ username: username })
    if (status) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.UserList],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({ queryKey: [QueryKey.PlayVUInformation], refetchType: 'all' })
      toast(`Success! Deleted credentials for ${username}`)
    } else {
      toast(`Failed to delete credentials for ${username}`)
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
              {username.length >= 20 ? `${username.substring(0, 20)}...` : username}
            </code>
          </DialogTitle>
          <DialogDescription>
            This will permanently delete {username} from your Operating System's credential manager.
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
              {username.length >= 20 ? `${username.substring(0, 20)}...` : username}
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteVUCredentialDialog
