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
import { toast } from 'sonner'
import { editServerLoadout } from '@/api'
import { useQueryClient } from '@tanstack/react-query'
import { Textarea } from '@/components/ui/textarea'
import { Loadout, QueryKey } from '@/config/config'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'

const formSchema = z.object({
  startup: z.string().min(10).max(5000),
  maplist: z.string().min(10).max(5000),
  mods: z.any().optional(),
  banlist: z.string().min(0).max(5000),
})

export function EditLoadoutForm({
  setSheetOpen,
  existingConfig,
  modsInCache,
}: {
  setSheetOpen: any
  existingConfig: Loadout
  modsInCache: string[]
}) {
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)

  const activatedMods = existingConfig.modlist.split('\n')
  const allModsInLoadout = existingConfig.mods
  const installableMods = modsInCache

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...existingConfig,
      mods: {},
    },
  })

  function onlyIncludeSelectedMods(mods: { string: boolean }) {
    const correctedMods = []
    if (mods) {
      for (const [key, value] of Object.entries(mods)) {
        // untouched checkboxes are UNDEFINED
        // so if it's default checked, and undefined, well get fucked.
        if (value === undefined) {
          if (activatedMods.includes(key)) {
            console.log(
              `Activated mod [${key}] was undefined. This means we are going to keep it in the mod list!!!`,
            )
            correctedMods.push(key)
          }
        }

        if (value) {
          // this is to undo the zod workaround of converting . to *
          if (key.includes('*')) {
            let mod_name_with_dots = key.split('*').join('.')
            correctedMods.push(mod_name_with_dots)
          } else {
            correctedMods.push(key)
          }
        }
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
      name: existingConfig.name,
    }

    setSubmitLoading(() => true)
    const status = await editServerLoadout(loadout)
    setSubmitLoading(() => false)

    if (status) {
      toast(`Success! Updated loadout: ${existingConfig.name}`)
      queryClient.invalidateQueries({
        queryKey: [`${QueryKey.GetServerLoadout}-${existingConfig.name}`],
        refetchType: 'all',
      })
      setSheetOpen(() => false)
    } else {
      toast('Something went wrong updating loadout!')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="startup"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl underline">Startup.txt</FormLabel>
              <FormControl>
                <Textarea placeholder="Startup" {...field} rows={5} />
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
                <Textarea placeholder="Maplist" {...field} rows={3} />
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
          <FormLabel className="text-2xl underline">ModList - Existing Mods</FormLabel>
          <FormDescription>Which mods do you want enabled?</FormDescription>
        </FormItem>
        {allModsInLoadout.map((nameOfMod) => {
          return (
            <FormField
              control={form.control}
              name={`mods.${nameOfMod}`}
              key={`serverMods-${nameOfMod}`}
              render={({ field }) => (
                <FormItem className="flex gap-4">
                  <FormLabel className="mt-1 text-xl">{nameOfMod}</FormLabel>
                  <FormControl className="h-6 w-6">
                    <Checkbox
                      onCheckedChange={field.onChange}
                      defaultChecked={activatedMods.includes(nameOfMod)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          )
        })}
        <FormItem>
          <FormLabel className="text-2xl underline">ModList - Mod Cache</FormLabel>
          <FormDescription>
            Which new mods do you want installed from mod cache? NOTE: This will not overwrite an
            existing mod.
          </FormDescription>
        </FormItem>
        {installableMods.map((nameOfMod) => {
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
                <Textarea placeholder="Banlist" {...field} rows={3} />
              </FormControl>
              <FormDescription>A list of players to prevent from joining.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {submitLoading && <LoaderComponent />}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
