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
  keyValue,
  defaultvalue,
  description,
  sectionName,
}: {
  form: any
  keyValue: any
  defaultvalue: any
  description: string
  sectionName: keyof StartupArgs | keyof LaunchArguments
}) {
  return (
    <FormField
      key={keyValue}
      control={form.control}
      name={`${sectionName}.${keyValue}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">
            {keyValue === 'password' ? 'password (RCON)' : keyValue}
          </FormLabel>

          <FormDescription>{description}</FormDescription>

          <FormControl>
            <Textarea
              placeholder={defaultvalue as string}
              {...field}
              rows={2}
              className="max-w-screen-md"
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
