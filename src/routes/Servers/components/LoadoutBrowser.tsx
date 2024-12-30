import { deleteServerLoadout } from '@/api'
import { Button } from '@/components/ui/button'
import { QueryKey } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { Delete, Edit, Play } from 'lucide-react'
import { toast } from 'sonner'

function LoadoutBrowser({ loadouts }: { loadouts: String[] }) {
  const queryClient = useQueryClient()

  if (!loadouts) {
    return <></>
  }
  return (
    <div className="grid grid-cols-2 gap-8 p-8 text-white">
      {loadouts.map((name, index) => (
        <div key={`${name}-${index}`} className="rounded-md border border-black bg-black p-4">
          <h1 className="mb-8 flex gap-4 text-xl">
            {name.length >= 15 ? `${name.substring(0, 15)}...` : name}
          </h1>

          <div className="flex gap-4">
            <Button
              variant={'destructive'}
              onClick={async () => {
                const wantToDelete = await confirm(`Are you sure you want to delete ${name}?`)
                if (wantToDelete) {
                  const status = await deleteServerLoadout(name)
                  if (status) {
                    toast('Deleted server loadout.')
                    queryClient.invalidateQueries({
                      queryKey: [QueryKey.ServerLoadouts],
                      refetchType: 'all',
                    })
                  } else {
                    toast('Something went wrong.')
                  }
                }
              }}
            >
              <Delete />
            </Button>
            <Button variant={'secondary'}>
              <Edit />
            </Button>
            <Button variant={'constructive'}>
              <Play />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadoutBrowser
