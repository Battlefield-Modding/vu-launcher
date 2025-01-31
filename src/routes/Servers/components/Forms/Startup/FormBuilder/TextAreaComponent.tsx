import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { StartupArgs } from '../Setup/StartupTypes'
import { Textarea } from '@/components/ui/textarea'

export function TextAreaComponent({
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
      key={keyValue}
      control={form.control}
      name={`${sectionName}.${keyValue}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-md flex flex-col justify-center rounded-md leading-10 text-white">
            <code>{keyValue === 'password' ? 'password (RCON)' : keyValue}</code>
          </FormLabel>

          <FormControl>
            <Textarea placeholder={defaultvalue as string} {...field} rows={2} className="w-1/2" />
          </FormControl>

          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
