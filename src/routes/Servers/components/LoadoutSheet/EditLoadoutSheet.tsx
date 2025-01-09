import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Edit } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import LoadoutForm from './LoadoutForm'
import { Loadout } from '@/config/config'

export default function EditLoadoutSheet({ existingConfig }: { existingConfig: Loadout }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'flex gap-2 rounded-md p-2 text-xl leading-6 text-secondary hover:bg-gray-600/80',
            'bg-gray-600',
          )}
        >
          <Edit />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Edit Server Loadout</SheetTitle>
          <SheetDescription>Modifies existing Loadout for a server</SheetDescription>
        </SheetHeader>
        <br />
        <LoadoutForm
          setSheetOpen={setSheetOpen}
          existingConfig={existingConfig}
          mods={undefined!}
        />
      </SheetContent>
    </Sheet>
  )
}
