import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { LaunchArguments } from '../../LaunchArguments/setup/LaunchArguments'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SelectComponent({
  form,
  keyValue,
  description,
  sectionName,
}: {
  form: any
  keyValue: any
  description: string
  sectionName: keyof LaunchArguments
}) {
  return (
    <FormField
      key={keyValue}
      control={form.control}
      name={`${sectionName}.${keyValue}`}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg">{keyValue}</FormLabel>
          <FormDescription>{description}</FormDescription>

          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl className="w-32">
              <SelectTrigger>
                <SelectValue placeholder="Select env" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="prod">prod</SelectItem>
              <SelectItem value="dev">dev</SelectItem>
            </SelectContent>
          </Select>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
