import {
  getLoadoutNames,
  getModNamesInCache,
  getModNamesInLoadout,
  refreshModCacheFolderNames,
} from '@/api'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { GameMod, QueryKey, STALE } from '@/config/config'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Book, Loader, RefreshCcw } from 'lucide-react'
import { useState } from 'react'
import Mod from './Mod'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { TooltipWrapper } from '@/components/TooltipWrapper'
import { toast } from 'sonner'

export default function ManageModsSheet() {
  const queryClient = useQueryClient()
  const [sheetOpen, setSheetOpen] = useState(false)
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.GetAllModNames],
    queryFn: async (): Promise<Array<{ name: string; mods: string[] }>> => {
      const modsArray = []

      const modsInCache = await getModNamesInCache()
      modsArray.push({
        name: 'mod-cache',
        mods: modsInCache,
      })

      // const loadoutNames = await getLoadoutNames()
      // for (const loadout of loadoutNames) {
      //   const mods = await getModNamesInLoadout(loadout)
      //   modsArray.push({
      //     name: loadout,
      //     mods,
      //   })
      // }

      return modsArray
    },
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>{t('mods.manage.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('mods.manage.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-md bg-secondary pl-2 pr-2 text-xl leading-9 text-primary">
        <h1>{t('mods.manage.empty.title')}</h1>
        <p>{t('mods.manage.empty.description')}</p>
      </div>
    )
  }

  async function handleClick() {
    const status = await refreshModCacheFolderNames()
    if (status) {
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetModNamesInCache],
        refetchType: 'all',
      })
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllModNames],
        refetchType: 'all',
      })
      toast(t('mods.manage.sheet.toast.success'))
    } else {
      toast(t('mods.manage.sheet.toast.failure'))
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger>
        <div className="flex gap-1 rounded-md bg-gray-600 p-4 text-white hover:bg-gray-600/80">
          {t('mods.manage.sheet.trigger')} <Book />
        </div>
      </SheetTrigger>
      <SheetContent className="overflow-y-scroll">
        <SheetHeader className="hidden">
          <SheetTitle>{t('mods.manage.sheet.title')}</SheetTitle>
        </SheetHeader>

        <div className="m-auto flex max-w-screen-lg flex-col gap-8">
          {data.map((loadout, outerIndex) => {
            if (loadout.mods?.length > 0) {
              return (
                <div
                  className={clsx('rounded-md bg-black p-4')}
                  key={`mod-deletion-container_${loadout.name}`}
                >
                  <SheetTitle>
                    <code className="underline">{loadout.name}</code>
                    <TooltipWrapper text={t('mods.manage.sheet.tooltip.refresh')}>
                      <Button onClick={handleClick}>
                        <RefreshCcw />
                      </Button>
                    </TooltipWrapper>
                  </SheetTitle>
                  <div>
                    {loadout.mods.map((modName, modIndex) => (
                      <Mod
                        modName={modName}
                        loadoutName={loadout.name}
                        key={`${modName}-${outerIndex}-${modIndex}`}
                      />
                    ))}
                  </div>
                </div>
              )
            }
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
