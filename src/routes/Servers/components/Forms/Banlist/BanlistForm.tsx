import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { editServerLoadout } from '@/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { Banlist } from '../CreateLoadout/components/Forms/Banlist'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'

const formSchema = z.object({
  banlist: z.array(z.string().optional()),
})

export function BanlistForm({
  setSheetOpen,
  loadout,
}: {
  setSheetOpen: (e: boolean) => void
  loadout: LoadoutJSON
}) {
  const [submitLoading, setSubmitLoading] = useState(false)
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const initialList =
    loadout.banlist && loadout.banlist.length > 0 ? loadout.banlist : ['playerName']

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { banlist: initialList },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const finalLoadout: LoadoutJSON = {
      ...loadout,
      banlist: values.banlist as string[],
    }

    setSubmitLoading(() => true)
    const status = await editServerLoadout(finalLoadout)
    setSubmitLoading(() => false)

    if (status) {
      toast(`${t('servers.loadouts.loadout.banlist.form.toast.success')}: ${loadout.name}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetLoadoutJSON],
        refetchType: 'all',
      })
      setSheetOpen(false)
    } else {
      toast(`${t('servers.loadouts.loadout.banlist.form.toast.failure')}: ${loadout.name}`)
    }
  }

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx(
          'm-auto mt-8 flex max-w-screen-md flex-col items-center transition-all duration-700 ease-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        )}
      >
        <Banlist form={form} alwaysAutoFocus={true} delay={100} />
        {submitLoading && <LoaderComponent />}
        <Button
          type="submit"
          className={clsx(
            'm-auto mt-8 transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{ transitionDelay: visible ? '300ms' : '0ms' }}
        >
          {t('servers.loadouts.loadout.banlist.form.submit')}
        </Button>
      </form>
    </Form>
  )
}
