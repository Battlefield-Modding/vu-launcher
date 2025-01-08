import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Download } from 'lucide-react'
import { useState } from 'react'

export default function VUMMSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-secondary p-4 hover:bg-secondary/80">
          VUMM <Download />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="w-96">
          <SheetTitle>Install Mods with VU Mod Manager</SheetTitle>
          <SheetDescription>
            Don't have vumm installed? Get it here:{' '}
            <a href="https://github.com/BF3RM/vumm-cli" className="text-blue-800 underline">
              https://github.com/BF3RM/vumm-cli
            </a>
          </SheetDescription>
        </SheetHeader>
        <div>HELLO WORLD</div>
        <br />
      </SheetContent>
    </Sheet>
  )
}
