import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { editServerLoadout } from '@/api'
import { toast } from 'sonner'
import { defaultLaunchArguments } from './setup/LaunchArguments'
import { LaunchArgumentFormBuilder } from './LaunchArgumentFormBuilder/LaunchArgumentFormBuilder'

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
    requiredArgs: z.boolean(),
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
    maxPlayers: z.number().optional(),
  }),
})

export function LaunchArgumentForm({
  setSheetOpen,
  existingLoadout,
}: {
  setSheetOpen: any
  existingLoadout: LoadoutJSON
}) {
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [filteredArgs, setFilteredArgs] = useState<{}>({ ...existingLoadout.launch })

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
      toast(`Successfully updated Launch Arguments for ${existingLoadout.name}`)
      queryClient.invalidateQueries({ queryKey: [QueryKey.GetAllLoadoutJSON], refetchType: 'all' })
      setSheetOpen(() => false)
    } else {
      toast(`Error. Could not update Launch Arguments for ${existingLoadout.name}`)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const info = Object.keys(defaultLaunchArguments).map((x) => {
      // @ts-ignore
      const filtered_fields = Object.keys(defaultLaunchArguments[x])
        .filter((key) => key.toLowerCase().includes(e.target.value))
        .reduce((obj, key) => {
          // @ts-ignore
          obj[key] = defaultLaunchArguments[x][key]
          return obj
        }, {})

      return {
        name: x,
        values: filtered_fields,
      }
    })

    const combinedObject = {}
    info.forEach((x) => {
      // @ts-ignore
      combinedObject[x.name] = x.values
    })

    setFilteredArgs(() => combinedObject)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <input
          type="text"
          placeholder="Search for setting..."
          className="p-2 text-primary"
          onChange={handleChange}
          autoFocus={true}
        />

        <div className="flex flex-col gap-[2vw]">
          <LaunchArgumentFormBuilder
            form={form}
            filteredArguments={filteredArgs}
            sectionNames={['common', 'client', 'server']}
          />
        </div>

        {submitLoading && <LoaderComponent />}
        <Button variant="secondary" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
