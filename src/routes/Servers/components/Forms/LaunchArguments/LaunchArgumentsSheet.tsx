import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Rocket } from 'lucide-react'
import { useState } from 'react'
import { LaunchArgumentForm } from './LaunchArgumentsForm'
import { LoadoutJSON } from '@/config/config'

export function LaunchArgumentSheet({ existingLoadout }: { existingLoadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex w-fit items-center gap-2 rounded-md bg-primary p-2 text-xl text-secondary hover:bg-primary/80">
          Launch Arguments
          <Rocket />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Manage Startup.txt</SheetTitle>
          <SheetDescription>Takes Startup.txt arguments and stores them</SheetDescription>
        </SheetHeader>
        <br />

        <LaunchArgumentForm setSheetOpen={setSheetOpen} existingLoadout={existingLoadout} />
      </SheetContent>
    </Sheet>
  )
}
