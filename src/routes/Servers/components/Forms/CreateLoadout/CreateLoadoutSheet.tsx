import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Loader, Plus } from 'lucide-react'
import { useState } from 'react'
import { CreateLoadoutForm } from './CreateLoadoutForm'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { getModNamesInCache } from '@/api'

export function CreateLoadoutSheet() {
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
        <div className="flex items-center justify-between gap-2 bg-green-700 p-2 text-lg text-primary hover:bg-green-700/80">
          Create Loadout
          <Plus />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle className="text-center text-2xl">Create Loadout</SheetTitle>
        </SheetHeader>
        <br />
        <CreateLoadoutForm setSheetOpen={setSheetOpen} mods={data} />
      </SheetContent>
    </Sheet>
  )
}
