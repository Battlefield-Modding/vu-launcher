import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { StartupArgs } from '../Setup/StartupTypes'
import { LaunchArguments } from '../../LaunchArguments/setup/LaunchArguments'
import { Input } from '@/components/ui/input'

export function TextComponent({
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
            <Input
              type="text"
              placeholder={defaultvalue as string}
              {...field}
              className="max-w-lg"
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
