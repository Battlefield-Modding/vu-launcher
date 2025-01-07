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

export default function EditServerSheet({ name, data }: { name: string; data: Loadout }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'flex gap-2 rounded-md p-2 text-xl leading-6 text-secondary hover:bg-gray-600/80',
            'bg-gray-600',
          )}
        >
          <Edit />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle>Edit Server Loadout</SheetTitle>
          <SheetDescription>Modifies existing Loadout for a server</SheetDescription>
        </SheetHeader>
        <br />
        <ServerForm setSheetOpen={setSheetOpen} defaultConfig={data} />
      </SheetContent>
    </Sheet>
  )
}
