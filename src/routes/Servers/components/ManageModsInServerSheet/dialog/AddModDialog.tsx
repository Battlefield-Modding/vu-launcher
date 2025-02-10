import { editServerLoadout } from '@/api'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { Download, Plus, Trash, X } from 'lucide-react'
import { toast } from 'sonner'

export function AddModDialog({
  modName,
  loadout,
  queryKey,
}: {
  modName: string
  loadout: LoadoutJSON
  queryKey: string
}) {
  const queryClient = useQueryClient()

  async function handleClick() {
    let tempModList = [...loadout.modlist]
    tempModList.push(modName)
    const finalLoadout = { ...loadout, modlist: tempModList }

    const status = await editServerLoadout(finalLoadout)

    if (status) {
      toast(`Installed ${modName}`)
      queryClient.invalidateQueries({
        queryKey: [queryKey],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllLoadoutJSON],
        refetchType: 'all',
      })
    } else {
      toast('Error. Failed to install mod')
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <div className="rounded-md bg-green-600 p-2.5 text-secondary hover:bg-green-600/80">
          <Plus />
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pb-4">
            Install mod:{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-secondary">
              {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </code>
          </DialogTitle>
          <DialogDescription>
            Install Mod {modName} to {loadout.name}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-8">
          <DialogClose>
            <p className="flex gap-2 rounded-md bg-primary p-2 text-secondary hover:bg-primary/80">
              <X />
              Cancel
            </p>
          </DialogClose>
          <DialogClose onClick={handleClick}>
            <p className="flex gap-4 rounded-md bg-green-600 p-2 text-secondary hover:bg-green-600/80">
              <Plus /> Install: {modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}
