import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Edit, Loader } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { LoadoutJSON, QueryKey, STALE } from '@/config/config'
import { EditLoadoutForm } from './EditLoadoutForm'
import { getModNamesInCache, getModNamesInLoadout } from '@/api'
import { useQuery } from '@tanstack/react-query'

export function EditLoadoutSheet({ existingConfig }: { existingConfig: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetAllModNames],
    queryFn: async () => {
      const modsInCache = await getModNamesInCache()
      const modsInLoadout = await getModNamesInLoadout(existingConfig.name)

      return { modsInCache, modsInLoadout }
    },
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
        <div className="flex w-fit items-center gap-2 rounded-md bg-gray-600 p-2 text-xl text-secondary hover:bg-gray-600/80">
          Edit
          <Edit />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>
            Edit Loadout{' '}
            <code className="text-md rounded-md bg-gray-800 p-1 pl-2 pr-2 text-white">
              {existingConfig.name}
            </code>
          </SheetTitle>
          <SheetDescription>Modifies existing Loadout for a server</SheetDescription>
        </SheetHeader>
        <br />
        <EditLoadoutForm setSheetOpen={setSheetOpen} existingConfig={existingConfig} mods={data} />
      </SheetContent>
    </Sheet>
  )
}
