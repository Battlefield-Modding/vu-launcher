import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { QueryKey, STALE, UserPreferences } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import {
  getServersAndAccounts,
  playVU,
  setPreferredPlayer,
  setPreferredServer,
  toggleDevBranch,
} from '@/api'
import { Loader, Play, User, Globe } from 'lucide-react'
import DeleteVUCredentialDialog from './DeleteVUCredentialDialog'
import DeleteVUServerDialog from './DeleteVUServerDialog'
import { getCurrentWindow } from '@tauri-apps/api/window'
import clsx from 'clsx'
import { Switch } from '@/components/ui/switch'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react' // For error dismiss
import PlayerCredentialsSheet from '../PlayerCredentialsSheet/PlayerCredentialsSheet'
import ServerSheet from '../ServerSheet/ServerSheet'
import VUIcon from '@/assets/VUIcon.svg'

const FormSchema = z.object({
  accountIndex: z.string().optional(),
  serverIndex: z.string().optional(),
  useDevBranch: z.boolean(),
})

const NONE_INDEX = 9001

export default function PlayVUForm({ preferences }: { preferences: UserPreferences }) {
  const { t } = useTranslation()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      accountIndex: `${preferences.preferred_player_index === NONE_INDEX ? 0 : preferences.preferred_player_index}`,
      serverIndex: `${preferences.preferred_player_index === NONE_INDEX ? 0 : preferences.preferred_player_index}`, // Original bug: uses player_index; change to server_index if fixing
      useDevBranch: preferences.use_dev_branch,
    },
  })

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.PlayVUInformation],
    queryFn: getServersAndAccounts,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-8">
        <Loader className="mb-4 h-8 w-8 animate-spin text-primary" />
        <h1 className="text-lg font-medium">{t('home.playVu.form.loading')}</h1>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="relative rounded-md border border-red-200 bg-red-50 p-4">
        <button
          onClick={() => window.location.reload()}
          className="absolute right-2 top-2 text-red-500 hover:text-red-700"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-medium text-red-600">{t('home.playVu.form.error')}</h1>
        <p className="mt-1 text-sm text-red-500">{error?.message}</p>
      </div>
    )
  }

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    let accountIndex = NONE_INDEX
    let useDevBranch = formData.useDevBranch

    if (formData.accountIndex === undefined) {
      if (data && data.usernames.length > 0) {
        accountIndex = 0
      }
    } else {
      accountIndex = parseInt(formData.accountIndex)
    }

    // Parse serverIndex similarly (original ignores it; uncomment if needed for playVU)
    // let serverIndex = NONE_INDEX
    // if (formData.serverIndex === undefined) {
    //   if (data && data.servers.length > 0) {
    //     serverIndex = 0
    //   }
    // } else {
    //   serverIndex = parseInt(formData.serverIndex)
    // }

    const status = await playVU({ accountIndex, useDevBranch /* , serverIndex */ })

    if (status) {
      toast.success(t('home.playVu.form.toast.success'))
      setTimeout(() => {
        getCurrentWindow().minimize()
      }, 1500)
    } else {
      toast.error(t('home.playVu.form.toast.failure'))
    }
  }

  // Account Select Handler
  const handleAccountChange = async (value: string) => {
    await setPreferredPlayer(parseInt(value))
    form.setValue('accountIndex', value)
  }

  // Server Select Handler
  const handleServerChange = async (value: string) => {
    await setPreferredServer(parseInt(value))
    form.setValue('serverIndex', value)
  }

  // Dev Toggle Handler
  const handleDevToggle = async (checked: boolean) => {
    const status = await toggleDevBranch(checked)
    if (status) {
      toast.success(t('toggleDevBranch.success'))
    } else {
      toast.error(t('toggleDevBranch.failure'))
    }
    form.setValue('useDevBranch', checked)
  }

  const selectedAccount =
    data?.usernames?.[preferences.preferred_player_index] || t('home.playVu.form.account.none')
  const selectedServer =
    data?.servers?.[preferences.preferred_server_index]?.nickname ||
    t('home.playVu.form.server.none')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-72 space-y-6">
        <img src={VUIcon} alt="VU Icon" className="m-auto size-32 p-1" />
        {/* Account Select */}
        <FormField
          control={form.control}
          name="accountIndex"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-2 flex items-center gap-2 text-base font-medium">
                <User className="h-4 w-4" />
                {t('home.playVu.form.account.title')}
                <PlayerCredentialsSheet />
              </FormLabel>
              <Select onValueChange={handleAccountChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger
                    className="w-full"
                    aria-label={t('home.playVu.form.account.title')}
                  >
                    <SelectValue placeholder={selectedAccount} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent defaultValue={selectedAccount} className="w-full">
                  {data?.usernames?.map((username, index) => (
                    <div
                      className="flex items-center justify-between rounded p-2 hover:bg-accent"
                      key={username}
                    >
                      <SelectItem value={`${index}`} className="flex-1">
                        {username}
                      </SelectItem>
                      <DeleteVUCredentialDialog username={username} />
                    </div>
                  ))}
                  {(!data?.usernames || data.usernames.length === 0) && (
                    <SelectItem value={`${NONE_INDEX}`} disabled className="text-muted-foreground">
                      {t('home.playVu.form.account.none')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormDescription className="mt-1 text-sm text-muted-foreground">
                {t('home.playVu.form.account.description', { defaultValue: '' })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Server Select */}
        <FormField
          control={form.control}
          name="serverIndex"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="mb-2 flex items-center gap-2 text-base font-medium">
                <Globe className="h-4 w-4" />
                {t('home.playVu.form.server.title')}
                <ServerSheet />
              </FormLabel>
              <Select onValueChange={handleServerChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full" aria-label={t('home.playVu.form.server.title')}>
                    <SelectValue placeholder={selectedServer} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent defaultValue={selectedServer} className="w-full">
                  {data?.servers?.map((server, index) => (
                    <div
                      className="flex items-center justify-between rounded p-2 hover:bg-accent"
                      key={server.nickname}
                    >
                      <SelectItem value={`${index}`} className="flex-1">
                        {server.nickname}
                      </SelectItem>
                      <DeleteVUServerDialog server={server} />
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2">
                    <SelectItem value={`${NONE_INDEX}`}>
                      {t('home.playVu.form.server.none')}
                    </SelectItem>
                  </div>
                </SelectContent>
              </Select>
              <FormDescription className="mt-1 text-sm text-muted-foreground">
                {t('home.playVu.form.server.description', { defaultValue: '' })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dev Branch Toggle */}
        <FormField
          control={form.control}
          name="useDevBranch"
          render={({ field }) => (
            <FormItem className="flex flex-col rounded-lg border bg-card p-3">
              <div className="flex w-full items-center">
                <FormLabel className="text-base font-medium">
                  {t('home.playVu.form.devBranch.title')}
                </FormLabel>
                <FormControl className="ml-auto">
                  <Switch
                    checked={field.value}
                    onCheckedChange={handleDevToggle}
                    className={clsx(
                      'data-[state=checked]:bg-green-500',
                      field.value && 'border-green-500',
                    )}
                    aria-label={t('home.playVu.form.devBranch.title')}
                  />
                </FormControl>
              </div>
              <FormDescription className="text-sm text-muted-foreground">
                {t('home.playVu.form.devBranch.description', {
                  defaultValue: 'Use development branch for updates.',
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="constructive"
          className="w-full rounded-lg p-8 text-3xl uppercase tracking-widest shadow-md transition-shadow hover:shadow-lg"
          aria-label={t('home.playVu.form.submit')}
        >
          {t('home.playVu.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
