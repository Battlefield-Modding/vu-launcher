import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { ActivateBF3Tooltip } from './ActivateBF3Tooltip'
import { Input } from '@/components/ui/input'
import { activateBf3EaAuthToken, activateBf3LSX } from '@/api'
import { useTranslation } from 'react-i18next'

export function ActivateBF3Sheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [eaToken, setEAToken] = useState('')
  const { t } = useTranslation()

  function handleActivateLSX() {
    toast(t('settings.activateBF3.sheet.option1.toast'))
    activateBf3LSX()
  }

  function handleActivateEAToken() {
    toast(t('settings.activateBF3.sheet.option2.toast'))
    activateBf3EaAuthToken(eaToken)
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <ActivateBF3Tooltip />
      </SheetTrigger>
      <SheetContent className="overflow-y-none flex flex-col gap-12">
        <SheetHeader>
          <SheetTitle className="text-4xl">{t('settings.activateBF3.sheet.title')}</SheetTitle>
        </SheetHeader>
        <div>
          <h1 className="text-2xl">{t('settings.activateBF3.sheet.option1.title')}</h1>
          <ul className="m-4 ml-8 list-disc">
            <li>{t('settings.activateBF3.sheet.option1.step1')}</li>
            <li>{t('settings.activateBF3.sheet.option1.step2')}</li>
          </ul>
          <Button variant={'constructive'} onClick={handleActivateLSX} className="ml-8">
            {t('settings.activateBF3.sheet.option1.button')}
          </Button>
        </div>

        <div className="max-w-5xl">
          <h1 className="text-2xl">{t('settings.activateBF3.sheet.option2.title')}</h1>
          <ul className="m-4 ml-8 list-disc">
            <li>{t('settings.activateBF3.sheet.option2.step1')}</li>
            <li>
              {t('settings.activateBF3.sheet.option2.step2')}
              <code className="rounded-md bg-secondary p-1">-activate -lsx -wait</code>{' '}
            </li>
            <li>{t('settings.activateBF3.sheet.option2.step3')}</li>
          </ul>
          <div className="ml-8 flex">
            <Input
              type="text"
              className="w-1/2"
              placeholder={t('settings.activateBF3.sheet.option2.placeholder')}
              onChange={(e) => {
                const target = e.target as HTMLInputElement
                setEAToken(() => target.value)
                console.log(eaToken)
              }}
            />

            <Button
              variant={'constructive'}
              onClick={handleActivateEAToken}
              disabled={eaToken.length < 1}
            >
              {t('settings.activateBF3.sheet.option2.button')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
