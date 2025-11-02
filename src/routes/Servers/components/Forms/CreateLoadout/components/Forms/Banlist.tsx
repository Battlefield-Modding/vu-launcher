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
import clsx from 'clsx'
import { Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

export function Banlist({
  form,
  alwaysAutoFocus,
  delay,
}: {
  form: any
  alwaysAutoFocus: boolean
  delay: number
}) {
  const fieldArray = useFieldArray({ name: 'banlist', control: form.control })
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <div
      className={clsx(
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      <FormLabel className="text-xl">
        {t('servers.loadouts.createLoadout.form.banlist.title')}
      </FormLabel>
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
          {t('servers.loadouts.createLoadout.form.banlist.button.addFirstPlayer')}
        </Button>
      )}
      <div className="ml-4 flex flex-col gap-4">
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
                          placeholder={t('servers.loadouts.createLoadout.form.banlist.placeholder')}
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
                  {t('servers.loadouts.createLoadout.form.banlist.button.addAnotherPlayer')}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
