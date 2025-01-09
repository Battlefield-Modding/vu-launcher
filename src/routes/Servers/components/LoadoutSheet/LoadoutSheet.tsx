import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Loader, Plus } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import LoadoutForm from './LoadoutForm'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { getModNamesInCache } from '@/api'

export default function LoadoutSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetModNamesInCache],
    queryFn: getModNamesInCache,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>LOADING Mods</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>ERROR: No Mods Found</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'flex gap-2 rounded-md p-2 text-xl leading-6 text-secondary hover:bg-green-800/80',
            'bg-green-800',
          )}
        >
          Create a Server
          <Plus />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Save Server Loadout</SheetTitle>
          <SheetDescription>Creates a Loadout for a server</SheetDescription>
        </SheetHeader>
        <br />
        <LoadoutForm setSheetOpen={setSheetOpen} existingConfig={undefined!} mods={data} />
      </SheetContent>
    </Sheet>
  )
}
