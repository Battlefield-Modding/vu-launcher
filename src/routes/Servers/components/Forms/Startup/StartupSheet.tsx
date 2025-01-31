import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { StartupForm } from './StartupForm'
import { LoadoutJSON } from '@/config/config'

export function StartupSheet({ existingLoadout }: { existingLoadout: LoadoutJSON }) {
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
          S
          <Plus />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Manage Startup.txt</SheetTitle>
          <SheetDescription>Takes Startup.txt arguments and stores them</SheetDescription>
        </SheetHeader>
        <br />

        <StartupForm setSheetOpen={setSheetOpen} existingLoadout={existingLoadout} />
      </SheetContent>
    </Sheet>
  )
}
