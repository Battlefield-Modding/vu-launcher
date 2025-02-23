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
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { getLoadoutNames } from '@/api'
import { UploadLoadoutForm } from './UploadLoadoutForm'

export function UploadLoadoutSheet() {
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
        <div className="flex items-center justify-between gap-2 bg-gray-600 p-2 text-lg hover:bg-gray-600/80">
          Import loadout
          <Upload />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-center text-2xl">Import Loadout</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <br />
        <UploadLoadoutForm existingLoadoutNames={data} setSheetOpen={setSheetOpen} />
        {/* <LoadoutForm setSheetOpen={setSheetOpen} mods={data} /> */}
      </SheetContent>
    </Sheet>
  )
}
