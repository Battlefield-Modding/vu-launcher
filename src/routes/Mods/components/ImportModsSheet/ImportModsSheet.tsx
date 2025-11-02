import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import ImportModsForm from './ImportModsForm'

export default function ImportModsSheet({
  importToLoadout,
  loadoutName,
}: {
  importToLoadout: boolean
  loadoutName: string | undefined
}) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="m-auto flex w-fit justify-center gap-1 rounded-md bg-green-700 p-4 text-primary hover:bg-green-700/80">
          {t('mods.import.sheet.trigger')} <Upload />
        </div>
      </SheetTrigger>
      <SheetContent className={'flex flex-col'}>
        <SheetHeader>
          <SheetTitle className="text-center">{t('mods.import.sheet.title')}</SheetTitle>
        </SheetHeader>
        <br />

        <ImportModsForm importToLoadout={importToLoadout} loadoutName={loadoutName} />
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
