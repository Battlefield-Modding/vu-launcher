import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { CreateLoadoutFormType } from '../../CreateLoadoutForm'
import { Switch } from '@/components/ui/switch'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import { GameMod } from '@/config/config'
import { useEffect, useState } from 'react'

export function ModList({
  form,
  mods,
  delay,
}: {
  form: CreateLoadoutFormType
  mods: GameMod[]
  delay: number
}) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
  }, [])
  return (
    <div
      className={clsx(
        'transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      <FormItem>
        <FormLabel className="text-xl">
          {t('servers.loadouts.createLoadout.form.modlist.title')}
        </FormLabel>
        <FormDescription>modlist.add</FormDescription>
      </FormItem>
      <div className="flex h-fit max-h-80 flex-col gap-4 overflow-y-auto">
        {mods.map((gameMod, index) => {
          // a dot will create an unwanted object
          return (
            <FormField
              control={form.control}
              name={`modlist.${index}`}
              key={`serverMods-${gameMod.name}-${index}`}
              render={({ field }) => (
                <FormItem
                  className={clsx(
                    'ml-4 flex justify-between rounded-md rounded-l-none border-b border-secondary',
                    field.value && 'border-green-500 text-green-500 opacity-100',
                  )}
                >
                  <FormLabel className="text-md mt-1">
                    <div className="flex items-center gap-2">
                      <p>{gameMod.name}</p>
                      <code
                        className={clsx(
                          'text-md text-nowrap rounded-md pl-2 pr-2',
                          field.value && 'text-green-500',
                        )}
                      >
                        {gameMod.version}
                      </code>
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Switch {...field} checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          )
        })}
      </div>
    </div>
  )
}
