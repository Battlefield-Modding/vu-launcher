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
            'text-md flex justify-center rounded-md bg-secondary p-1.5 text-primary hover:bg-secondary/80',
          )}
        >
          {credsExist ? 'Add User' : 'Login'}
          <User />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader >
          <SheetTitle className='text-center'>Save VU Credentials</SheetTitle>
          <SheetDescription className='text-center'>
            No account? Sign up here:
            <a
              className="text-blue-500 underline ml-1"
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
