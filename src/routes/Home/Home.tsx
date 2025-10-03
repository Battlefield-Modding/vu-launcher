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
      <div>
        <h1>{t('home.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive pl-2 pr-2 text-xl leading-9">
        <h1>{t('home.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  return (
    <div className="m-auto flex min-h-[100vh] flex-col justify-center bg-[url(assets/home_background.png)] bg-cover">
      <div className="m-auto flex max-w-96 rounded-md bg-black bg-opacity-90 p-8 drop-shadow-lg">
        <PlayVUForm preferences={data} />
      </div>
    </div>
  )
}
