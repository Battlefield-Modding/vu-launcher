import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { defaultStartupArguments } from './Setup/DefaultStartupConfig'
import { FormBuilder } from './FormBuilder/FormBuilder'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { editServerLoadout } from '@/api'
import { toast } from 'sonner'

const formSchema = z.object({
  admin: z.object({
    password: z.string(),
  }),
  vars: z.object({
    ranked: z.boolean().optional(),
    serverName: z.string(),
    gamePassword: z.string().optional(),
    autoBalance: z.boolean().optional(),
    roundStartPlayerCount: z.number().optional(),
    roundRestartPlayerCount: z.number().optional(),
    roundLockdownCountdown: z.number().optional(),
    serverMessage: z.string().optional(),
    friendlyFire: z.boolean().optional(),
    maxPlayers: z.number().optional(),
    serverDescription: z.string().optional(),
    killCam: z.boolean().optional(),
    miniMap: z.boolean().optional(),
    hud: z.boolean().optional(),
    crossHair: z.boolean().optional(),
    _3dSpotting: z.boolean().optional(),
    miniMapSpotting: z.boolean().optional(),
    nameTag: z.boolean().optional(),
    _3pCam: z.boolean().optional(),
    regenerateHealth: z.boolean().optional(),
    teamKillCountForKick: z.number().optional(),
    teamKillValueForKick: z.number().optional(),
    teamKillValuelncrease: z.number().optional(),
    teamKillValueDecreasePerSecond: z.number().optional(),
    teamKillKickForBan: z.number().optional(),
    idleTimeout: z.number().optional(),
    idleBanRounds: z.boolean().optional(),
    vehicleSpawnAllowed: z.boolean().optional(),
    vehicleSpawnDelay: z.number().optional(),
    soldierHealth: z.number().optional(),
    playerRespawnTime: z.number().optional(),
    playerManDownTime: z.number().optional(),
    bulletDamage: z.number().optional(),
    gameModeCounter: z.number().optional(),
    onlySquadLeaderSpawn: z.boolean().optional(),
    // unlockMode: z.any().optional(),
  }),
  // RM: z
  //   .object({
  //     setDevelopers: z.string(),
  //     setAdmins: z.string(),
  //     setLightAdmins: z.string(),
  //     serverInfo: z.string(),
  //     serverLicenseKey: z.string(),
  //     ingameBanner: z.string(),
  //     pingLimitEnable: z.boolean(),
  //     pingLimitInMs: z.number(),
  //     autoPerfEnabled: z.boolean(),
  //     autoPerfMaxPlayers: z.number(),
  //     tempReservedSlotsEnabled: z.boolean(),
  //     tempReservedSlotsRejoinTime: z.number(),
  //     defaultPreRoundTime: z.number(),
  //     setAutoBalancer: z.boolean(),
  //     battleCryLink: z.string(),
  //   })
  //   .optional(),
  vu: z.object({
    ColorCorrectionEnabled: z.boolean().optional(),
    DesertingAllowed: z.boolean().optional(),
    DestructionEnabled: z.boolean().optional(),
    HighPerformanceReplication: z.boolean().optional(),
    ServerBanner: z.string().optional(),
    SetTeamTicketCount: z.array(
      z.object({ teamId: z.string(), ticketCount: z.number({ coerce: true }) }),
    ),
    SquadSize: z.number().optional(),
    SunFlareEnabled: z.boolean().optional(),
    SuppressionMultiplier: z.number().optional(),
    FriendlyFireSuppression: z.boolean().optional(),
    TimeScale: z.number().optional(),
    VehicleDisablingEnabled: z.boolean().optional(),
    HttpAssetUrl: z.string().optional(),
    DisablePreRound: z.boolean().optional(),
    TeamActivatedMines: z.boolean().optional(),
    CorpseDamageEnabled: z.boolean().optional(),
  }),
  reservedSlots: z.array(z.string().optional()).optional(),
})

export function StartupForm({
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
  const [filteredArgs, setFilteredArgs] = useState<{}>({ ...existingLoadout.startup })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: existingLoadout.startup,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = { ...existingLoadout, startup: values }

    setSubmitLoading(() => true)
    const status = await editServerLoadout(payload)
    setSubmitLoading(() => false)

    if (status) {
      toast(`Successfully updated Startup for ${existingLoadout.name}`)
      queryClient.invalidateQueries({ queryKey: [QueryKey.GetAllLoadoutJSON], refetchType: 'all' })
      setSheetOpen(() => false)
    } else {
      toast(`Error. could not update Startup for ${existingLoadout.name}`)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const info = Object.keys(defaultStartupArguments).map((x) => {
      // @ts-ignore
      const filtered_fields = Object.keys(defaultStartupArguments[x])
        .filter((key) => key.toLowerCase().includes(e.target.value))
        .reduce((obj, key) => {
          // @ts-ignore
          obj[key] = defaultStartupArguments[x][key]
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="m-auto max-w-screen-md">
        <input
          type="text"
          placeholder={`Search Startup Config     [CTRL + F]`}
          className="fixed top-0 w-[720px] rounded-md border border-gray-500 bg-black p-2 focus:border-cyan-300 focus:outline-none focus:ring-0"
          onChange={handleChange}
          ref={searchRef}
        />

        <div className="flex flex-col gap-6 pt-12">
          <FormBuilder
            form={form}
            filteredArguments={filteredArgs}
            sectionNames={['admin', 'vars', 'vu', 'reservedSlots']}
          />
        </div>

        {submitLoading && <LoaderComponent />}
        <Button type="submit" className="mt-8">
          Submit
        </Button>
      </form>
    </Form>
  )
}
