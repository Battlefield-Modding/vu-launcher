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
import { importLoadoutFromPath } from '@/api'
import { useState } from 'react'
import { LoadoutDragDrop } from './LoadoutDragDrop'
import { useQueryClient } from '@tanstack/react-query'
import { QueryKey } from '@/config/config'
import clsx from 'clsx'
import { LoaderComponent } from '@/components/LoaderComponent'

const formSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .refine(
      (value) =>
        /^[^\s^\x00-\x1f\\?*:"";<>|\/.][^\x00-\x1f\\?*:"";<>|\/]*[^\s^\x00-\x1f\\?*:"";<>|\/.]+$/g.test(
          value ?? '',
        ),
      "A loadout name can't contain any of the following characters\: \\ / : * ? \" < > | '",
    ),
})

export function UploadLoadoutForm({
  existingLoadoutNames,
  setSheetOpen,
}: {
  existingLoadoutNames: string[]
  setSheetOpen: (state: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [path, setPath] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (existingLoadoutNames.includes(values.name)) {
      toast('Loadout name already used. Pick another.')
      return
    }

    setSubmitLoading(() => true)
    const status = await importLoadoutFromPath(values.name, path)
    setSubmitLoading(() => false)

    if (status) {
      toast(`Imported loadout ${values.name} successfully!`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllLoadoutJSON],
        refetchType: 'all',
      })
      setSheetOpen(false)
    } else {
      toast('Invalid folder. Make sure you picked the server folder itself.')
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex h-full flex-col gap-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-2xl underline">Loadout Name?</FormLabel>
              <FormDescription>
                The nickname for this server loadout. Can't contain any of the following characters:
                \ / : * ? " {'<'} {'>'} | '
              </FormDescription>
              <FormControl>
                <Input type="text" placeholder="name" {...field} autoFocus={true} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadoutDragDrop setPath={setPath} />
        {path && <FormLabel>Will copy from: {path}</FormLabel>}

        {submitLoading && <LoaderComponent />}

        <Button
          type="submit"
          disabled={!path}
          className={clsx('m-auto w-1/2', path && 'bg-green-600 hover:bg-green-600/80')}
        >
          Submit
        </Button>
      </form>
    </Form>
  )
}
