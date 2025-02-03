import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { LoadoutJSON } from '@/config/config'
import { Book } from 'lucide-react'
import { useState } from 'react'
import { Mod } from './Mod'

export function ManageModsInServerSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  if (loadout.modlist && loadout.modlist.length > 0) {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger>
          <div className="flex w-fit items-center gap-2 rounded-md bg-secondary p-2 text-xl text-primary hover:bg-secondary/80">
            Mods
            <Book />
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="underline">
              Mods inside <code>{loadout.name}</code>
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-wrap gap-8">
            {loadout.modlist.map((modName, modIndex) => (
              <Mod modName={modName} loadoutName={loadout.name} key={`${modName}-${modIndex}`} />
            ))}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex w-fit items-center gap-2 rounded-md bg-secondary p-2 text-xl text-primary hover:bg-secondary/80">
          Mods
          <Book />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="underline">
            Mods inside <code>{loadout.name}</code>
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-wrap gap-8">No mods.</div>
      </SheetContent>
    </Sheet>
  )
}
