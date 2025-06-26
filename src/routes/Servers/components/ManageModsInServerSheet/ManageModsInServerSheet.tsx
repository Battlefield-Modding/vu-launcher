import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { LoadoutJSON } from '@/config/config'
import { Book } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipWrapper } from '@/components/TooltipWrapper'
import { CacheModContainer } from './mods/CacheModContainer'
import { LoadoutModContainer } from './mods/LoadoutModContainer'
import ImportModsSheet from '@/routes/Mods/components/ImportModsSheet/ImportModsSheet'

export function ManageModsInServerSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <TooltipWrapper text={t('servers.loadouts.loadout.mods.sheet.trigger')}>
          <div className="flex items-center justify-center gap-2 rounded-md bg-secondary p-4 text-xl text-primary hover:bg-secondary/80">
            <Book />
          </div>
        </TooltipWrapper>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <div className="m-auto flex max-w-screen-lg flex-col gap-2 text-center">
          <div className="m-auto w-fit">
            <ImportModsSheet importToLoadout={true} />
          </div>

          <LoadoutModContainer loadout={loadout} />

          <CacheModContainer loadout={loadout} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
