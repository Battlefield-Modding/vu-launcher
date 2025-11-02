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
import { finishOnboarding, saveUserCredentials } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey, routes } from '@/config/config'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
})

export function PlayerCredentialsForm({ setSheetOpen }: { setSheetOpen: any }) {
  const queryClient = useQueryClient()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  useEffect(() => {
    setVisible(true)
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = await saveUserCredentials(values)

    if (status) {
      toast(t('home.playerCredentials.form.toast.success'))
      queryClient.invalidateQueries({ queryKey: [QueryKey.UserList], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [QueryKey.PlayVUInformation], refetchType: 'all' })
      setSheetOpen(() => false)
      if (pathname.includes('onboarding')) {
        const onboardingFinished = await finishOnboarding()
        if (onboardingFinished) {
          navigate(routes.HOME)
        } else {
          toast(t('onboarding.failure'))
        }
      }
    } else {
      toast(t('home.playerCredentials.form.toast.failure'))
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
          name="username"
          render={({ field }) => (
            <FormItem
              className={clsx(
                'transition-all duration-700 ease-out',
                visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
              )}
              style={{ transitionDelay: visible ? '150ms' : '0ms' }}
            >
              <FormLabel>{t('home.playerCredentials.form.username.title')}*</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder={t('home.playerCredentials.form.username.placeholder')}
                  {...field}
                  autoFocus
                />
              </FormControl>
              <FormDescription>
                {t('home.playerCredentials.form.username.description')}
                <a
                  className="ml-1 text-blue-500 underline"
                  href="https://docs.rs/keyring/latest/keyring/"
                  target="_blank"
                >
                  https://docs.rs/keyring/latest/keyring/
                </a>
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
              style={{ transitionDelay: visible ? '300ms' : '0ms' }}
            >
              <FormLabel>{t('home.playerCredentials.form.password.title')}*</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={t('home.playerCredentials.form.password.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('home.playerCredentials.form.password.description')}
                <a
                  className="ml-1 text-blue-500 underline"
                  href="https://docs.rs/keyring/latest/keyring/"
                  target="_blank"
                >
                  https://docs.rs/keyring/latest/keyring/
                </a>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <p
          className={clsx(
            'text-xs text-gray-400 transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
          )}
          style={{ transitionDelay: visible ? '400ms' : '0ms' }}
        >
          {t('home.playerCredentials.form.hint')}
        </p>

        <Button
          className={clsx(
            'm-auto w-fit transition-all duration-700 ease-out',
            visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0',
          )}
          style={{ transitionDelay: visible ? '500ms' : '0ms' }}
          type="submit"
        >
          {t('home.playerCredentials.form.button')}
        </Button>
      </form>
    </Form>
  )
}
