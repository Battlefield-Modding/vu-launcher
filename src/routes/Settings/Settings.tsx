import { useQuery } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import { getUserPreferences, openExplorerAtLauncherInstallPath } from '@/api'
import { Folder, Loader } from 'lucide-react'
import LocalServerGuidForm from './components/LocalServerGuidForm'
import { ActivateBF3Sheet } from './components/ActivateBF3/ActivateBF3Sheet'
import { LanguageSelector } from './components/LanguageSelector'
import { useTranslation } from 'react-i18next'
import { MultiAccountToggle } from './components/MultiAccountToggle'
import { AutomaticallyUpdateToggle } from './components/AutomaticallyUpdateToggle'
import { CheckForUpdatesToggle } from './components/CheckForUpdatesToggle'
import { SetVuPathSheet } from './components/SetVuPath/SetVuPathSheet'
import { CopyProdToDev } from './components/CopyProdToDev'
import { InstallVUFromSettings } from './components/InstallVuFromSettings'
import { Button } from '@/components/ui/button'

export default function Settings() {
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.UserPreferences],
    queryFn: getUserPreferences,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>{t('settings.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('settings.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100vh] flex-col">
      <div className="flex max-w-screen-md flex-col gap-4 rounded-md p-8 text-primary">
        <h1 className="text-center text-4xl">{t('settings.title')}</h1>

        <div>
          <Button
            className="p-2 text-lg"
            variant={'secondary'}
            onClick={async () => await openExplorerAtLauncherInstallPath()}
          >
            <p>{t('settings.fileExplorer')}</p>
            <Folder />
          </Button>
          <ActivateBF3Sheet />
        </div>

        <div>
          <LanguageSelector />
        </div>

        <MultiAccountToggle data={data} />
        <CheckForUpdatesToggle data={data} />
        {data.automatically_check_for_updates && <AutomaticallyUpdateToggle data={data} />}
        <SetVuPathSheet preferences={data} />
        <div>
          <InstallVUFromSettings />
          <CopyProdToDev />
        </div>
        <LocalServerGuidForm guid={data.server_guid} />
      </div>
    </div>
  )
}
