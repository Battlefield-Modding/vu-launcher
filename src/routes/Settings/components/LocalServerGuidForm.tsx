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
import { saveServerGUID } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'
import { useTranslation } from 'react-i18next'

const formSchema = z.object({
  guid: z.string().min(2).max(50),
})

export default function LocalServerGuidForm({ guid }: { guid: string }) {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guid,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = await saveServerGUID(values.guid)
    if (status) {
      toast(t('settings.serverGuidForm.toast.success'))
      queryClient.invalidateQueries({ queryKey: [QueryKey.UserPreferences], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [QueryKey.ServerKeyExists], refetchType: 'all' })
    } else {
      toast(t('settings.serverGuidForm.toast.failure'))
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-1/2 gap-2">
        <FormField
          control={form.control}
          name="guid"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl">{t('settings.serverGuidForm.title')}</FormLabel>
              <FormControl>
                <Input type="text" placeholder="5ccbc53a-6266-4b83-b782-c98cc49da88f" {...field} />
              </FormControl>
              <FormDescription>{t('settings.serverGuidForm.description')}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{t('settings.serverGuidForm.submit')}</Button>
      </form>
    </Form>
  )
}
