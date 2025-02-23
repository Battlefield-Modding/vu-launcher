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
import { useFieldArray } from 'react-hook-form'

export function Banlist({ form, alwaysAutoFocus }: { form: any; alwaysAutoFocus: boolean }) {
  const fieldArray = useFieldArray({ name: 'banlist', control: form.control })

  return (
    <div>
      <FormLabel className="text-xl">Set banned players</FormLabel>
      <FormDescription className="mb-8">banlist.add</FormDescription>
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
            <div className="flex flex-col gap-4" key={`${x.id}`}>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name={`banlist.${index}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          autoFocus={index !== 0 || alwaysAutoFocus}
                          type={'text'}
                          placeholder={`Ent/Bksp Add/Remove`}
                          {...field}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              fieldArray.append('')
                            }
                            if (e.key === 'Backspace' && field.value === '') {
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
              </div>

              {index === fieldArray.fields.length - 1 && (
                <Button
                  variant={'constructive'}
                  className="w-fit"
                  onClick={(e) => {
                    e.preventDefault()
                    fieldArray.append('')
                  }}
                >
                  Add another to Banlist
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
