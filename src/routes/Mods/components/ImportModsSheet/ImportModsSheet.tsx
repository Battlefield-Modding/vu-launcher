import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import ModUpload from './ModUpload'
import { Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ImportModsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-green-700 p-4 text-white hover:bg-green-700/80">
          {t('mods.import.sheet.trigger')} <Upload />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader className="m-auto w-96">
          <SheetTitle>{t('mods.import.sheet.title')}</SheetTitle>
          <SheetDescription>{t('mods.import.sheet.description')}</SheetDescription>
        </SheetHeader>
        <br />
        <ModUpload />
      </SheetContent>
    </Sheet>
  )
}
