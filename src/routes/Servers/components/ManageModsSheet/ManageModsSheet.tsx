import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Loadout } from '@/config/config'
import { Book } from 'lucide-react'
import { useState } from 'react'
import Mod from './Mod'

export default function ManageModsSheet({ loadout }: { loadout: Loadout }) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-2 rounded-md bg-secondary p-2 text-xl leading-6 text-primary hover:bg-secondary/80">
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
          {loadout.mods?.length > 0 &&
            loadout.mods.map((modName, modIndex) => (
              <Mod modName={modName} loadoutName={loadout.name} key={`${modName}-${modIndex}`} />
            ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
