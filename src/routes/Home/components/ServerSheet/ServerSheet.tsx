import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Server } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import ServerForm from './ServerForm'
import { useTranslation } from 'react-i18next'

export default function ServerSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div
          className={clsx(
            'text-md flex items-center justify-center gap-1 rounded-md bg-secondary p-1.5 text-primary hover:bg-secondary/80',
          )}
        >
          {t('home.server.sheet.trigger')}

          <Server />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-center">{t('home.server.sheet.title')}</SheetTitle>
          <SheetDescription className="text-center">
            {t('home.server.sheet.description')}
          </SheetDescription>
        </SheetHeader>
        <br />
        <ServerForm setSheetOpen={setSheetOpen} />
      </SheetContent>
    </Sheet>
  )
}
