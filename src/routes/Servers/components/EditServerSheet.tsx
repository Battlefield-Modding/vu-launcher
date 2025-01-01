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
import { getServerLoadout } from '@/api'
import clsx from 'clsx'
import ServerForm from './server-form'
import { Loadout, QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'

export default function EditServerSheet({ name }: { name: string }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { isPending, isError, data, error } = useQuery({
    queryKey: [`${QueryKey.GetServerLoadout}-${name}`],
    queryFn: async () => {
      const data = await getServerLoadout(name)
      return data
    },
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>Fetching Loadout {name}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>ERROR: No Loadouts Found</h1>
      </div>
    )
  }

  if (!data) {
    return <></>
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
          <Edit />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Save Server Loadout</SheetTitle>
          <SheetDescription>Creates a Loadout for a server</SheetDescription>
        </SheetHeader>
        <br />
        <ServerForm setSheetOpen={setSheetOpen} defaultConfig={data} />
      </SheetContent>
    </Sheet>
  )
}