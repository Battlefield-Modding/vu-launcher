import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Map } from 'lucide-react'
import { useState } from 'react'
import { MaplistForm } from './MaplistForm'
import { LoadoutJSON } from '@/config/config'
import { useTranslation } from 'react-i18next'
import { TooltipWrapper } from '@/components/TooltipWrapper'

export function MaplistSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <TooltipWrapper text={t('servers.loadouts.loadout.maplist.sheet.trigger')}>
          <div className="flex items-center justify-center gap-2 rounded-md bg-secondary p-2 text-xl text-primary hover:bg-secondary/80">
            <Map />
          </div>
        </TooltipWrapper>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader>
          <SheetTitle className="m-auto text-xl">
            {t('servers.loadouts.loadout.maplist.sheet.title')}
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <br />
        <MaplistForm setSheetOpen={setSheetOpen} loadout={loadout} />
      </SheetContent>
    </Sheet>
  )
}
