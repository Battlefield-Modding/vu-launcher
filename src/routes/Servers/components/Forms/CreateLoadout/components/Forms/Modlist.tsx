import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { CreateLoadoutFormType } from '../../CreateLoadoutForm'
import { Switch } from '@/components/ui/switch'
import clsx from 'clsx'

export function ModList({ form, mods }: { form: CreateLoadoutFormType; mods: string[] }) {
  return (
    <div>
      <FormItem>
        <FormLabel className="text-xl">Set active mods</FormLabel>
        <FormDescription>modlist.add</FormDescription>
      </FormItem>
      <div className="flex h-fit max-h-80 flex-col gap-4 overflow-y-auto">
        {mods.map((nameOfMod, index) => {
          // a dot will create an unwanted object
          let nameWithoutDots = nameOfMod.split('.').join('*')

          return (
            <FormField
              control={form.control}
              name={`modlist.${nameWithoutDots}`}
              key={`serverMods-${nameOfMod}-${index}`}
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    'flex justify-between rounded-md rounded-l-none border-b border-secondary',
                    index % 2 == 0 ? 'opacity-80' : 'opacity-100',
                    field.value && 'border-green-500 text-green-500 opacity-100',
                  )}
                >
                  <FormLabel className="text-md mt-1">{nameOfMod}</FormLabel>
                  <FormControl>
                    <Switch {...field} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
