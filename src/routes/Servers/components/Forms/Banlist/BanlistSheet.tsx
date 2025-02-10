import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Hammer } from 'lucide-react'
import { useState } from 'react'
import { BanlistForm } from './BanlistForm'
import { LoadoutJSON } from '@/config/config'

export function BanlistSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex w-fit items-center gap-2 rounded-md bg-secondary p-2 text-xl text-primary hover:bg-secondary/80">
          Banlist
          <Hammer />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader className="hidden">
          <SheetTitle>Banlist</SheetTitle>
          <SheetDescription>Update list of prohibited players</SheetDescription>
        </SheetHeader>
        <BanlistForm setSheetOpen={setSheetOpen} loadout={loadout} />
      </SheetContent>
    </Sheet>
  )
}
