import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { allMaps, RealityModGameModes } from './Setup/allMaps'
import { useTranslation } from 'react-i18next'

export function GameModeSelector({
  form,
  index,
  realityModActive,
}: {
  form: any
  index: number
  realityModActive: boolean
}) {
  const { t } = useTranslation()
  return (
    <FormField
      control={form.control}
      name={`maplist.${index}.gameMode`}
      render={({ field }) => (
        <FormItem className="w-64">
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={t('servers.loadouts.loadout.maplist.form.gamemodePlaceholder')}
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
                  .filter((x) => x.mapCode === form.getValues(`maplist.${index}.mapCode`))[0]
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
  )
}
