import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFieldArray, useForm } from 'react-hook-form'
import { allMaps, RealityModGameModes } from './Setup/allMaps'
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

  const fieldArray = useFieldArray({ name: 'maplist', control: form.control })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="m-auto flex max-w-screen-md flex-col">
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
          {fieldArray.fields.map((x, index) => {
            return (
              <div className="flex flex-col gap-4" key={`maplist-${index}`}>
                <div className="flex gap-4">
                  <FormLabel className="mb-auto mt-auto text-xl">{index + 1}.&#41;</FormLabel>

                  <FormField
                    control={form.control}
                    name={`maplist.${index}.mapCode`}
                    key={`${x.id}-mapCode`}
                    render={({ field }) => (
                      <FormItem className="w-64">
                        <Select
                          onValueChange={(e) => {
                            clearGamemode(index)
                            console.log('Chosen Map Changed!')
                            field.onChange(e)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'servers.loadouts.loadout.maplist.form.mapPlaceholder',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {allMaps.map((x, index) => {
                              return (
                                <SelectItem value={x.mapCode} key={`chosen-map-${index}`}>
                                  [{x.mapCode}]: {x.displayName}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`maplist.${index}.gameMode`}
                    key={`${x.id}-gameMode`}
                    render={({ field }) => (
                      <FormItem className="w-64">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t(
                                  'servers.loadouts.loadout.maplist.form.gamemodePlaceholder',
                                )}
                              />
                            </SelectTrigger>
                          </FormControl>

                          <SelectContent>
                            {realityModActive &&
                              RealityModGameModes.map((x, index) => {
                                return (
                                  <SelectItem key={`chosen-gamemode-${index}`} value={x}>
                                    {x}
                                  </SelectItem>
                                )
                              })}

                            {!realityModActive &&
                              allMaps
                                .filter(
                                  (x) => x.mapCode === form.getValues(`maplist.${index}.mapCode`),
                                )[0]
                                ?.gameModes.map((x, index) => {
                                  return (
                                    <SelectItem key={`chosen-gamemode-${index}`} value={x}>
                                      {x}
                                    </SelectItem>
                                  )
                                })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
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
        <div className="mt-8 flex justify-center">
          <Button type="submit">{t('servers.loadouts.loadout.maplist.form.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}
