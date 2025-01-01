import EditServerSheet from './EditServerSheet'
import { Button } from '@/components/ui/button'
import { Delete, Play } from 'lucide-react'
import { deleteServerLoadout, playVU, startServerLoadout } from '@/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'

function ServerLoadoutPreview({ name, index }: { name: string; index: number }) {
  const queryClient = useQueryClient()
  return (
    <div key={`${name}-${index}`} className="rounded-md border border-black bg-black p-4">
      <h1 className="mb-8 flex gap-4 text-xl">
        {name.length >= 15 ? `${name.substring(0, 15)}...` : name}
        <EditServerSheet name={name} />
      </h1>

      <div className="flex justify-between gap-4">
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
        <Button
          variant={'constructive'}
          onClick={async () => {
            let status = await startServerLoadout(name)
            if (status) {
              toast('Started VU Server. Starting Client in 10 seconds...')
              setTimeout(() => {
                playVU('YOUR_SERVER_PASSWORD_HERE')
              }, 10000)
            } else {
              toast('Something went wrong starting VU Server...')
            }
          }}
        >
          <Play />
        </Button>
      </div>
    </div>
  )
}

export default ServerLoadoutPreview
