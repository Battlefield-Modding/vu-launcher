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

export function BanlistSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger className="m-auto flex h-full w-full bg-secondary p-1 text-center text-xl text-primary hover:bg-secondary/80">
        <Hammer className="m-auto" />
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
