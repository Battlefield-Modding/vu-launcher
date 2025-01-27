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
import { createServerLoadout } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { defaultServerConfig } from './Setup/defaultServerConfig'
import { LoadoutJSON_AndMods, QueryKey } from '@/config/config'
import { useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { Banlist } from './components/Forms/Banlist'
import { Maplist } from './components/Forms/Maplist'

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
  startup: z.object({
    admin: z.object({
      password: z.string(),
    }),
    vars: z.object({
      serverName: z.string(),
      gamePassword: z.string(),
      maxPlayers: z.number(),
    }),
  }),
  maplist: z.array(
    z.object({
      mapCode: z.string(),
      gameMode: z.string().min(1),
    }),
  ),
  mods: z.any().optional(),
  modlist: z.any().optional(),
  banlist: z.array(z.string()),
})

export function LoadoutForm({ setSheetOpen, mods }: { setSheetOpen: any; mods: string[] }) {
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultServerConfig },
  })

  function onlyIncludeSelectedMods(mods: { string: boolean }) {
    const correctedMods = []
    if (mods) {
      for (const [key, value] of Object.entries(mods)) {
        if (value) {
          // this is to undo the zod workaround of converting . to *
          let mod_name_with_dots = key.split('*').join('.')
          correctedMods.push(mod_name_with_dots)
        }
      }
    }
    return correctedMods
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let correctedMods = onlyIncludeSelectedMods(values.mods)

    const loadout: LoadoutJSON_AndMods = {
      ...values,
      mods: correctedMods,
    }

    console.log(loadout)

    setSubmitLoading(() => true)
    const status = await createServerLoadout(loadout)
    setSubmitLoading(() => false)

    if (status) {
      toast(`Success! Created loadout: ${values.name}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.ServerLoadouts],
        refetchType: 'all',
      })
      setSheetOpen(() => false)
    } else {
      toast('Use a different loadout name.')
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
              <FormLabel className="text-2xl underline">Loadout Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="name"
                  autoFocus={true}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
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

        {/* STARTUP SECTION */}
        <FormField
          control={form.control}
          name="startup.admin.password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl underline">RCON Password</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="name"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormControl>
              <FormDescription>For connecting to server through PROCON.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startup.vars.gamePassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl underline">Game Password</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="Game Password"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormControl>
              <FormDescription>Used by users to connect to your server.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'startup.vars.maxPlayers'}
          render={({ field }) => (
            <FormItem className="flex gap-4">
              <FormLabel className="text-md flex flex-col justify-center rounded-md bg-sidebar-foreground pl-2 pr-2 text-white">
                <code>Max Players</code>
              </FormLabel>

              <FormControl>
                <Input
                  type={'text'}
                  className="max-w-16"
                  placeholder={'defaultvalue'}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormControl>

              <FormDescription className="leading-10">Max playercount on server</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="startup.vars.serverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl underline">Server Name</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  placeholder="[Country][Main Mod] Clan"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Name showed in Server Browser. For Example: [US East][Funbots] ClanName
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* END STARTUP SECTION */}
        <FormItem>
          <FormLabel className="text-2xl underline">ModList</FormLabel>
          <FormDescription>Which Mods do you want installed?</FormDescription>
        </FormItem>
        {mods.map((nameOfMod) => {
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
                    <FormControl>
                      <Input
                        type={'checkbox'}
                        className="max-w-16"
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                          }
                        }}
                      />
                    </FormControl>
                  </FormControl>
                </FormItem>
              )}
            />
          )
        })}
        <Banlist form={form} />
        <Maplist form={form} />
        {submitLoading && <LoaderComponent />}
        <Button variant={'secondary'} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
