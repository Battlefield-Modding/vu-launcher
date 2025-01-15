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

const formSchema = z.object({
  guid: z.string().min(2).max(50),
})

export default function LocalServerGuidForm({ guid }: { guid: string }) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guid,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const status = await saveServerGUID(values.guid)
    if (status) {
      toast('Updated Server GUID Successfully!')
      queryClient.invalidateQueries({ queryKey: [QueryKey.UserPreferences], refetchType: 'all' })
    } else {
      toast('Something went wrong.')
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
              <FormLabel className="text-xl">Local Server GUID</FormLabel>
              <FormControl>
                <Input type="text" placeholder="guid" {...field} />
              </FormControl>
              <FormDescription>This will be used to auto-join your local server.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant={'secondary'} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
