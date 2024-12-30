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
import { saveUserCredentials, updateServerConfig } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { defaultServerConfig, ServerLoadout } from '../defaultServerConfig'
import { QueryKey } from '@/config/config'

const formSchema = z.object({
  name: z.string().min(2).max(50),
  startup: z.string().min(10).max(5000),
  maplist: z.string().min(10).max(5000),
  modlist: z.string().min(0).max(5000),
  banlist: z.string().min(0).max(5000),
})

export default function ServerForm({ setSheetOpen }: { setSheetOpen: any }) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaultServerConfig,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const loadout: ServerLoadout = values
    console.log(loadout)
    const status = await updateServerConfig(loadout)

    if (status) {
      toast(`Success! Saved loadout: ${values.name}`)
      queryClient.invalidateQueries({ queryKey: [QueryKey.ServerLoadouts], refetchType: 'all' })
      setSheetOpen(() => false)
    } else {
      toast('Something went wrong.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loadout Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="name" {...field} />
              </FormControl>
              <FormDescription>The nickname for this server loadout.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startup"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Startup.txt</FormLabel>
              <FormControl>
                <Textarea placeholder="Startup" {...field} rows={15} />
              </FormControl>
              <FormDescription>
                <code>https://docs.veniceunleashed.net/hosting/commands/</code>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maplist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maplist.txt</FormLabel>
              <FormControl>
                <Textarea placeholder="Maplist" {...field} rows={15} />
              </FormControl>
              <FormDescription>
                <code>https://docs.veniceunleashed.net/hosting/maps/</code>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="modlist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modlist.txt</FormLabel>
              <FormControl>
                <Textarea placeholder="Modlist" {...field} rows={5} />
              </FormControl>
              <FormDescription>What mods your server will run.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="banlist"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banlist.txt</FormLabel>
              <FormControl>
                <Textarea placeholder="Banlist" {...field} rows={5} />
              </FormControl>
              <FormDescription>A list of players to prevent from joining.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
