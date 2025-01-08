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
            'text-md flex rounded-md p-1.5 text-secondary',
            !credsExist && 'bg-red-600 hover:bg-red-600/80',
            credsExist && 'bg-green-600 hover:bg-green-600/80',
          )}
        >
          {credsExist ? 'AutoLogin' : 'Click to Login'}
          <User />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Save VU Credentials</SheetTitle>
          <SheetDescription>
            <p>No account? Sign up here: </p>
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
        <PlayerCredentialsForm setSheetOpen={setSheetOpen} checkCreds={checkCreds} />
      </SheetContent>
    </Sheet>
  )
}
