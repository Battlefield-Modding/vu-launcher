import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Wrench } from 'lucide-react'
import { useRef, useState } from 'react'
import { StartupForm } from './StartupForm'
import { LoadoutJSON } from '@/config/config'
import { useTranslation } from 'react-i18next'

export function StartupSheet({ existingLoadout }: { existingLoadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [prevKeys, setPrevKeys] = useState<Array<String>>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex items-center justify-center gap-2 rounded-md bg-secondary p-2 text-xl text-primary hover:bg-secondary/80">
          {t('servers.loadouts.loadout.startup.sheet.trigger')}
          <Wrench />
        </div>
      </SheetTrigger>
      <SheetContent
        className="overflow-y-scroll"
        onKeyDown={(e) => {
          if (prevKeys[prevKeys.length - 1] === 'Control') {
            if (e.key === 'f') {
              searchRef.current?.focus()
              e.preventDefault()
            }
          }
          let tempArr = [...prevKeys]
          tempArr.push(e.key)
          setPrevKeys(() => tempArr)
        }}
        onKeyUp={() => {
          if (prevKeys.length > 0) {
            let tempArr = [...prevKeys]
            tempArr.pop()
            setPrevKeys(() => tempArr)
          }
        }}
      >
        <SheetHeader className="hidden">
          <SheetTitle>{t('servers.loadouts.loadout.startup.sheet.title')}</SheetTitle>
          <SheetDescription>
            {t('servers.loadouts.loadout.startup.sheet.description')}
          </SheetDescription>
        </SheetHeader>

        <StartupForm
          setSheetOpen={setSheetOpen}
          existingLoadout={existingLoadout}
          searchRef={searchRef}
        />
      </SheetContent>
    </Sheet>
  )
}
