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
import { useTranslation } from 'react-i18next'
import { StartupArgs } from '../Setup/StartupTypes'

export function StringArrayComponent({
  form,
  keyName,
  defaultvalue,
  label,
  sectionName,
}: {
  form: any
  keyName: any
  defaultvalue: any
  label: string
  sectionName: keyof StartupArgs
}) {
  const fieldArray = useFieldArray({ name: `${sectionName}.${keyName}`, control: form.control })
  const [autoFocusIndex, setAutoFocusIndex] = useState(-1)
  const { t } = useTranslation()

  return (
    <div className="flex pb-10 pt-10">
      <div className="flex-1">
        <FormLabel className="text-lg">{label}</FormLabel>
        <FormDescription>
          {sectionName}.{keyName}
        </FormDescription>
      </div>

      {fieldArray.fields.length === 0 && (
        <Button
          variant={'constructive'}
          className="mb-4 ml-auto mr-0 flex"
          onClick={(e) => {
            e.preventDefault()
            fieldArray.append('')
          }}
        >
          {t('servers.loadouts.loadout.startup.form.reservedSlots.addFirstPlayer')}
        </Button>
      )}
      <div className="ml-auto mr-0 flex flex-col gap-4">
        {fieldArray.fields.map((x, index) => {
          return (
            <div className="ml-auto mr-0 flex gap-4" key={`${x.id}`}>
              {index === fieldArray.fields.length - 1 && (
                <Button
                  variant={'constructive'}
                  onClick={(e) => {
                    e.preventDefault()
                    fieldArray.append('')
                  }}
                >
                  {t('servers.loadouts.loadout.startup.form.reservedSlots.addAnotherPlayer')}
                </Button>
              )}
              <FormField
                control={form.control}
                name={`${sectionName}.${keyName}.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        autoFocus={index === autoFocusIndex}
                        type={'text'}
                        placeholder={t(
                          'servers.loadouts.loadout.startup.form.reservedSlots.placeholder',
                        )}
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
            </div>
          )
        })}
      </div>
    </div>
  )
}
