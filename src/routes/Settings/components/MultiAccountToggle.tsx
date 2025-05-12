import { saveUserPreferences } from '@/api'
import { Switch } from '@/components/ui/switch'
import { QueryKey, UserPreferences } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function MultiAccountToggle({ data }: { data: UserPreferences }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return (
    <div className="flex">
      <div className="flex gap-8 border-b">
        <h1>{t('settings.multiAccount.title')}</h1>
        <Switch
          defaultChecked={data.show_multiple_account_join}
          onCheckedChange={async (isEnabled) => {
            const preferences = {
              ...data,
              show_multiple_account_join: isEnabled,
            }

            const status = await saveUserPreferences(preferences)

            if (status) {
              if (isEnabled) {
                toast(t('settings.multiAccount.toast.enable'))
              } else {
                toast(t('settings.multiAccount.toast.disable'))
              }
              queryClient.invalidateQueries({
                queryKey: [QueryKey.UserPreferences],
                refetchType: 'all',
              })
            } else {
              toast(t('settings.toast.failed'))
            }
          }}
        />
      </div>
    </div>
  )
}
