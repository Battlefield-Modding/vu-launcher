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
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { saveServerGUID } from '@/api'
import { useState } from 'react'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  guid: z.string().min(2).max(50),
})

export function ServerGuidForm({ handleGuid }: { handleGuid: (val: boolean) => void }) {
  const [savedGUID, setSavedGUID] = useState(false)
  const { t } = useTranslation()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guid: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = await saveServerGUID(values.guid)
    if (status) {
      setSavedGUID(() => true)
      handleGuid(true)
      toast(t('settings.serverGuidForm.toast.success'))
    } else {
      toast(t('settings.serverGuidForm.toast.failure'))
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="guid"
          render={({ field }) => (
            <FormItem className={clsx('ml-9 w-1/2', savedGUID && 'hidden')}>
              <FormControl>
                <Input
                  type="text"
                  placeholder="5ccbc53a-6266-4b83-b782-c98cc49da88f"
                  {...field}
                  disabled={savedGUID}
                />
              </FormControl>
              <FormDescription>{t('settings.serverGuidForm.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className={clsx('ml-9', savedGUID && 'hidden')} disabled={savedGUID}>
          {t('settings.serverGuidForm.submit')}
        </Button>
        <h3 className={clsx(savedGUID ? 'visible ml-9 text-primary/70' : 'hidden')}>
          {t('servers.firstTime.guidForm.done')}
        </h3>
      </form>
    </Form>
  )
}
