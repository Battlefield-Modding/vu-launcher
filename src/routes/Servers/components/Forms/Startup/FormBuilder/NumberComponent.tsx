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
import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function NumberComponent({
  form,
  keyName,
  defaultvalue,
  label,
  sectionName,
  index,
}: {
  form: any
  keyName: any
  defaultvalue: any
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
      control={form.control}
      name={`${sectionName}.${keyName}`}
      render={({ field }) => (
        <FormItem
          className={clsx(
            'flex gap-16 transition-all duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
          )}
          style={{ transitionDelay: visible ? `${50 * index}ms` : '0ms' }}
        >
          <div className="flex-1">
            <FormLabel className="text-lg">{label}</FormLabel>

            <FormDescription>
              {sectionName}.{keyName}
            </FormDescription>
          </div>

          <FormControl className="ml-auto mr-0">
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
