import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import { useSidebar } from '@/components/ui/sidebar'

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
})

export default function PlayerCredentialsForm({ setSheetOpen }: { setSheetOpen: any }) {
  const queryClient = useQueryClient()
  const sidebar = useSidebar()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

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
          sidebar.toggleSidebar()
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
        className="m-auto flex max-w-screen-md flex-col gap-8"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('home.playerCredentials.form.username.title')}</FormLabel>
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
            <FormItem>
              <FormLabel>{t('home.playerCredentials.form.password.title')}</FormLabel>
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
        <Button className="m-auto w-fit" type="submit">
          {t('home.playerCredentials.form.button')}
        </Button>
      </form>
    </Form>
  )
}
