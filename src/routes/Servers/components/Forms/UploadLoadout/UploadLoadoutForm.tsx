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
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
      toast(t('servers.loadouts.importLoadout.form.toast.nameCollision'))
      return
    }

    setSubmitLoading(() => true)
    const status = await importLoadoutFromPath(values.name, path)
    setSubmitLoading(() => false)

    if (status) {
      toast(`${t('servers.loadouts.importLoadout.form.toast.success')}: ${values.name}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllLoadoutJSON],
        refetchType: 'all',
      })
      setSheetOpen(false)
    } else {
      toast(t('servers.loadouts.importLoadout.form.toast.failure'))
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="m-auto flex max-w-screen-md flex-col gap-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex">
              <div className="flex-1">
                <FormLabel className="text-xl">
                  {t('servers.loadouts.importLoadout.form.nickname.title')}
                </FormLabel>
                <FormDescription>
                  {t('servers.loadouts.importLoadout.form.nickname.description')}
                </FormDescription>
              </div>

              <FormControl className="ml-auto mr-0 w-1/2">
                <Input
                  type="text"
                  placeholder={t('servers.loadouts.importLoadout.form.nickname.placeholder')}
                  {...field}
                  autoFocus={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <h2 className="mb-4 text-xl">
            {t('servers.loadouts.importLoadout.form.importPath.title')}
          </h2>
          <LoadoutDragDrop setPath={setPath} />
        </div>
        {path && (
          <FormLabel>
            {t('servers.loadouts.importLoadout.form.importPath.path')}: {path}
          </FormLabel>
        )}

        {submitLoading && <LoaderComponent />}

        <Button
          type="submit"
          disabled={!path}
          variant={'secondary'}
          className={clsx(
            'm-auto w-fit',
            path && 'bg-green-500 text-primary hover:bg-green-500/80',
          )}
        >
          {t('servers.loadouts.importLoadout.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
