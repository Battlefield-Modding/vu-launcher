import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Loader, Upload } from 'lucide-react'
import { useState } from 'react'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { getLoadoutNames } from '@/api'
import { UploadLoadoutForm } from './UploadLoadoutForm'
import { useTranslation } from 'react-i18next'

export function UploadLoadoutSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.ServerLoadouts],
    queryFn: getLoadoutNames,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>{t('servers.loadouts.importLoadout.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-primary">
        <h1>{t('servers.loadouts.importLoadout.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex h-full min-w-20 items-center justify-between gap-2 bg-gray-600 p-2 text-lg hover:bg-gray-600/80">
          {t('servers.loadouts.importLoadout.sheet.trigger')}
          <Upload />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-center text-2xl">
            {t('servers.loadouts.importLoadout.sheet.title')}
          </SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <br />
        <UploadLoadoutForm existingLoadoutNames={data} setSheetOpen={setSheetOpen} />
        {/* <LoadoutForm setSheetOpen={setSheetOpen} mods={data} /> */}
      </SheetContent>
    </Sheet>
  )
}
