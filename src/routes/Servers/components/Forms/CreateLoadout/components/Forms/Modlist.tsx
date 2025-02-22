import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { CreateLoadoutFormType } from '../../CreateLoadoutForm'
import { Switch } from '@/components/ui/switch'
import clsx from 'clsx'

export function ModList({ form, mods }: { form: CreateLoadoutFormType; mods: string[] }) {
  return (
    <div className="flex flex-col gap-4">
      <FormItem>
        <FormLabel className="text-xl">Set active mods</FormLabel>
        <FormDescription>modlist.add</FormDescription>
      </FormItem>
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
                  field.value && 'border-green-500',
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
  )
}
