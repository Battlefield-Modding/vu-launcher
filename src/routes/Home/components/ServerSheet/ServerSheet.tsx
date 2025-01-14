import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Server } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import ServerForm from './ServerForm'

export default function ServerSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'text-md flex justify-center gap-1 rounded-md bg-secondary p-1.5 text-primary hover:bg-secondary/80',
          )}
        >
          Add Server
          <Server />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add a Server to Auto-Join</SheetTitle>
          <SheetDescription>
            You will need a GUID that looks like: <code>5ccbc53a-6266-4b83-b782-c98cc49da88f</code>
          </SheetDescription>
        </SheetHeader>
        <br />
        <ServerForm setSheetOpen={setSheetOpen} />
      </SheetContent>
    </Sheet>
  )
}
