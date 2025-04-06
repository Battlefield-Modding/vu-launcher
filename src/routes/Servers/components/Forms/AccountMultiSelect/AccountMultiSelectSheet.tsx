import { getUsers, playVUOnLocalServer, startServerLoadout } from '@/api'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { Loader, Server, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { AccountMultiSelectForm } from './AccountMultiSelectForm'
import { useTranslation } from 'react-i18next'

export function ChooseAccountSheet({ loadoutName }: { loadoutName: string }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.UserList],
    queryFn: getUsers,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>{t('servers.loadouts.loadout.multiAccount.sheet.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>{t('servers.loadouts.loadout.multiAccount.sheet.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  async function handlePlay(users: number[]) {
    let status = await startServerLoadout(loadoutName)
    if (status) {
      toast(t('servers.loadouts.loadout.multiAccount.sheet.toast.serverSucces'))
      setTimeout(() => {
        playVUOnLocalServer(loadoutName, users)
      }, 1000)
    } else {
      toast(
        `${t('servers.loadouts.loadout.multiAccount.sheet.toast.serverFailure')}: ${loadoutName}`,
      )
    }
  }

  function updateUsers(users: number[]) {
    handlePlay(users)
  }

  if (!data || !data[0]) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>{t('servers.loadouts.loadout.multiAccount.sheet.empty')}</h1>
      </div>
    )
  } else {
    return (
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger>
          <div className="flex items-center justify-between gap-2 rounded-md bg-green-800 p-2 text-xl text-primary hover:cursor-pointer hover:bg-green-800/80">
            {t('servers.loadouts.loadout.multiAccount.sheet.trigger')}
            <Server />
            <UserCheck />
          </div>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="m-auto w-96">
            <SheetTitle>
              {t('servers.loadouts.loadout.multiAccount.sheet.title')} {'  '}
              <code>{loadoutName}</code>
            </SheetTitle>
            <SheetDescription>
              {t('servers.loadouts.loadout.multiAccount.sheet.description')} {'  '}
              <code>{loadoutName}</code>
            </SheetDescription>
          </SheetHeader>
          <br />
          <AccountMultiSelectForm
            setSheetOpen={setSheetOpen}
            usernames={data}
            updateUsers={updateUsers}
          />
        </SheetContent>
      </Sheet>
    )
  }
}
