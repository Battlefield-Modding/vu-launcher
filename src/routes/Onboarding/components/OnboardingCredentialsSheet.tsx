import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

import { Loader } from 'lucide-react'
import { PlayerCredentialsForm } from '@/routes/Home/components/PlayerCredentialsSheet/PlayerCredentialsForm'
import { useState } from 'react'
import { doesCredentialsExist } from '@/api'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import { useTranslation } from 'react-i18next'

export function OnboardingCredentialsSheet() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.CredentialsExist],
    queryFn: doesCredentialsExist,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>{t('home.playerCredentials.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-primary">
        <h1>{t('home.playerCredentials.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  const credsExist = data

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger className="flex w-full">
        <div
          className={clsx(
            'inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
          )}
        >
          {credsExist
            ? t('home.playerCredentials.sheet.addUser')
            : t('home.playerCredentials.sheet.login')}
        </div>
      </SheetTrigger>
      <SheetContent className="content-center bg-black bg-opacity-80 p-8 [&>button:first-of-type]:hidden">
        <SheetHeader>
          <SheetTitle className="text-center">{t('home.playerCredentials.sheet.title')}</SheetTitle>
          <SheetDescription className="text-center">
            {t('home.playerCredentials.sheet.description')}
            <a
              className="ml-1 text-blue-500 underline"
              href="https://veniceunleashed.net/signup"
              target="_blank"
            >
              https://veniceunleashed.net/signup
            </a>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <PlayerCredentialsForm setSheetOpen={setSheetOpen} />
        </div>

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
