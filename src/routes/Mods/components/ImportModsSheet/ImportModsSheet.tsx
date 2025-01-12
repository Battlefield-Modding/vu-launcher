import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import ModUpload from './ModUpload'
import { Upload } from 'lucide-react'
import { useState } from 'react'

export default function ImportModsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-green-700 p-4 text-white hover:bg-green-700/80">
          Import Mods <Upload />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="m-auto w-96">
          <SheetTitle>Import a Venice Unleashed Mod</SheetTitle>
          <SheetDescription>Accepts .zip files.</SheetDescription>
        </SheetHeader>
        <br />
        <ModUpload />
      </SheetContent>
    </Sheet>
  )
}
