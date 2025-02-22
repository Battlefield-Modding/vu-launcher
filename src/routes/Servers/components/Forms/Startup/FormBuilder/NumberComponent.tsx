import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StartupArgs } from '../Setup/StartupTypes'
import { LaunchArguments } from '../../LaunchArguments/setup/LaunchArguments'

export function NumberComponent({
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

          <FormControl className="ml-auto mr-0">
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

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
