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
import { MaplistForm } from './MaplistForm'

export function MaplistSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'flex gap-2 rounded-md p-2 text-xl leading-6 hover:bg-green-300/80',
            'bg-green-300',
          )}
        >
          Maplist.txt
          <Plus />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Manage Maplist.txt</SheetTitle>
          <SheetDescription>Updates your Maplist</SheetDescription>
        </SheetHeader>
        <br />
        <MaplistForm setSheetOpen={setSheetOpen} />
      </SheetContent>
    </Sheet>
  )
}
