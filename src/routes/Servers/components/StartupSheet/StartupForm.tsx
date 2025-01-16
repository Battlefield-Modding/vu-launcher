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
import { Textarea } from '@/components/ui/textarea'
import { Loadout, QueryKey } from '@/config/config'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import LoaderComponent from '@/components/LoaderComponent'
import { defaultStartupArguments, VarsDescriptions } from './DefaultStartupConfig'
import { Vars } from './StartupTypes'
import VarsFormComponents from './FormComponents/FormComponents'
import FormComponents from './FormComponents/FormComponents'

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
    '3dSpotting': z.boolean().optional(),
    miniMapSpotting: z.boolean().optional(),
    nameTag: z.boolean().optional(),
    '3pCam': z.boolean().optional(),
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
    unlockMode: z.any().optional(),
    premiumStatus: z.boolean().optional(),
  }),
  RM: z
    .object({
      setDevelopers: z.string(),
      setAdmins: z.string(),
      setLightAdmins: z.string(),
      serverInfo: z.string(),
      serverLicenseKey: z.string(),
      ingameBanner: z.string(),
      pingLimitEnable: z.boolean(),
      pingLimitInMs: z.number(),
      autoPerfEnabled: z.boolean(),
      autoPerfMaxPlayers: z.number(),
      tempReservedSlotsEnabled: z.boolean(),
      tempReservedSlotsRejoinTime: z.number(),
      defaultPreRoundTime: z.number(),
      setAutoBalancer: z.boolean(),
      battleCryLink: z.string(),
    })
    .optional(),
  vu: z.object({
    serverBanner: z.string().optional(),
  }),
  reservedSlots: z.object({
    add: z.string(),
  }),
})

export default function StartupForm({ setSheetOpen, mods }: { setSheetOpen: any; mods: string[] }) {
  const queryClient = useQueryClient()
  const [submitLoading, setSubmitLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultStartupArguments,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormComponents form={form} sectionName="admin" />
        <FormComponents form={form} sectionName="vars" />
        {/* <FormComponents form={form} sectionName="RM" /> */}
        <FormComponents form={form} sectionName="vu" />
        <FormComponents form={form} sectionName="reservedSlots" />

        {submitLoading && <LoaderComponent />}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
