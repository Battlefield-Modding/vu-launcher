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

export function CheckBoxComponent({
  form,
  label,
  keyName,
  defaultChecked,
  sectionName,
}: {
  form: any
  label: any
  keyName: string
  defaultChecked: boolean
  sectionName: keyof StartupArgs | keyof LaunchArguments
}) {
  return (
    <FormField
      control={form.control}
      name={`${sectionName}.${keyName}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{label}</FormLabel>
          <FormDescription>
            {sectionName}.{keyName}
          </FormDescription>

          <div className="flex items-center justify-end gap-2">
            <FormDescription>
              {sectionName}.{keyName}
            </FormDescription>
            <FormControl>
              <Input
                type={'checkbox'}
                className="w-5"
                defaultChecked={defaultChecked}
                {...field}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
