import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { StartupArgs } from '../Setup/StartupTypes'
import { Textarea } from '@/components/ui/textarea'
import { LaunchArguments } from '../../LaunchArguments/setup/LaunchArguments'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function TextAreaComponent({
  form,
  keyName,
  label,
  sectionName,
  index,
}: {
  form: any
  keyName: any
  label: string
  sectionName: keyof StartupArgs | keyof LaunchArguments
  index: number
}) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
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
          style={{ transitionDelay: visible ? `${index * 50}ms` : '0ms' }}
        >
          <FormLabel className="text-lg">{label}</FormLabel>

          <FormDescription>
            {sectionName}.{keyName}
          </FormDescription>

          <FormControl className="ml-auto mr-0">
            <Textarea placeholder={keyName as string} {...field} rows={2} className="max-w-full" />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  )
}
