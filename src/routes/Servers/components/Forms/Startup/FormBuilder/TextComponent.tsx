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
import { Input } from '@/components/ui/input'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function TextComponent({
  form,
  keyName,
  label,
  sectionName,
}: {
  form: any
  keyName: any
  label: string
  sectionName: keyof StartupArgs | keyof LaunchArguments
}) {
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
            'transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{ transitionDelay: visible ? '150ms' : '0ms' }}
        >
          <FormLabel className="text-lg">{label}</FormLabel>

          <FormDescription className="mr-0">
            {sectionName}.{keyName}
          </FormDescription>

          <FormControl className="ml-auto mr-0">
            <Input type="text" placeholder={keyName as string} {...field} className="w-1/2" />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
