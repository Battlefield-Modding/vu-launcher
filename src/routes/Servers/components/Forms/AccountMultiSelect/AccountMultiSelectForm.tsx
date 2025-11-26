import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

const formSchema = z.object({
  account0: z.boolean(),
  account1: z.boolean(),
  account2: z.boolean(),
  account3: z.boolean(),
})

export function AccountMultiSelectForm({
  usernames,
  setSheetOpen,
  updateUsers,
}: {
  usernames: string[]
  setSheetOpen: (state: boolean) => void
  updateUsers: (info: number[]) => void
}) {
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account0: true,
      account1: true,
      account2: false,
      account3: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = []
    if (values.account0) {
      payload.push(0)
    }
    if (values.account1) {
      payload.push(1)
    }
    if (values.account2) {
      payload.push(2)
    }
    if (values.account3) {
      payload.push(3)
    }

    updateUsers(payload)
    setSheetOpen(false)
  }

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx(
          'flex flex-col gap-8 transition-all duration-700 ease-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        )}
      >
        {usernames.map((x, index) => (
          <FormField
            control={form.control}
            name={`account${index}` as 'account0' | 'account1' | 'account2' | 'account3'}
            key={`serverStartupAccounts-${x}`}
            render={({ field }) => (
              <FormItem
                className={clsx(
                  'm-auto flex w-96 justify-between transition-all duration-700 ease-out',
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
                )}
              >
                <FormLabel className="text-2xl leading-10">{x}</FormLabel>
                <FormControl className="h-10 w-1/6">
                  {/* @ts-expect-error */}
                  <Input
                    type={'checkbox'}
                    className="max-w-16"
                    defaultChecked={field.value}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
        <Button
          type="submit"
          className={clsx(
            'm-auto w-96 p-8 text-2xl transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{ transitionDelay: visible ? `${250 * usernames.length}ms` : '0ms' }}
        >
          {t('servers.loadouts.loadout.multiAccount.form.play')}
        </Button>
      </form>
    </Form>
  )
}
