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
import { addServer } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'

const formSchema = z.object({
  nickname: z.string().min(2).max(50),
  guid: z.string().min(30).max(40),
  password: z.string().optional(),
})

export default function ServerForm({ setSheetOpen }: { setSheetOpen: any }) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: '',
      guid: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let temp = {
      nickname: values.nickname,
      guid: values.guid,
      password: values.password ?? '',
    }

    const status = await addServer(temp)

    if (status) {
      toast(`Success! Added ${values.nickname} to Quick-Join servers!`)
      queryClient.invalidateQueries({ queryKey: [QueryKey.ServerList], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [QueryKey.PlayVUInformation], refetchType: 'all' })
      setSheetOpen(() => false)
    } else {
      toast('Something went wrong.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="m-auto max-w-screen-md flex flex-col gap-8">
        <FormField
          control={form.control}
          name="nickname"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nickname</FormLabel>
              <FormControl>
                <Input type="text" placeholder="My Favorite Server" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="guid"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Guid</FormLabel>
              <FormControl>
                <Input type="text" placeholder="5ccbc53a-6266-4b83-b782-c98cc49da88f" {...field} />
              </FormControl>
              <FormDescription>Server's Public ID with or without dashes. Can be found in join string (vu://join/TheGuidInQuestion/PasswordIfAny)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Password (optional)</FormLabel>
              <FormControl>
                <Input type="text" placeholder="password - Leave blank if no password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-fit m-auto" type="submit">Submit</Button>
      </form>
    </Form>
  )
}
