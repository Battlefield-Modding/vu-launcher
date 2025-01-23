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
import { toast } from 'sonner'

export function DeleteLoadoutDialog({ name }: { name: string }) {
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
        toast('Deleted server loadout.')
        queryClient.invalidateQueries({
          queryKey: [QueryKey.ServerLoadouts],
          refetchType: 'all',
        })
      }
    } else {
      toast(`Error. Failed to delete ${name}`)
    }
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
          {submitLoading && <LoaderComponent />}

          <div onClick={handleDelete}>
            <p className="flex gap-4 rounded-md bg-red-600 p-2 text-white hover:bg-red-600/80">
              <Trash /> Delete: {name.length >= 20 ? `${name.substring(0, 20)}...` : name}
            </p>
          </div>
          <DialogClose ref={dialogCloseRef}></DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
