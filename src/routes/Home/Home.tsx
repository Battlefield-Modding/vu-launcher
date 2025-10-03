import { QueryKey, STALE } from '@/config/config'
import PlayVUForm from './components/PlayVU/PlayVUForm'
import { getUserPreferences } from '@/api'
import { useQuery } from '@tanstack/react-query'
import { Loader } from 'lucide-react'

import { useTranslation } from 'react-i18next'

export default function Home() {
  const { t } = useTranslation()

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.UserPreferences],
    queryFn: getUserPreferences,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div className="flex min-h-[100vh] items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-white">{t('home.loading')}</h1>
          <Loader className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[100vh] items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="mx-auto max-w-md rounded-md bg-destructive p-4 text-xl leading-9 text-destructive-foreground">
          <h1 className="font-bold">{t('home.error')}</h1>
          <p className="mt-2">{error?.message ?? 'Unknown error occurred'}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-0 origin-center animate-[breathe-zoom_60s_ease-in-out_infinite_forwards] bg-[url(assets/home_background.png)] bg-cover bg-center bg-no-repeat" />

      <div className="relative z-10 flex min-h-[100vh] flex-col items-center justify-center">
        <div className="max-w-96 rounded-md bg-black bg-opacity-90 p-8 drop-shadow-2xl">
          <PlayVUForm preferences={data} />
        </div>
      </div>
    </>
  )
}
