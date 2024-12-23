import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { User } from 'lucide-react'
import PlayerCredentialsForm from './credentials-form'
import { useEffect, useState } from 'react'
import { doesCredentialsExist } from '@/api'
import clsx from 'clsx'

export default function CredentialsSheet() {
  const [credsExist, setCredsExist] = useState(false)

  async function checkCreds() {
    const result = await doesCredentialsExist()
    setCredsExist(result)
  }

  useEffect(() => {
    checkCreds()
  }, [])

  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'text-md flex rounded-md p-1.5 text-secondary hover:bg-primary',
            !credsExist && 'bg-red-600',
            credsExist && 'bg-green-600',
          )}
        >
          {credsExist ? 'AutoLogin' : 'Click to Login'}
          <User />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Save VU Credentials</SheetTitle>
          <SheetDescription>Updates your credentials for VU Auto-Login</SheetDescription>
        </SheetHeader>
        <br />
        <PlayerCredentialsForm setSheetOpen={setSheetOpen} checkCreds={checkCreds} />
      </SheetContent>
    </Sheet>
  )
}
