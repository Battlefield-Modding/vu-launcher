import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LoaderComponent } from '@/components/LoaderComponent'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { allMaps } from './Setup/allMaps'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const formSchema = z.object({
  map: z.object({
    mapCode: z.string(),
    gameMode: z.string().min(1),
  }),
})

export function MaplistForm({ setSheetOpen }: { setSheetOpen: any }) {
  const queryClient = useQueryClient()
  const [selectedMap, setSelectedMap] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { map: { mapCode: undefined, gameMode: undefined } },
  })

  function clearGamemode() {
    // normal form.resetField DOES NOT UPDATE SELECT visually
    form.setValue('map.gameMode', '')
  }

  const [submitLoading, setSubmitLoading] = useState(false)

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.table(values)
    // TODO: update the loadoutJSON, which will update maplist.txt
    // TODO: add ability to put multiple maps?
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex w-full max-w-lg gap-4">
          <FormField
            control={form.control}
            name="map.mapCode"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Map</FormLabel>
                <Select
                  onValueChange={(e) => {
                    setSelectedMap(() => e)
                    clearGamemode()
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
                <FormDescription>Will go to top of maplist.txt</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="map.gameMode"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>GameMode</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a gamemode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allMaps
                      .filter((x) => x.mapCode === selectedMap)[0]
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
        </div>
        <Button variant="secondary" type="submit">
          Submit
        </Button>
      </form>
    </Form>
  )
}
