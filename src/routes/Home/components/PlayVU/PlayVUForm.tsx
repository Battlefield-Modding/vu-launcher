import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { QueryKey, STALE } from '@/config/config'
import { useQuery } from '@tanstack/react-query'
import { getServersAndAccounts, playVU } from '@/api'
import { Loader, Play } from 'lucide-react'
import DeleteVUCredentialDialog from './DeleteVUCredentialDialog'
import DeleteVUServerDialog from './DeleteVUServerDialog'
import { getCurrentWindow } from '@tauri-apps/api/window'

const FormSchema = z.object({
  accountIndex: z.string().optional(),
  serverIndex: z.string().optional(),
})

export default function PlayVUForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const { isPending, isError, data, error } = useQuery({
    queryKey: [QueryKey.PlayVUInformation],
    queryFn: getServersAndAccounts,
    staleTime: STALE.never,
  })

  if (isPending) {
    return (
      <div>
        <h1>LOADING accounts AND SERVERS</h1>
        <Loader />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md bg-red-600 pl-2 pr-2 text-xl leading-9 text-white">
        <h1>ERROR: No accounts/Servers Found</h1>
        <p>{error.message}</p>
      </div>
    )
  }

  async function onSubmit(formData: z.infer<typeof FormSchema>) {
    let accountIndex = 9001
    let serverIndex = 9001

    if (formData.accountIndex === undefined) {
      if (data && data.accounts.length > 0) {
        accountIndex = 0
      }
    } else {
      accountIndex = parseInt(formData.accountIndex)
    }

    if (formData.serverIndex !== undefined) {
      serverIndex = parseInt(formData.serverIndex)
    }

    const status = await playVU({ accountIndex, serverIndex })

    if (status) {
      toast('Starting VU...')
      setTimeout(() => {
        getCurrentWindow().minimize()
      }, 1500)
    } else {
      toast('Failed to start VU.')
    }
  }

  if (!data || typeof data !== 'object' || !data.accounts[0]) {
    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-64 flex-col gap-8">
        <h1>No accounts Found</h1>
        <Button variant={'constructive'} className="p-8 text-2xl" type="submit">
          <Play />
          PLAY
        </Button>
      </form>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-64 flex-col gap-8">
        <FormField
          control={form.control}
          name="accountIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VU Account</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={data.accounts[0].username} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent defaultValue={data.accounts[0].username}>
                  {data.accounts.map((x, index) => {
                    return (
                      <div className="flex" key={x.username}>
                        <SelectItem value={`${index}`}>{x.username}</SelectItem>
                        <DeleteVUCredentialDialog username={x.username} />
                      </div>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="serverIndex"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Auto-Join Server</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent defaultValue="None">
                  {data.servers.map((x, index) => {
                    return (
                      <div className="flex" key={x.nickname}>
                        <SelectItem value={`${index}`}>{x.nickname}</SelectItem>
                        <DeleteVUServerDialog server={x} />
                      </div>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button variant={'constructive'} className="p-8 text-2xl" type="submit">
          <Play />
          PLAY
        </Button>
      </form>
    </Form>
  )
}
