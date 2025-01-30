import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StartupArgs, Vars } from '../Setup/StartupTypes'

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
  sectionName: keyof StartupArgs
}) {
  return (
    <FormField
      control={form.control}
      name={`${sectionName}.${keyValue as keyof Vars}`}
      render={({ field }) => (
        <FormItem className="flex flex-wrap">
          <FormLabel className="text-md flex flex-col justify-center rounded-md leading-10">
            <code>{keyValue}</code>
          </FormLabel>

          <FormControl>
            <Input
              type={'checkbox'}
              className="max-w-16"
              defaultChecked={defaultChecked}
              {...field}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
            />
          </FormControl>

          <FormDescription className="leading-8">{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
