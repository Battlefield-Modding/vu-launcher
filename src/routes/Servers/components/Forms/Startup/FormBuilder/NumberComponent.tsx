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
      control={form.control}
      name={`${sectionName}.${keyValue}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{keyValue}</FormLabel>

          <FormDescription>{description}</FormDescription>

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

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
