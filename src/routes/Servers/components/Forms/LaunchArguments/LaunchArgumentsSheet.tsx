import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Rocket } from 'lucide-react'
import { useRef, useState } from 'react'
import { LaunchArgumentForm } from './LaunchArgumentsForm'
import { LoadoutJSON } from '@/config/config'

export function LaunchArgumentSheet({ existingLoadout }: { existingLoadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [prevKeys, setPrevKeys] = useState<Array<String>>([])
  const searchRef = useRef<HTMLInputElement>(null)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex w-fit items-center gap-2 rounded-md bg-primary p-2 text-xl text-secondary hover:bg-primary/80">
          Launch Arguments
          <Rocket />
        </div>
      </SheetTrigger>
      <SheetContent
        className="overflow-y-scroll"
        onKeyDown={(e) => {
          if (prevKeys[prevKeys.length - 1] === 'Control') {
            if (e.key === 'f') {
              searchRef.current?.focus()
              e.preventDefault()
            }
          }
          let tempArr = [...prevKeys]
          tempArr.push(e.key)
          setPrevKeys(() => tempArr)
        }}
        onKeyUp={() => {
          if (prevKeys.length > 0) {
            let tempArr = [...prevKeys]
            tempArr.pop()
            setPrevKeys(() => tempArr)
          }
        }}
      >
        <SheetHeader className="hidden">
          <SheetTitle>Launch Arguments Form</SheetTitle>
          <SheetDescription>Tweak your launch arguments here!</SheetDescription>
        </SheetHeader>

        <LaunchArgumentForm
          setSheetOpen={setSheetOpen}
          existingLoadout={existingLoadout}
          searchRef={searchRef}
        />
      </SheetContent>
    </Sheet>
  )
}
