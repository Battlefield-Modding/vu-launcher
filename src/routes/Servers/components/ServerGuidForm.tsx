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
import { saveServerGUID, saveUserCredentials } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'
import { useState } from 'react'

const formSchema = z.object({
  guid: z.string().min(2).max(50),
})

export default function ServerGuidForm() {
  const [savedGUID, setSavedGUID] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guid: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const status = await saveServerGUID(values.guid)
    if (status) {
      setSavedGUID(() => true)
      toast('Updated Server GUID Successfully!')
    } else {
      toast('Something went wrong.')
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-1/2">
        <FormField
          control={form.control}
          name="guid"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="text" placeholder="guid" {...field} disabled={savedGUID} />
              </FormControl>
              <FormDescription>This will be used to auto-join your local server.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={savedGUID}>
          Submit
        </Button>
      </form>
    </Form>
  )
}
