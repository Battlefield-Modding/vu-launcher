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
import { useTranslation } from 'react-i18next'

export function SelectComponent({
  form,
  keyName,
  label,
  sectionName,
}: {
  form: any
  keyName: any
  label: string
  sectionName: keyof LaunchArguments
}) {
  const { t } = useTranslation()

  return (
    <FormField
      key={keyName}
      control={form.control}
      name={`${sectionName}.${keyName}`}
      render={({ field }) => (
        <FormItem className="flex">
          <div className="flex-1">
            <FormLabel className="text-lg">{label}</FormLabel>
            <FormDescription>
              {sectionName}.{keyName}
            </FormDescription>
          </div>

          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl className="ml-auto mr-0 w-32">
              <SelectTrigger>
                <SelectValue
                  placeholder={t('servers.loadouts.loadout.launchArgs.form.env.placeholder')}
                />
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
