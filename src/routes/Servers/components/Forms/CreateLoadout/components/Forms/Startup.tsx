import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateLoadoutFormType } from '../../CreateLoadoutForm'

export function Startup({ form }: { form: CreateLoadoutFormType }) {
  return (
    <>
      <FormField
        control={form.control}
        name="startup.vars.serverName"
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">Set name showed in Server Browser</FormLabel>
              <FormDescription>vars.serverName</FormDescription>
            </div>
            <FormControl className="ml-auto mr-0">
              <Input
                type="text"
                placeholder="[Country][Main Mod] Clan"
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

      <FormField
        control={form.control}
        name="startup.vars.gamePassword"
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">Set server password</FormLabel>
              <FormDescription>vars.gamePassword</FormDescription>
            </div>
            <FormControl className="ml-auto mr-0">
              <Input
                type="text"
                placeholder="Game Password"
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

      <FormField
        control={form.control}
        name="startup.admin.password"
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">Set RCON password for Procon</FormLabel>
              <FormDescription>admin.password</FormDescription>
            </div>
            <FormControl className="ml-auto mr-0">
              <Input
                type="text"
                placeholder="RCON password"
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

      <FormField
        control={form.control}
        name={'startup.vars.maxPlayers'}
        render={({ field }) => (
          <FormItem className="flex">
            <div className="flex-1">
              <FormLabel className="text-xl">Set max playercount</FormLabel>
              <FormDescription>vars.maxPlayers</FormDescription>
            </div>

            <FormControl className="ml-auto mr-0">
              <Input
                type={'text'}
                className="max-w-16"
                placeholder={'64'}
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
    </>
  )
}
