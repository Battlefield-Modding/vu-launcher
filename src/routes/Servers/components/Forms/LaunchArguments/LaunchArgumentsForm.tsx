import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { editServerLoadout } from '@/api'
import { toast } from 'sonner'
import { LaunchArgumentFormBuilder } from './LaunchArgumentFormBuilder/LaunchArgumentFormBuilder'
import { LaunchArgumentsSearch } from './LaunchArgumentsSearch'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const formSchema = z.object({
  common: z
    .object({
      gamepath: z.string().optional(),
      perftrace: z.boolean().optional(),
      env: z.string().optional(),
      updateBranch: z.string().optional(),
      tracedc: z.boolean().optional(),
      cacert: z.string().optional(),
      // activateWithOrigin: z.object({ email: z.string(), password: z.string() }).optional(),
      // activateWithLSX: z.boolean().optional(),
      // activateWithEaToken: z.string().optional(),
      console: z.boolean().optional(),
      debuglog: z.boolean().optional(),
      trace: z.boolean().optional(),
      vextdebug: z.string().optional(),
      vexttrace: z.boolean().optional(),
    })
    .optional(),
  client: z
    .object({
      dwebui: z.boolean().optional(),
      serverJoinString: z.string().optional(),
      serverSpectateString: z.string().optional(),
      cefdebug: z.boolean().optional(),
      // credentials: z.object({ username: z.string(), password: z.string() }).optional(),
      disableUiHwAcceleration: z.boolean().optional(),
    })
    .optional(),
  server: z.object({
    high60: z.boolean().optional(),
    high120: z.boolean().optional(),
    headless: z.boolean().optional(),
    serverInstancePath: z.string().optional(),
    highResTerrain: z.boolean().optional(),
    disableTerrainInterpolation: z.boolean().optional(),
    skipChecksum: z.boolean().optional(),
    listen: z.string().optional(),
    mHarmonyPort: z.string().optional(),
    remoteAdminPort: z.string().optional(),
    unlisted: z.boolean().optional(),
    joinaddr: z.string().optional(),
    joinhost: z.string().optional(),
    noUpdate: z.boolean().optional(),
    maxPlayers: z.number({ coerce: true }).optional(),
  }),
})

export function LaunchArgumentForm({
  setSheetOpen,
  existingLoadout,
  searchRef,
}: {
  setSheetOpen: any
  existingLoadout: LoadoutJSON
  searchRef: any
}) {
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [filteredArgs, setFilteredArgs] = useState<{}>({ ...existingLoadout.launch })
  const { t } = useTranslation()

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: existingLoadout.launch,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = { ...existingLoadout, launch: values }

    setSubmitLoading(() => true)
    const status = await editServerLoadout(payload)
    setSubmitLoading(() => false)

    if (status) {
      toast(
        `${t('servers.loadouts.loadout.launchArgs.form.toast.success')} ${existingLoadout.name}`,
      )
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetLoadoutJSON],
        refetchType: 'all',
      })
      setSheetOpen(() => false)
    } else {
      toast(
        `${t('servers.loadouts.loadout.launchArgs.form.toast.failure')} ${existingLoadout.name}`,
      )
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx(
          'm-auto max-w-screen-md transition-all duration-700 ease-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        )}
      >
        <LaunchArgumentsSearch searchRef={searchRef} setFilteredArgs={setFilteredArgs} />

        <div className="flex flex-col gap-6 pt-32">
          {/* @ts-ignore */}
          <LaunchArgumentFormBuilder
            form={form}
            filteredArguments={filteredArgs}
            sectionNames={['common', 'client', 'server']}
          />
        </div>

        {submitLoading && <LoaderComponent />}
        <Button
          type="submit"
          className={clsx(
            'ml-auto mr-auto mt-8 flex transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
        >
          {t('servers.loadouts.loadout.launchArgs.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
