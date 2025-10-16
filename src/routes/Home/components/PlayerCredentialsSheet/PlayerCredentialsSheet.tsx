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

import { Loader, User } from 'lucide-react'
import PlayerCredentialsForm from './PlayerCredentialsForm'
import { useState } from 'react'
import { doesCredentialsExist } from '@/api'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import { useTranslation } from 'react-i18next'

export default function PlayerCredentialsSheet() {
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
      <SheetTrigger className="ml-auto">
        <div className={clsx('flex text-xs text-blue-500 hover:text-blue-400')}>
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

        <SheetFooter className="absolute bottom-4 left-4 m-0 p-0">
          <SheetClose asChild>
            <Button className="w-24" variant="outline">
              Back
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
