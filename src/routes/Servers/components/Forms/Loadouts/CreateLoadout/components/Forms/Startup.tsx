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
                placeholder={'64'}
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
    </>
  )
}
