import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

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
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { addServer } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  nickname: z.string().min(2).max(50),
  guid: z.string().min(30).max(40),
  password: z.string().optional(),
})

export default function ServerForm({ setSheetOpen }: { setSheetOpen: any }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      guid: '',
      password: '',
    },
  })

  useEffect(() => {
    // ensures smooth entrance animation on reload
    const timeout = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timeout)
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = {
      nickname: values.nickname,
      guid: values.guid,
      password: values.password ?? '',
    }

    const status = await addServer(payload)

    if (status) {
      toast(`${t('home.server.form.toast.success')}: ${values.nickname}`)
      queryClient.invalidateQueries({ queryKey: [QueryKey.ServerList], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [QueryKey.PlayVUInformation], refetchType: 'all' })
      setSheetOpen(() => false)
    } else {
      toast(`${t('home.server.form.toast.failure')}: ${values.nickname}`)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx(
          'm-auto flex max-w-screen-md flex-col gap-8 transition-all duration-700 ease-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        )}
      >
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem
              className={clsx(
                'transition-all duration-700 ease-out',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: visible ? '150ms' : '0ms' }}
            >
              <FormLabel>{t('home.server.form.nickname.title')}*</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t('home.server.form.nickname.placeholder')}
                  {...field}
                  autoFocus
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guid"
          render={({ field }) => (
            <FormItem
              className={clsx(
                'transition-all duration-700 ease-out',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: visible ? '300ms' : '0ms' }}
            >
              <FormLabel>{t('home.server.form.serverGUID.title')}*</FormLabel>
              <FormControl>
                <Input type="text" placeholder="5ccbc53a-6266-4b83-b782-c98cc49da88f" {...field} />
              </FormControl>
              <FormDescription>
                {t('home.server.form.serverGUID.description')}
                (vu://join/5ccbc53a-6266-4b83-b782-c98cc49da88f)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem
              className={clsx(
                'transition-all duration-700 ease-out',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: visible ? '450ms' : '0ms' }}
            >
              <FormLabel>{t('home.server.form.serverPassword.title')}</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t('home.server.form.serverPassword.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-xs text-gray-400">{t('home.playerCredentials.form.hint')}</p>

        <Button
          className={clsx(
            'm-auto w-fit transition-all duration-700 ease-out',
            visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0',
          )}
          style={{ transitionDelay: visible ? '600ms' : '0ms' }}
          type="submit"
        >
          {t('home.server.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
