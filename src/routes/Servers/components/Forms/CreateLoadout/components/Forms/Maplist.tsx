import { Button } from '@/components/ui/button'
import {
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
import { useFieldArray } from 'react-hook-form'
import { allMaps } from '../../../Maplist/Setup/allMaps'
import { Trash } from 'lucide-react'
import { CreateLoadoutFormType } from '../../CreateLoadoutForm'

export function Maplist({ form }: { form: CreateLoadoutFormType }) {
  const fieldArray = useFieldArray({ name: 'maplist', control: form.control })

  function clearGamemode(index: number) {
    form.resetField(`maplist.${index}.gameMode`)
  }

  return (
    <div>
      <FormLabel className="text-md rounded-md bg-sidebar-foreground p-1 pl-2 pr-2 leading-10 text-white">
        <code>Maplist</code>
      </FormLabel>
      <FormDescription className="leading-9">List of maps for your server to run</FormDescription>

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
    </div>
  )
}
