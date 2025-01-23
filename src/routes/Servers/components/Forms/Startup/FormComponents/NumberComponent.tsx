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

function NumberComponent({
  form,
  keyValue,
  defaultvalue,
  description,
  sectionName,
}: {
  form: any
  keyValue: any
  defaultvalue: any
  description: string
  sectionName: keyof StartupArgs
}) {
  return (
    <FormField
      control={form.control}
      name={`${sectionName}.${keyValue as keyof Vars}`}
      render={({ field }) => (
        <FormItem className="flex gap-4">
          <FormLabel className="text-2xl leading-10 underline">{keyValue}</FormLabel>
          <FormControl>
            <Input
              type={'text'}
              className="w-16"
              placeholder={defaultvalue}
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

export default NumberComponent
