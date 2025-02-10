import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import { useFieldArray } from 'react-hook-form'

export function ReservedSlotsComponent({ form }: { form: any }) {
  const fieldArray = useFieldArray({ name: 'reservedSlots', control: form.control })
  const [autoFocusIndex, setAutoFocusIndex] = useState(-1)

  return (
    <div>
      <FormLabel className="text-md rounded-md bg-sidebar-foreground p-1 pl-2 pr-2 leading-10 text-white">
        <code>Reserved Slots</code>
      </FormLabel>
      <FormDescription className="leading-9">
        List of players who have priority connecting to your server.
      </FormDescription>
      {fieldArray.fields.length === 0 && (
        <Button
          variant={'constructive'}
          className="mb-4"
          onClick={(e) => {
            e.preventDefault()
            fieldArray.append('')
          }}
        >
          Add Player
        </Button>
      )}
      <div className="flex flex-col gap-4">
        {fieldArray.fields.map((x, index) => {
          return (
            <div className="flex gap-4" key={`${x.id}`}>
              <FormField
                control={form.control}
                name={`reservedSlots.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        autoFocus={index === autoFocusIndex}
                        type={'text'}
                        placeholder={`Ent/Bksp Add/Remove`}
                        {...field}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            fieldArray.append('')
                            setAutoFocusIndex(() => index + 1)
                          }
                          if (e.key === 'Backspace' && field.value === '') {
                            setAutoFocusIndex(() => index - 1)
                            fieldArray.remove(index)
                          }
                        }}
                      />
                    </FormControl>

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
                    fieldArray.append('')
                  }}
                >
                  Add Player
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
