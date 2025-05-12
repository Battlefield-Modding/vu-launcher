import { saveUserPreferences } from '@/api'
import { Switch } from '@/components/ui/switch'
import { QueryKey, UserPreferences } from '@/config/config'

import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function CheckForUpdatesToggle({ data }: { data: UserPreferences }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return (
    <div className="flex">
      <div className="flex gap-8 border-b">
        <h1>{t('settings.checkUpdates.title')}</h1>
        <Switch
          defaultChecked={data.automatically_check_for_updates}
          onCheckedChange={async (isEnabled) => {
            const preferences = {
              ...data,
              automatically_check_for_updates: isEnabled,
            }

            const status = await saveUserPreferences(preferences)

            if (status) {
              if (isEnabled) {
                toast(t('settings.checkUpdates.toast.enable'))
              } else {
                toast(t('settings.checkUpdates.toast.disable'))
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
