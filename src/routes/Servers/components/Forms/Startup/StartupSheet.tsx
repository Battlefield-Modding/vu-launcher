import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Wrench } from 'lucide-react'
import { useRef, useState } from 'react'
import { StartupForm } from './StartupForm'
import { LoadoutJSON } from '@/config/config'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function StartupSheet({ existingLoadout }: { existingLoadout: LoadoutJSON }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [prevKeys, setPrevKeys] = useState<Array<String>>([])
  const searchRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger className="m-auto flex h-full w-full bg-secondary p-1 text-center text-xl text-primary hover:bg-secondary/80">
        <Wrench className="m-auto" />
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
