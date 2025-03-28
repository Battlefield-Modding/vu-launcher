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
import { saveUserCredentials } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
})

export default function PlayerCredentialsForm({ setSheetOpen }: { setSheetOpen: any }) {
  const queryClient = useQueryClient()

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
      toast('Updated VU Credentials Successfully!')
      queryClient.invalidateQueries({ queryKey: [QueryKey.UserList], refetchType: 'all' })
      queryClient.invalidateQueries({ queryKey: [QueryKey.PlayVUInformation], refetchType: 'all' })
      setSheetOpen(() => false)
    } else {
      toast('Something went wrong.')
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
              <FormLabel>VU Username</FormLabel>
              <FormControl>
                <Input type="text" placeholder="username" {...field} autoFocus />
              </FormControl>
              <FormDescription>
                Stored using your Operating System's native credential manager.
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
              <FormLabel>VU Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
              <FormDescription>
                Stored using your Operating System's native credential manager.
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
          Submit
        </Button>
      </form>
    </Form>
  )
}
