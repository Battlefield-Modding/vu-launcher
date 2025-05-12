import { saveUserPreferences } from '@/api'
import { Switch } from '@/components/ui/switch'
import { QueryKey, UserPreferences } from '@/config/config'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function AutomaticallyUpdateToggle({ data }: { data: UserPreferences }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  return (
    <div className="flex">
      <div className="flex gap-8 border-b">
        <h1>{t('settings.automaticUpdate.title')}</h1>
        <Switch
          defaultChecked={data.automatically_install_update_if_found}
          onCheckedChange={async (isEnabled) => {
            const preferences = {
              ...data,
              automatically_install_update_if_found: isEnabled,
            }

            const status = await saveUserPreferences(preferences)

            if (status) {
              if (isEnabled) {
                toast(t('settings.automaticUpdate.toast.enable'))
              } else {
                toast(t('settings.automaticUpdate.toast.disable'))
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
