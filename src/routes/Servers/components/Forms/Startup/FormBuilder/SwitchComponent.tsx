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
import { Switch } from '@/components/ui/switch'

export function SwitchComponent({
  form,
  label,
  keyName,
  sectionName,
}: {
  form: any
  label: any
  keyName: string
  sectionName: keyof StartupArgs | keyof LaunchArguments
}) {
  return (
    <FormField
      control={form.control}
      name={`${sectionName}.${keyName}`}
      render={({ field }) => (
        <FormItem className="flex gap-16">
          <div className="flex-1">
            <FormLabel className="text-lg">{label}</FormLabel>
            <FormDescription>
              {sectionName}.{keyName}
            </FormDescription>
          </div>

          <FormControl>
            <Switch {...field} checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
