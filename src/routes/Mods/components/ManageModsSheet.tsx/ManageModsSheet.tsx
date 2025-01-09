import { getModNamesInCache } from '@/api'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader, Trash } from 'lucide-react'
import { useState } from 'react'
import Mod from './Mod'

export default function ManageModsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetModNamesInCache],
    queryFn: getModNamesInCache,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Fetching Server Loadouts</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>ERROR: No Loadouts Found</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return <></>
  }

  console.log(data)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-red-600 p-4 text-white hover:bg-red-600/80">
          Delete Mods <Trash />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Mods inside <code>mod-cache</code>
          </SheetTitle>
          <SheetDescription>Delete</SheetDescription>
        </SheetHeader>
        <div className="flex w-full flex-wrap justify-between">
          {data.map((x, index) => {
            return <Mod modName={x} key={`${index}-${x}`} />
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
