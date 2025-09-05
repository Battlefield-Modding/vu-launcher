import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LoadoutJSON } from '@/config/config'
import { Book } from 'lucide-react'
import { useState } from 'react'

import { CacheModContainer } from './mods/CacheModContainer'
import { LoadoutModContainer } from './mods/LoadoutModContainer'
import ImportModsSheet from '@/routes/Mods/components/ImportModsSheet/ImportModsSheet'

export function ManageModsInServerSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger className="m-auto flex h-full w-full bg-secondary p-1 text-center text-xl text-primary hover:bg-secondary/80">
        <Book className="m-auto" />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <div className="m-auto flex max-w-screen-lg flex-col gap-2 text-center">
          <div className="m-auto w-fit">
            <ImportModsSheet importToLoadout={true} loadoutName={loadout.name} />
          </div>

          <LoadoutModContainer loadoutName={loadout.name} />

          <CacheModContainer loadout={loadout} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
