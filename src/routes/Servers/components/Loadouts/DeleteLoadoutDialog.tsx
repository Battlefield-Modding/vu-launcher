import { deleteServerLoadout } from '@/api'
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

function DeleteLoadoutDialog({ name }: { name: string }) {
  const queryClient = useQueryClient()

  async function handleDelete() {
    await deleteServerLoadout(name)
    toast('Deleted server loadout.')
    queryClient.invalidateQueries({
      queryKey: [QueryKey.ServerLoadouts],
      refetchType: 'all',
    })
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md bg-red-500 p-1.5 hover:bg-red-500/80">
          <Trash />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pb-4">
            DELETE loadout:{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {name.length >= 20 ? `${name.substring(0, 20)}...` : name}
            </code>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete all data related to this
            loadout.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-primary p-2 text-white hover:bg-primary/80">
              <X />
              Cancel
            </p>
          </DialogClose>
          <DialogClose onClick={handleDelete}>
            <p className="flex gap-4 rounded-md bg-red-600 p-2 text-white hover:bg-red-600/80">
              <Trash /> Delete: {name.length >= 20 ? `${name.substring(0, 20)}...` : name}
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteLoadoutDialog
