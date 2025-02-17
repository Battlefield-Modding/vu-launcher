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
import { allMaps } from './Setup/allMaps'
import { Trash } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoadoutJSON, QueryKey } from '@/config/config'
import { editServerLoadout } from '@/api'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'

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
  const queryClient = useQueryClient()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { maplist: loadout.maplist },
  })

  function clearGamemode(index: number) {
    form.resetField(`maplist.${index}.gameMode`)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    const finalLoadout: LoadoutJSON = {
      ...loadout,
      maplist: values.maplist,
    }

    setSubmitLoading(() => true)
    const status = await editServerLoadout(finalLoadout)
    setSubmitLoading(() => false)

    if (status) {
      toast(`Success! Updated maps for ${loadout.name}`)
      queryClient.invalidateQueries({
        queryKey: [QueryKey.GetAllLoadoutJSON],
        refetchType: 'all',
      })
      setSheetOpen(false)
    } else {
      toast('Use a different loadout name.')
    }
  }

  const fieldArray = useFieldArray({ name: 'maplist', control: form.control })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {fieldArray.fields.length === 0 && (
          <Button
            variant={'constructive'}
            className="mb-4"
            onClick={(e) => {
              e.preventDefault()
              fieldArray.append({ mapCode: '', gameMode: '' })
            }}
          >
            Add Map
          </Button>
        )}
        <div className="flex flex-col gap-4">
          {fieldArray.fields.map((x, index) => {
            return (
              <div className="flex gap-4" key={`maplist-${index}`}>
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
                            <SelectValue placeholder="Select a map" />
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
                            <SelectValue placeholder="Select a gamemode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allMaps
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

                {index === fieldArray.fields.length - 1 && (
                  <Button
                    variant={'constructive'}
                    onClick={(e) => {
                      e.preventDefault()
                      fieldArray.append({ mapCode: '', gameMode: '' })
                    }}
                  >
                    Add another Map
                  </Button>
                )}
              </div>
            )
          })}
        </div>
        {submitLoading && <LoaderComponent />}
        <Button type="submit" variant={'secondary'}>
          Submit
        </Button>
      </form>
    </Form>
  )
}
