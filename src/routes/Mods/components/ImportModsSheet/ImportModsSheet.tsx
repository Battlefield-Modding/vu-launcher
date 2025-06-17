import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Folder, FolderArchive, Upload } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModFolderImport } from './ModFolderImport'
import { ZippedModImport } from './ZippedModImport'
import clsx from 'clsx'

export default function ImportModsSheet({ importToLoadout }: { importToLoadout: boolean }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [zipActive, setZipActive] = useState(false)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-green-700 p-4 text-white hover:bg-green-700/80">
          {t('mods.import.sheet.trigger')} <Upload />
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-center">{t('mods.import.sheet.title')}</SheetTitle>
        </SheetHeader>
        <br />
        <div className="flex justify-center gap-8">
          <div
            className={clsx(
              'min-h-20 min-w-20 flex-col items-center justify-center rounded-md border bg-secondary p-4 transition hover:cursor-pointer hover:bg-secondary/80',
              zipActive && 'border-cyan-500',
              importToLoadout && 'hidden',
              !importToLoadout && 'flex',
            )}
            onClick={() => {
              setZipActive(() => true)
            }}
          >
            .zip <FolderArchive />
          </div>
          <div
            className={clsx(
              'flex min-h-20 min-w-20 flex-col items-center justify-center rounded-md border bg-secondary p-4 transition hover:cursor-pointer hover:bg-secondary/80',
              !zipActive && 'border-cyan-500',
            )}
            onClick={() => {
              setZipActive(() => false)
            }}
          >
            {t('mods.import.sheet.folder')} <Folder />
          </div>
        </div>
        {zipActive && !importToLoadout && <ZippedModImport importToLoadout={importToLoadout} />}
        {!zipActive && <ModFolderImport importToLoadout={importToLoadout} />}
      </SheetContent>
    </Sheet>
  )
}
