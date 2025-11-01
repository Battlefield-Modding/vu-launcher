import { Loader } from 'lucide-react'
import { QueryKey, STALE } from '@/config/config'
import { getUserPreferences, serverKeyExists } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { FirstTimeSetup } from './components/Forms/FirstTimeSetup/FirstTimeSetup'
import LocalServerGuidForm from '../Settings/components/LocalServerGuidForm'
import { useTranslation } from 'react-i18next'
import { LoadoutContainer } from './components/Loadouts/LoadoutContainer'

export function Servers() {
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.ServerKeyExists],
    queryFn: async (): Promise<{ serverKeyFileExists: boolean; serverGuidExists: boolean }> => {
      const serverKeyFileExists = await serverKeyExists()
      const preferences = await getUserPreferences()
      const serverGuidExists = preferences.server_guid.length > 0
      return { serverKeyFileExists, serverGuidExists }
    },
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4">
        <Loader className="h-12 w-12 animate-spin" />
        <h1 className="text-xl">{t('servers.firstTime.loading')}</h1>
      </div>
    )
  }

  if (isError) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return (
      <div className="flex h-full min-h-screen flex-col items-center justify-center gap-4 rounded-md bg-destructive p-4 text-center text-xl">
        <h1>{t('servers.firstTime.error')}</h1>
        <p>{errorMessage}</p>
      </div>
    )
  }

  if (!data?.serverKeyFileExists) {
    return <FirstTimeSetup />
  }

  if (!data?.serverGuidExists) {
    return (
      <div className="ml-[56px] flex h-full min-h-screen flex-col items-center justify-center gap-8">
        <h1 className="text-2xl">{t('servers.firstTime.redoGuid')}:</h1>
        <LocalServerGuidForm guid="" />
      </div>
    )
  }

  return <LoadoutContainer />
}
