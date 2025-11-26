import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { LoadoutJSON } from '@/config/config'
import { Book } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import ManageModsInServerForm from './ManageModsInServerForm'

export function ManageModsInServerSheet({ loadout }: { loadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger className="m-auto flex h-full w-full bg-secondary p-1 text-center text-xl text-primary hover:bg-secondary/80">
        <Book className="m-auto" />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="hidden">
          <SheetTitle>Manage Mods</SheetTitle>
        </SheetHeader>
        <ManageModsInServerForm loadout={loadout} />
        <SheetFooter className="fixed bottom-4 left-4 m-0 p-0">
          <SheetClose asChild>
            <Button className="w-24" variant="outline">
              {t('button.back')}
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
