import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Hammer } from 'lucide-react'
import { useState } from 'react'
import { BanlistForm } from './BanlistForm'
import { LoadoutJSON } from '@/config/config'
import { useTranslation } from 'react-i18next'
import { TooltipWrapper } from '@/components/TooltipWrapper'

export function BanlistSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <TooltipWrapper text={t('servers.loadouts.loadout.banlist.sheet.trigger')}>
          <div className="flex items-center justify-center gap-2 rounded-md bg-secondary p-4 text-xl text-primary hover:bg-secondary/80">
            <Hammer />
          </div>
        </TooltipWrapper>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="hidden">
          <SheetTitle className="m-auto">
            {t('servers.loadouts.loadout.banlist.sheet.title')}
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <BanlistForm setSheetOpen={setSheetOpen} loadout={loadout} />
      </SheetContent>
    </Sheet>
  )
}
