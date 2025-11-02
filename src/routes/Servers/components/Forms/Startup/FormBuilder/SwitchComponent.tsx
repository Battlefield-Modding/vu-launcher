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
import { useEffect, useState } from 'react'
import clsx from 'clsx'

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
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])

  return (
    <FormField
      control={form.control}
      name={`${sectionName}.${keyName}`}
      render={({ field }) => (
        <FormItem
          key={keyName}
          className={clsx(
            'flex gap-16 transition-all duration-700 ease-out',
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

          <FormControl>
            <Switch {...field} checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
