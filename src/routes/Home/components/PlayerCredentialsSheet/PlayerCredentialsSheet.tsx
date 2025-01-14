import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Loader, User } from 'lucide-react'
import PlayerCredentialsForm from './PlayerCredentialsForm'
import { useState } from 'react'
import { doesCredentialsExist } from '@/api'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'

export default function PlayerCredentialsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.CredentialsExist],
    queryFn: doesCredentialsExist,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>LOADING Mods</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>ERROR: No Mods Found</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  const credsExist = data

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'text-md flex rounded-md p-1.5 text-secondary',
            !credsExist && 'bg-red-600 hover:bg-red-600/80',
            credsExist && 'bg-green-600 hover:bg-green-600/80',
          )}
        >
          {credsExist ? 'Add User' : 'Click to Login'}
          <User />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Save VU Credentials</SheetTitle>
          <SheetDescription>
            No account? Sign up here:
            <a
              className="text-blue-800 underline"
              href="https://veniceunleashed.net/signup"
              target="_blank"
            >
              https://veniceunleashed.net/signup
            </a>
          </SheetDescription>
        </SheetHeader>
        <br />
        <PlayerCredentialsForm setSheetOpen={setSheetOpen} />
      </SheetContent>
    </Sheet>
  )
}
