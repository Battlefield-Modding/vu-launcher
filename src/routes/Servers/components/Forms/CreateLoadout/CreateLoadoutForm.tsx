import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, UseFormReturn } from 'react-hook-form'

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
import { GameMod, LoadoutJSON, QueryKey, routes } from '@/config/config'
import { useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { Banlist } from './components/Forms/Banlist'
import { Maplist } from './components/Forms/Maplist'
import { ModList } from './components/Forms/Modlist'
import { Startup } from './components/Forms/Startup'
import { defaultStartupArguments } from '../Startup/Setup/DefaultStartupConfig'
import { defaultLaunchArguments } from '../LaunchArguments/setup/LaunchArguments'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

const formSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(100)
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

export type CreateLoadoutFormType = UseFormReturn<
  {
    name: string
    startup: {
      admin: {
        password: string
      }
      vars: {
        serverName: string
        gamePassword: string
        maxPlayers: number
      }
    }
    maplist: {
      mapCode: string
      gameMode: string
    }[]
    banlist: string[]
    modlist?: any
  },
  any,
  undefined
>

export function CreateLoadoutForm({ setSheetOpen, mods }: { setSheetOpen: any; mods: GameMod[] }) {
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultServerConfig },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const correctedModlist: Array<GameMod> = []
    if (values.modlist && values.modlist.length > 0) {
      values.modlist.map((isEnabled: boolean, index: number) => {
        if (isEnabled) {
          correctedModlist.push(mods[index])
        }
      })
    }

    const correctedStartup = {
      admin: { ...defaultStartupArguments.admin, ...values.startup.admin },
      vars: { ...defaultStartupArguments.vars, ...values.startup.vars },
      vu: defaultStartupArguments.vu,
      RM: defaultStartupArguments.RM,
      reservedSlots: defaultStartupArguments.reservedSlots,
    }

    const loadout: LoadoutJSON = {
      ...values,
      modlist: correctedModlist,
      launch: defaultLaunchArguments,
      startup: correctedStartup,
    }

    setSubmitLoading(() => true)
    const status = await createServerLoadout(loadout)
    setSubmitLoading(() => false)

    if (status) {
      toast(`${t('servers.loadouts.createLoadout.form.toast.success')}: ${values.name}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllLoadoutNames],
        refetchType: 'all',
      })
      setSheetOpen(() => false)

      navigate(`${routes.SERVERS}/${loadout.name}`)
    } else {
      toast(t('servers.loadouts.createLoadout.form.toast.failure'))
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="m-auto flex max-w-screen-md flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex">
              <div className="flex-1">
                <FormLabel className="text-xl">
                  {t('servers.loadouts.createLoadout.form.nickname.title')}
                </FormLabel>
                <FormDescription>
                  {t('servers.loadouts.createLoadout.form.nickname.description')}
                </FormDescription>
              </div>
              <FormControl className="ml-auto mr-0">
                <Input
                  type="text"
                  placeholder={t('servers.loadouts.createLoadout.form.nickname.placeholder')}
                  autoFocus={true}
                  className="w-1/2"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Startup form={form} />
        <ModList form={form} mods={mods} />
        <Maplist form={form} />
        <Banlist form={form} alwaysAutoFocus={false} />
        {submitLoading && <LoaderComponent />}
        <Button type="submit" className="m-auto mt-6 w-fit">
          {t('servers.loadouts.createLoadout.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
