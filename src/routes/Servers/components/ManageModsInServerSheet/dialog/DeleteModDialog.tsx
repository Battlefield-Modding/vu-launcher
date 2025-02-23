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
  const queryClient = useQueryClient()

  async function handleDelete() {
    const status = await removeModFromLoadout(loadoutName, modName)
    if (status) {
      toast(`Deleted ${modName} from ${loadoutName}.`)
      queryClient.invalidateQueries({
        queryKey: [queryKey],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllLoadoutJSON],
        refetchType: 'all',
      })
    } else {
      toast(`Error: Failed to delete ${modName}`)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md bg-red-500 p-2.5 text-secondary hover:bg-red-500/80">
          <Trash />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pb-4">
            DELETE mod:{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </code>
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete {modName} from {loadoutName}.
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
              <Trash /> Delete: {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
