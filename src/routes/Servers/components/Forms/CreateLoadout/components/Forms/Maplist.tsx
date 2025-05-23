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
import { useTranslation } from 'react-i18next'

export function Maplist({ form }: { form: CreateLoadoutFormType }) {
  const fieldArray = useFieldArray({ name: 'maplist', control: form.control })
  const { t } = useTranslation()

  function clearGamemode(index: number) {
    form.resetField(`maplist.${index}.gameMode`)
  }

  return (
    <div>
      <FormLabel className="text-xl">
        {t('servers.loadouts.createLoadout.form.maplist.title')}
      </FormLabel>
      <FormDescription className="mb-8">maplist.add</FormDescription>

      {fieldArray.fields.length === 0 && (
        <Button
          variant={'constructive'}
          className="mb-4 ml-auto mr-0"
          onClick={(e) => {
            e.preventDefault()
            fieldArray.append({ mapCode: '', gameMode: '' })
          }}
        >
          {t('servers.loadouts.createLoadout.form.maplist.addFirstMap')}
        </Button>
      )}
      <div className="ml-4 flex flex-col gap-4">
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
                          <SelectValue
                            placeholder={t(
                              'servers.loadouts.createLoadout.form.maplist.mapPlaceholder',
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
                              'servers.loadouts.createLoadout.form.maplist.gamemodePlaceholder',
                            )}
                          />
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
                  {t('servers.loadouts.createLoadout.form.maplist.addAnotherMap')}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
