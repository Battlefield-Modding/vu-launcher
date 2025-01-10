import { removeModFromLoadout } from '@/api'
import { QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { Trash } from 'lucide-react'
import { toast } from 'sonner'

function Mod({ modName, loadoutName }: { modName: string; loadoutName: string }) {
  const queryClient = useQueryClient()

  async function handleDelete() {
    const result = await removeModFromLoadout(loadoutName, modName)
    if (result) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetModNamesInCache],
        refetchType: 'all',
      })
      toast(`Successfully deleted ${modName} from ${loadoutName}`)
    } else {
      toast(`Could not delete ${modName} from ${loadoutName}`)
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-8 rounded-md bg-primary p-2 text-white">
      <h1>{modName.length >= 20 ? `${modName.substring(0, 20)}...` : modName}</h1>
      <p
        className="flex gap-2 rounded-md bg-red-600 p-2 text-white hover:cursor-pointer hover:bg-red-600/80"
        onClick={handleDelete}
      >
        <Trash /> Delete
      </p>
    </div>
  )
}

export default Mod
