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
import { updateServerConfig } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { defaultServerConfig, ServerLoadout } from '../defaultServerConfig'
import { Loadout, QueryKey } from '@/config/config'

const formSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .refine(
      (value) =>
        /^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/g.test(
          value ?? '',
        ),
      "A loadout name can't contain any of the following characters\: \\ / : * ? \" < > | '",
    ),
  startup: z.string().min(10).max(5000),
  maplist: z.string().min(10).max(5000),
  modlist: z.string().min(0).max(5000),
  banlist: z.string().min(0).max(5000),
})

export default function ServerForm({
  setSheetOpen,
  defaultConfig,
}: {
  setSheetOpen: any
  defaultConfig: Loadout
}) {
  const queryClient = useQueryClient()

  const defaults = defaultConfig ?? defaultServerConfig

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...defaults,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const loadout: ServerLoadout = values
    const status = await updateServerConfig(loadout)

    if (status) {
      if (defaultConfig?.name) {
        toast(`Success! Updated loadout: ${values.name}`)
        queryClient.invalidateQueries({
          queryKey: [`${QueryKey.GetServerLoadout}-${defaultConfig.name}`],
          refetchType: 'all',
        })
      } else {
        toast(`Success! Created loadout: ${values.name}`)
        queryClient.invalidateQueries({
          queryKey: [QueryKey.ServerLoadouts],
          refetchType: 'all',
        })
      }
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
                <Input
                  type="text"
                  placeholder="name"
                  autoFocus={defaultConfig?.name === undefined}
                  {...field}
                  disabled={defaultConfig?.name !== undefined}
                />
              </FormControl>
              <FormDescription>
                The nickname for this server loadout. Can't contain any of the following characters:
                \ / : * ? " {'<'} {'>'} | '
              </FormDescription>
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
                <a
                  href="https://docs.veniceunleashed.net/hosting/commands/"
                  target="_blank"
                  className="text-blue-800 underline"
                >
                  https://docs.veniceunleashed.net/hosting/commands/
                </a>
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
                <a
                  href="https://docs.veniceunleashed.net/hosting/maps/"
                  target="_blank"
                  className="text-blue-800 underline"
                >
                  https://docs.veniceunleashed.net/hosting/maps/
                </a>
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
