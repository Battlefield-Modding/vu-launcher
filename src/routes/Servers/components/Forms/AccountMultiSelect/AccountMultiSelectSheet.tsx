import { getUsers, playVUOnLocalServer, startServerLoadout } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader, Server, UserCheck } from 'lucide-react'
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
import { AccountMultiSelectForm } from './AccountMultiSelectForm'

export function ChooseAccountSheet({ loadoutName }: { loadoutName: string }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.UserList],
    queryFn: getUsers,
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
    let status = await startServerLoadout(loadoutName)
    if (status) {
      toast('Started VU Server. Starting Client in 1 second...')
      setTimeout(() => {
        playVUOnLocalServer(loadoutName, users)
      }, 1000)
    } else {
      toast(`Failed to start loadout: ${loadoutName}`)
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
          <div className="flex w-fit justify-between gap-2 rounded-md bg-green-800 p-2 text-primary hover:cursor-pointer hover:bg-green-800/80">
            Start Server and Multiple Clients
            <Server />
            <UserCheck />
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="m-auto w-96">
            <SheetTitle>
              Join <code>{loadoutName}</code> with what account(s)?
            </SheetTitle>
            <SheetDescription>
              Choose which VU accounts to join with when your server <code>{loadoutName}</code>{' '}
              starts.
            </SheetDescription>
          </SheetHeader>
          <br />
          <AccountMultiSelectForm
            setSheetOpen={setSheetOpen}
            usernames={data}
            updateUsers={updateUsers}
          />
        </SheetContent>
      </Sheet>
    )
  }
}
