import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QueryKey, STALE } from '@/config/config'
import { getUserPreferences, saveUserPreferences } from '@/api'
import { Loader } from 'lucide-react'
import LocalServerGuidForm from './components/LocalServerGuidForm'
import { ActivateBF3Sheet } from './components/ActivateBF3/ActivateBF3Sheet'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { LanguageSelector } from './components/LanguageSelector'
import { useTranslation } from 'react-i18next'

export default function Settings() {
  const queryClient = useQueryClient()
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
      <div className="flex flex-col gap-16 rounded-md p-8 text-white">
        <h1 className="text-center text-4xl">{t('settings.title')}</h1>
        <div>
          <ActivateBF3Sheet />
        </div>

        <div>
          <LanguageSelector />
        </div>

        <LocalServerGuidForm guid={data.server_guid} />

        <div className="flex">
          <label className="flex flex-col justify-center rounded-md text-xl leading-10 text-white">
            {t('settings.multiAccount.title')}
          </label>
          <Input
            type={'checkbox'}
            className="max-w-16"
            defaultChecked={data.show_multiple_account_join}
            onClick={async (e) => {
              const target = e.target as HTMLInputElement
              const preferences = {
                ...data,
                show_multiple_account_join: target.checked,
              }

              const status = await saveUserPreferences(preferences)

              if (status) {
                if (target.checked) {
                  toast(t('settings.multiAccount.toast.enable'))
                } else {
                  toast(t('settings.multiAccount.toast.disable'))
                }
                queryClient.invalidateQueries({
                  queryKey: [QueryKey.UserPreferences],
                  refetchType: 'all',
                })
              } else {
                toast(t('settings.multiAccount.toast.failed'))
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
