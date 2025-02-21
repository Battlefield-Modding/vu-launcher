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

          <FormDescription className="mr-0">
            {sectionName}.{keyName}
          </FormDescription>

          <FormControl className="ml-auto mr-0">
            <Input type="text" placeholder={keyName as string} {...field} className="w-1/2" />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
