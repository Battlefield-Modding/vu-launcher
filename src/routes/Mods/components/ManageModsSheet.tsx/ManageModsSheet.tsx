import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Wrench } from 'lucide-react'
import { useState } from 'react'

export default function ManageModsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-secondary p-4 hover:bg-secondary/80">
          Manage Mods <Wrench />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="m-auto w-96">
          <SheetTitle>Manage your VU Mods</SheetTitle>
          <SheetDescription>Delete</SheetDescription>
        </SheetHeader>
        <br />
      </SheetContent>
    </Sheet>
  )
}
