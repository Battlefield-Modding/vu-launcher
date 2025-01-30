import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StartupArgs, Vars } from '../Setup/StartupTypes'

export function NumberComponent({
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
          <FormLabel className="text-md flex flex-col justify-center rounded-md leading-10 text-white">
            <code>{keyValue}</code>
          </FormLabel>

          <FormControl>
            <Input
              type={'text'}
              className="max-w-16"
              placeholder={defaultvalue}
              {...field}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
            />
          </FormControl>

          <FormDescription className="leading-10">{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
