import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Plus, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { doesCredentialsExist } from '@/api'
import clsx from 'clsx'
import ServerForm from './LoadoutForm'
import { Loadout } from '@/config/config'

export default function LoadoutSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'flex gap-2 rounded-md p-2 text-xl leading-6 text-secondary hover:bg-green-800/80',
            'bg-green-800',
          )}
        >
          Create a Server
          <Plus />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Save Server Loadout</SheetTitle>
          <SheetDescription>Creates a Loadout for a server</SheetDescription>
        </SheetHeader>
        <br />
        <ServerForm setSheetOpen={setSheetOpen} defaultConfig={undefined!} />
      </SheetContent>
    </Sheet>
  )
}
