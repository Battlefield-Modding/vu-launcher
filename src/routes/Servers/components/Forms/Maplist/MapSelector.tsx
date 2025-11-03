import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { allMaps } from './Setup/allMaps'
import { useTranslation } from 'react-i18next'

export function MapSelector({
  form,
  index,
  clearGamemode,
}: {
  form: any
  index: number
  clearGamemode: (num: number) => void
}) {
  const { t } = useTranslation()
  return (
    <FormField
      control={form.control}
      name={`maplist.${index}.mapCode`}
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
                  placeholder={t('servers.loadouts.loadout.maplist.form.mapPlaceholder')}
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
  )
}
