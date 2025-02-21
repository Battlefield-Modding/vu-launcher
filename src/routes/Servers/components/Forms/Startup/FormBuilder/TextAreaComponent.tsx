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
import { LaunchArguments } from '../../LaunchArguments/setup/LaunchArguments'

export function TextAreaComponent({
  form,
  keyName,
  defaultvalue,
  label,
  sectionName,
}: {
  form: any
  keyName: any
  defaultvalue: any
  label: string
  sectionName: keyof StartupArgs | keyof LaunchArguments
}) {
  return (
    <FormField
      key={keyName}
      control={form.control}
      name={`${sectionName}.${keyName}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{label}</FormLabel>

          <FormDescription>
            {sectionName}.{keyName}
          </FormDescription>

          <FormControl className="ml-auto mr-0">
            <Textarea placeholder={keyName as string} {...field} rows={2} className="max-w-full" />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
