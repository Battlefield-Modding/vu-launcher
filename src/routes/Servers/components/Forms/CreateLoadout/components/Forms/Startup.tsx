import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateLoadoutFormType } from '../../CreateLoadoutForm'
import { useTranslation } from 'react-i18next'

export function Startup({ form }: { form: CreateLoadoutFormType }) {
  const { t } = useTranslation()
  return (
    <>
      <FormField
        control={form.control}
        name="startup.vars.serverName"
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">
                {t('servers.loadouts.createLoadout.form.serverName.title')}
              </FormLabel>
              <FormDescription>vars.serverName</FormDescription>
            </div>
            <FormControl className="ml-auto mr-0">
              <Input
                type="text"
                placeholder={t('servers.loadouts.createLoadout.form.serverName.placeholder')}
                className="w-1/2"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="startup.vars.gamePassword"
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">
                {t('servers.loadouts.createLoadout.form.serverPassword.title')}
              </FormLabel>
              <FormDescription>vars.gamePassword</FormDescription>
            </div>
            <FormControl className="ml-auto mr-0">
              <Input
                type="text"
                placeholder={t('servers.loadouts.createLoadout.form.serverPassword.placeholder')}
                className="w-1/2"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="startup.admin.password"
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">
                {t('servers.loadouts.createLoadout.form.adminPassword.title')}
              </FormLabel>
              <FormDescription>admin.password</FormDescription>
            </div>
            <FormControl className="ml-auto mr-0">
              <Input
                type="text"
                placeholder={t('servers.loadouts.createLoadout.form.adminPassword.placeholder')}
                className="w-1/2"
                {...field}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={'startup.vars.maxPlayers'}
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">
                {t('servers.loadouts.createLoadout.form.maxPlayers.title')}
              </FormLabel>
              <FormDescription>vars.maxPlayers</FormDescription>
            </div>

            <FormControl className="ml-auto mr-0">
              <Input
                type={'text'}
                className="max-w-16"
                placeholder={'64'}
                {...field}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>

            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
