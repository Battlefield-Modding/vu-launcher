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
  keyValue,
  description,
  defaultChecked,
  sectionName,
}: {
  form: any
  keyValue: any
  description: string
  defaultChecked: boolean
  sectionName: keyof StartupArgs | keyof LaunchArguments
}) {
  return (
    <FormField
      control={form.control}
      name={`${sectionName}.${keyValue}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{keyValue}</FormLabel>

          <div className="flex items-center gap-2">
            <FormControl>
              <Input
                type={'checkbox'}
                className="max-w-5 bg-red-500"
                defaultChecked={defaultChecked}
                {...field}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
              />
            </FormControl>

            <FormDescription className="">{description}</FormDescription>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
