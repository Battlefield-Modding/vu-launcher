import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { FormBuilder } from './FormBuilder/FormBuilder'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { editServerLoadout } from '@/api'
import { toast } from 'sonner'
import { StartupSearch } from './StartupSearch'
import { useTranslation } from 'react-i18next'
import { StartupArgs } from './Setup/StartupTypes'

const formSchema = z.object({
  admin: z.object({
    password: z.string(),
  }),
  vars: z.object({
    ranked: z.boolean().optional(),
    serverName: z.string(),
    gamePassword: z.string().optional(),
    autoBalance: z.boolean().optional(),
    roundStartPlayerCount: z.number({ coerce: true }).optional(),
    roundRestartPlayerCount: z.number({ coerce: true }).optional(),
    roundLockdownCountdown: z.number({ coerce: true }).optional(),
    serverMessage: z.string().optional(),
    friendlyFire: z.boolean().optional(),
    maxPlayers: z.number({ coerce: true }).optional(),
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
    teamKillCountForKick: z.number({ coerce: true }).optional(),
    teamKillValueForKick: z.number({ coerce: true }).optional(),
    teamKillValuelncrease: z.number({ coerce: true }).optional(),
    teamKillValueDecreasePerSecond: z.number({ coerce: true }).optional(),
    teamKillKickForBan: z.number({ coerce: true }).optional(),
    idleTimeout: z.number({ coerce: true }).optional(),
    idleBanRounds: z.boolean().optional(),
    vehicleSpawnAllowed: z.boolean().optional(),
    vehicleSpawnDelay: z.number({ coerce: true }).optional(),
    soldierHealth: z.number({ coerce: true }).optional(),
    playerRespawnTime: z.number({ coerce: true }).optional(),
    playerManDownTime: z.number({ coerce: true }).optional(),
    bulletDamage: z.number({ coerce: true }).optional(),
    gameModeCounter: z.number({ coerce: true }).optional(),
    onlySquadLeaderSpawn: z.boolean().optional(),
    // unlockMode: z.any().optional(),
  }),
  RM: z
    .object({
      setDevelopers: z.array(z.string()),
      setAdmins: z.array(z.string()),
      setLightAdmins: z.array(z.string()),
      serverInfo: z.string(),
      serverLicenseKey: z.string(),
      ingameBanner: z.string(),
      pingLimitEnable: z.boolean(),
      pingLimitInMs: z.number({ coerce: true }),
      autoPerfEnabled: z.boolean(),
      autoPerfMaxPlayers: z.number({ coerce: true }),
      tempReservedSlotsEnabled: z.boolean(),
      tempReservedSlotsRejoinTime: z.number({ coerce: true }),
      defaultPreRoundTime: z.number({ coerce: true }),
      setAutoBalancer: z.boolean(),
      battleCryLink: z.string(),
      enableEnemyLocalVoip: z.boolean(),
    })
    .optional(),
  vu: z.object({
    ColorCorrectionEnabled: z.boolean().optional(),
    DesertingAllowed: z.boolean().optional(),
    DestructionEnabled: z.boolean().optional(),
    HighPerformanceReplication: z.boolean().optional(),
    ServerBanner: z.string().optional(),
    SetTeamTicketCount: z.array(
      z.object({ teamId: z.string(), ticketCount: z.number({ coerce: true }) }),
    ),
    SquadSize: z.number({ coerce: true }).optional(),
    SunFlareEnabled: z.boolean().optional(),
    SuppressionMultiplier: z.number({ coerce: true }).optional(),
    FriendlyFireSuppression: z.boolean().optional(),
    TimeScale: z.number({ coerce: true }).optional(),
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
  const [realityModActive, SetRealityModActive] = useState(false)
  const { t } = useTranslation()

  const rm = existingLoadout.startup.RM

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...existingLoadout.startup,
      RM: rm === null || rm === undefined ? undefined : rm,
    },
  })

  useEffect(() => {
    function isRealityModActive() {
      existingLoadout.modlist?.forEach((mod) => {
        if (mod.name.toLowerCase() === 'realitymod') {
          if (mod.enabled) {
            SetRealityModActive(() => true)
            return
          } else {
            SetRealityModActive(() => false)
            return
          }
        }
      })
    }

    isRealityModActive()
  }, [SetRealityModActive, existingLoadout])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = { ...existingLoadout, startup: values }

    setSubmitLoading(() => true)
    const status = await editServerLoadout(payload)
    setSubmitLoading(() => false)

    if (status) {
      toast(`${t('servers.loadouts.loadout.startup.form.toast.success')} ${existingLoadout.name}`)
      queryClient.invalidateQueries({ queryKey: [QueryKey.GetLoadoutJSON], refetchType: 'all' })
      setSheetOpen(() => false)
    } else {
      toast(`${t('servers.loadouts.loadout.startup.form.toast.failure')} ${existingLoadout.name}`)
    }
  }

  const sectionNames = ['admin', 'vars', 'vu', 'reservedSlots'] as Array<keyof StartupArgs>
  if (existingLoadout && existingLoadout.modlist) {
    if (realityModActive) {
      if (!sectionNames.includes('RM')) {
        sectionNames.push('RM')
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="m-auto max-w-screen-md">
        <StartupSearch setFilteredArgs={setFilteredArgs} searchRef={searchRef} />

        <div className="flex flex-col gap-6 pt-16">
          {/* @ts-ignore */}
          <FormBuilder form={form} filteredArguments={filteredArgs} sectionNames={sectionNames} />
        </div>

        {submitLoading && <LoaderComponent />}
        <Button type="submit" className="mt-8">
          {t('servers.loadouts.loadout.startup.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
