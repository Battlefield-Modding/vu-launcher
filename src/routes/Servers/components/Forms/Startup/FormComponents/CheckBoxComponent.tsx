import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StartupArgs, Vars } from '../StartupTypes'

function CheckBoxComponent({
  form,
  keyValue,
  description,
  defaultChecked,
  sectionName,
}: {
  form: any
  keyValue: any
  description: string
  defaultChecked: boolean
  sectionName: keyof StartupArgs
}) {
  return (
    <FormField
      control={form.control}
      name={`${sectionName}.${keyValue as keyof Vars}`}
      render={({ field }) => (
        <FormItem className="flex">
          <FormLabel className="text-2xl leading-10 underline">{keyValue}</FormLabel>
          <FormControl>
            <Input
              type={'checkbox'}
              className="w-16"
              defaultChecked={defaultChecked}
              {...field}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
            />
          </FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default CheckBoxComponent
