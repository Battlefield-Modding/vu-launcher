import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CreateLoadoutFormType } from '../../CreateLoadoutForm'

export function ModList({ form, mods }: { form: CreateLoadoutFormType; mods: string[] }) {
  return (
    <>
      <FormItem>
        <FormLabel className="text-2xl underline">ModList</FormLabel>
        <FormDescription>Choose your mods</FormDescription>
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
              <FormItem className="flex gap-4">
                <FormLabel className="mt-1 text-xl">{nameOfMod}</FormLabel>
                <FormControl className="h-6 w-6">
                  <FormControl>
                    <Input
                      type={'checkbox'}
                      className="max-w-16"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                        }
                      }}
                    />
                  </FormControl>
                </FormControl>
              </FormItem>
            )}
          />
        )
      })}
    </>
  )
}
