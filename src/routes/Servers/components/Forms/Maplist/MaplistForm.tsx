import { Button } from '@/components/ui/button'
import { FormLabel, Form } from '@/components/ui/form'

import { useFieldArray, useForm } from 'react-hook-form'
import { Trash } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { editServerLoadout } from '@/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import { useTranslation } from 'react-i18next'
import clsx from 'clsx'
import { MapSelector } from './MapSelector'
import { GameModeSelector } from './GameModeSelector'

const formSchema = z.object({
  maplist: z.array(
    z.object({
      mapCode: z.string(),
      gameMode: z.string().min(1),
    }),
  ),
})

export function MaplistForm({
  setSheetOpen,
  loadout,
}: {
  setSheetOpen: (e: boolean) => void
  loadout: LoadoutJSON
}) {
  const [submitLoading, setSubmitLoading] = useState(false)
  const [realityModActive, SetRealityModActive] = useState(false)
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { maplist: loadout.maplist },
  })

  useEffect(() => {
    function isRealityModActive() {
      loadout.modlist?.forEach((mod) => {
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
  }, [SetRealityModActive, loadout])

  function clearGamemode(index: number) {
    form.resetField(`maplist.${index}.gameMode`)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const finalLoadout: LoadoutJSON = {
      ...loadout,
      maplist: values.maplist,
    }

    setSubmitLoading(() => true)
    const status = await editServerLoadout(finalLoadout)
    setSubmitLoading(() => false)

    if (status) {
      toast(`${t('servers.loadouts.loadout.maplist.form.toast.success')} ${loadout.name}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetLoadoutJSON],
        refetchType: 'all',
      })
      setSheetOpen(false)
    } else {
      toast(`${t('servers.loadouts.loadout.maplist.form.toast.failure')} ${loadout.name}`)
    }
  }

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  const fieldArray = useFieldArray({ name: 'maplist', control: form.control })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={clsx(
          'm-auto flex max-w-screen-md flex-col transition-all duration-700 ease-out',
          visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
        )}
      >
        {fieldArray.fields.length === 0 && (
          <Button
            variant={'constructive'}
            className="m-auto w-fit"
            onClick={(e) => {
              e.preventDefault()
              fieldArray.append({ mapCode: '', gameMode: '' })
            }}
          >
            {t('servers.loadouts.loadout.maplist.form.button.addFirstMap')}
          </Button>
        )}
        <div className="flex w-fit flex-col items-end gap-4">
          {fieldArray.fields.map((map, index) => {
            return (
              <div
                className={clsx(
                  'flex flex-col gap-4 transition-all duration-700 ease-out',
                  visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
                )}
                style={{ transitionDelay: visible ? `${100 * index}ms` : '0ms' }}
                key={`maplist-${index}`}
              >
                <div className="flex gap-4">
                  <FormLabel className="mb-auto mt-auto text-xl">{index + 1}.&#41;</FormLabel>

                  <MapSelector
                    form={form}
                    index={index}
                    clearGamemode={clearGamemode}
                    key={`${map.id}-mapCode`}
                  />

                  <GameModeSelector
                    form={form}
                    index={index}
                    realityModActive={realityModActive}
                    key={`${map.id}-gameMode`}
                  />

                  <div
                    className="flex hover:cursor-pointer hover:text-red-500"
                    onClick={() => {
                      fieldArray.remove(index)
                    }}
                  >
                    <Trash className="m-auto" />
                  </div>
                </div>

                {index === fieldArray.fields.length - 1 && (
                  <Button
                    variant={'constructive'}
                    className="ml-auto mr-0 w-fit"
                    onClick={(e) => {
                      e.preventDefault()
                      fieldArray.append({ mapCode: '', gameMode: '' })
                    }}
                  >
                    {t('servers.loadouts.loadout.maplist.form.button.addAnotherMap')}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
        {submitLoading && <LoaderComponent />}
        <div
          className={clsx(
            'mt-8 flex justify-center transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{ transitionDelay: visible ? `${100 * fieldArray.fields.length}ms` : '0ms' }}
        >
          <Button type="submit">{t('servers.loadouts.loadout.maplist.form.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}
