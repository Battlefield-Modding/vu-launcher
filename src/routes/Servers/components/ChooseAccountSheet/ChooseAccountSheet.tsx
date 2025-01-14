import { getaccounts, playVUOnLocalServer, startServerLoadout } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader, Server, UserCheck } from 'lucide-react'
import ChooseAccountForm from './ChooseAccountForm'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

function ChooseAccountSheet({
  name,
  getServerPassword,
}: {
  name: string
  getServerPassword: () => string
}) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.UserList],
    queryFn: getaccounts,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>LOADING USERS</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>ERROR: No Users Found</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  async function handlePlay(users: number[]) {
    let status = await startServerLoadout(name)
    if (status) {
      toast('Started VU Server. Starting Client in 1 second...')
      setTimeout(() => {
        playVUOnLocalServer(getServerPassword(), users)
      }, 1000)
    } else {
      toast(`Failed to start loadout: ${name}`)
    }
  }

  function updateUsers(users: number[]) {
    handlePlay(users)
  }

  if (!data || !data[0]) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>No Users Found</h1>
      </div>
    )
  } else {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger>
          <div className="m-auto flex gap-1 rounded-md bg-green-600 p-1.5 hover:bg-green-600/80">
            <Server />
            <UserCheck />
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="m-auto w-96">
            <SheetTitle>
              Join <code>{name}</code> with what account(s)?
            </SheetTitle>
            <SheetDescription>
              Choose which VU accounts to join with when your server <code>{name}</code> starts.
            </SheetDescription>
          </SheetHeader>
          <br />
          <ChooseAccountForm setSheetOpen={setSheetOpen} users={data} updateUsers={updateUsers} />
        </SheetContent>
      </Sheet>
    )
  }
}

export default ChooseAccountSheet
