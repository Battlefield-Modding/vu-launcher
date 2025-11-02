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
import { useEffect, useState } from 'react'
import clsx from 'clsx'

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
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <FormField
      key={keyName}
      control={form.control}
      name={`${sectionName}.${keyName}`}
      render={({ field }) => (
        <FormItem
          className={clsx(
            'flex transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{ transitionDelay: visible ? '150ms' : '0ms' }}
        >
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
