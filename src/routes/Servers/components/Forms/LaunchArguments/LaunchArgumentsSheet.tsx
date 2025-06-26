import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Rocket } from 'lucide-react'
import { useRef, useState } from 'react'
import { LaunchArgumentForm } from './LaunchArgumentsForm'
import { LoadoutJSON } from '@/config/config'
import { useTranslation } from 'react-i18next'

export function LaunchArgumentSheet({ existingLoadout }: { existingLoadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [prevKeys, setPrevKeys] = useState<Array<String>>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger className="m-auto flex h-full w-full bg-secondary p-1 text-center text-xl text-primary hover:bg-secondary/80">
        <Rocket className="m-auto" />
      </SheetTrigger>
      <SheetContent
        className="overflow-y-auto"
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
          <SheetTitle>{t('servers.loadouts.loadout.launchArgs.sheet.title')}</SheetTitle>
          <SheetDescription>
            {t('servers.loadouts.loadout.launchArgs.sheet.description')}
          </SheetDescription>
        </SheetHeader>

        <LaunchArgumentForm
          setSheetOpen={setSheetOpen}
          existingLoadout={existingLoadout}
          searchRef={searchRef}
        />
      </SheetContent>
    </Sheet>
  )
}
