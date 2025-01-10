import { any, z } from 'zod'
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
import { updateServerLoadout } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { Loadout, QueryKey } from '@/config/config'
import { Checkbox } from '@/components/ui/checkbox'

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
  mods: z.any(),
  banlist: z.string().min(0).max(5000),
})

export default function EditLoadoutForm({
  setSheetOpen,
  existingConfig,
}: {
  setSheetOpen: any
  existingConfig: Loadout
}) {
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...existingConfig,
    },
  })

  function onlyIncludeSelectedMods(mods: { string: boolean }) {
    const correctedMods = []
    for (const [key, value] of Object.entries(mods)) {
      if (value) {
        // this is to undo the zod workaround of converting . to *
        let mod_name_with_dots = key.split('*').join('.')
        correctedMods.push(mod_name_with_dots)
      }
    }
    return correctedMods
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let correctedMods = onlyIncludeSelectedMods(values.mods)

    const loadout: Loadout = {
      ...values,
      mods: correctedMods,
      modlist: '',
    }
    // TODO: connect to rust

    // const status = await updateServerLoadout(loadout)

    // if (status) {
    //   toast(`Success! Updated loadout: ${values.name}`)
    //   queryClient.invalidateQueries({
    //     queryKey: [`${QueryKey.GetServerLoadout}-${existingConfig.name}`],
    //     refetchType: 'all',
    //   })
    //   setSheetOpen(() => false)
    // } else {
    //   toast('Use a different loadout name.')
    // }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl underline">Loadout Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="name"
                  autoFocus={existingConfig?.name === undefined}
                  {...field}
                  disabled={existingConfig?.name !== undefined}
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
              <FormLabel className="text-2xl underline">Startup.txt</FormLabel>
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
              <FormLabel className="text-2xl underline">Maplist.txt</FormLabel>
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
        <FormItem>
          <FormLabel className="text-2xl underline">ModList</FormLabel>
          <FormDescription>Which mods do you want enabled?</FormDescription>
        </FormItem>
        {existingConfig.mods.map((nameOfMod, index) => {
          // a dot will create an unwanted object
          let nameWithoutDots = nameOfMod.split('.').join('*')

          return (
            <FormField
              control={form.control}
              name={`mods.${nameWithoutDots}`}
              key={`serverMods-${nameOfMod}`}
              render={({ field }) => (
                <FormItem className="flex gap-4">
                  <FormLabel className="mt-1 text-xl">{nameOfMod}</FormLabel>
                  <FormControl className="h-6 w-6">
                    <Checkbox onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          )
        })}
        <FormField
          control={form.control}
          name="banlist"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl underline">Banlist.txt</FormLabel>
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
