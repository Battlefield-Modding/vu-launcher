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
      <SheetTrigger className="ml-auto">
        <div className={clsx('flex text-xs text-blue-500 hover:text-blue-400')}>
          {t('home.server.sheet.trigger')}
        </div>
      </SheetTrigger>
      <SheetContent className="content-center p-8">
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
