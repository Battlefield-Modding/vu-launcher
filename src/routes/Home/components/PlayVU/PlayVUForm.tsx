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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getServersAndAccounts,
  playVU,
  setPreferredPlayer,
  setPreferredServer,
  toggleDevBranch,
} from '@/api'
import { Loader, Play } from 'lucide-react'
import DeleteVUCredentialDialog from './DeleteVUCredentialDialog'
import DeleteVUServerDialog from './DeleteVUServerDialog'
import { getCurrentWindow } from '@tauri-apps/api/window'
import clsx from 'clsx'
import { Switch } from '@/components/ui/switch'
import { useTranslation } from 'react-i18next'

const FormSchema = z.object({
  accountIndex: z.string().optional(),
  serverIndex: z.string().optional(),
  useDevBranch: z.boolean(),
})

export default function PlayVUForm({ preferences }: { preferences: UserPreferences }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      accountIndex: `${preferences.preferred_player_index === 90001 ? 0 : preferences.preferred_player_index}`,
      serverIndex: `${preferences.preferred_player_index === 9001 ? 0 : preferences.preferred_player_index}`,
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
      <div>
        <h1>{t('home.playVu.form.loading')}</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>{t('home.playVu.form.error')}</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    console.log(formData)
    let accountIndex = 9001
    let serverIndex = 9001
    let useDevBranch = formData.useDevBranch

    if (formData.accountIndex === undefined) {
      if (data && data.usernames.length > 0) {
        accountIndex = 0
      }
    } else {
      accountIndex = parseInt(formData.accountIndex)
    }

    if (formData.serverIndex !== undefined) {
      serverIndex = parseInt(formData.serverIndex)
    }

    const status = await playVU({ accountIndex, serverIndex, useDevBranch })

    if (status) {
      toast('Starting VU...')
      setTimeout(() => {
        getCurrentWindow().minimize()
      }, 1500)
    } else {
      toast('Failed to start VU.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-64 flex-col gap-4">
        <FormField
          control={form.control}
          name="accountIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('home.playVu.form.account.title')}</FormLabel>
              <Select
                onValueChange={async (e) => {
                  await setPreferredPlayer(parseInt(e))
                  field.onChange(e)
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        data.usernames[preferences.preferred_player_index] ||
                        t('home.playVu.form.account.none')
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  defaultValue={
                    data.usernames[preferences.preferred_player_index] ||
                    t('home.playVu.form.account.none')
                  }
                >
                  {data.usernames &&
                    data.usernames.map((x, index) => {
                      return (
                        <div className="flex" key={x}>
                          <SelectItem value={`${index}`}>{x}</SelectItem>
                          <DeleteVUCredentialDialog username={x} />
                        </div>
                      )
                    })}
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serverIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('home.playVu.form.server.title')}</FormLabel>
              <Select
                onValueChange={async (e) => {
                  await setPreferredServer(parseInt(e))
                  field.onChange(e)
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        data.servers[preferences.preferred_server_index]
                          ? data.servers[preferences.preferred_server_index].nickname
                          : t('home.playVu.form.server.none')
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent
                  defaultValue={
                    data.servers[preferences.preferred_server_index]
                      ? data.servers[preferences.preferred_server_index].nickname
                      : t('home.playVu.form.server.none')
                  }
                >
                  {data.servers.map((x, index) => {
                    return (
                      <div className="flex" key={x.nickname}>
                        <SelectItem value={`${index}`}>{x.nickname}</SelectItem>
                        <DeleteVUServerDialog server={x} />
                      </div>
                    )
                  })}
                  <div className="flex">
                    <SelectItem value={`${9001}`}>{t('home.playVu.form.server.none')}</SelectItem>
                  </div>
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`useDevBranch`}
          render={({ field }) => (
            <FormItem
              className={clsx(
                'flex justify-between rounded-md rounded-l-none border-b border-secondary',
                field.value && 'border-green-500 text-green-500 opacity-100',
              )}
            >
              <FormLabel className="mt-1">{t('home.playVu.form.devBranch.title')}</FormLabel>
              <FormControl>
                {/* @ts-ignore */}
                <Switch
                  {...field}
                  checked={field.value}
                  onCheckedChange={async (e) => {
                    await toggleDevBranch(e)
                    queryClient.invalidateQueries({
                      queryKey: [QueryKey.UserPreferences],
                      refetchType: 'all',
                    })
                    field.onChange(e)
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button variant={'constructive'} className="mt-4 p-8 text-2xl" type="submit">
          <Play />
          {t('home.playVu.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
