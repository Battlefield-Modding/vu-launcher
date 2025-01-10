import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Loader, Upload } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { getLoadoutNames } from '@/api'
import LoadoutUploadForm from './LoadoutUploadForm'

export default function LoadoutUploadSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.ServerLoadouts],
    queryFn: getLoadoutNames,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Getting Loadout names</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>ERROR: No loadouts Found</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'flex gap-2 rounded-md p-2 text-xl leading-6 hover:bg-secondary/80',
            'bg-secondary',
          )}
        >
          Import loadout
          <Upload />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Import Loadout</SheetTitle>
          <SheetDescription>
            Have an existing loadout somewhere? Drag n Drop it here!
          </SheetDescription>
        </SheetHeader>
        <br />
        <LoadoutUploadForm existingLoadoutNames={data} setSheetOpen={setSheetOpen} />
        {/* <LoadoutForm setSheetOpen={setSheetOpen} mods={data} /> */}
      </SheetContent>
    </Sheet>
  )
}
