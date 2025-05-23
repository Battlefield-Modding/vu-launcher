import { Loader } from 'lucide-react'
import { QueryKey, STALE } from '@/config/config'
import { getUserPreferences, serverKeyExists } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { FirstTimeSetup } from './components/Forms/FirstTimeSetup/FirstTimeSetup'
import LocalServerGuidForm from '../Settings/components/LocalServerGuidForm'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'

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
      <div>
        <h1>{t('servers.firstTime.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('servers.firstTime.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  if (!data.serverKeyFileExists) {
    return <FirstTimeSetup />
  }

  if (!data.serverGuidExists) {
    return (
      <div className="m-auto flex h-full max-w-screen-md flex-col items-center justify-center gap-8">
        <h1 className="text-2xl">{t('servers.firstTime.redoGuid')}:</h1>
        <LocalServerGuidForm guid={''} />
      </div>
    )
  }

  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center">
      <Outlet />
    </div>
  )
}
