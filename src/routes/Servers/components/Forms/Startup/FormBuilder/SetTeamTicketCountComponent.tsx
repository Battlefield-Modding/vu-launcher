import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFieldArray } from 'react-hook-form'
import { Plus, Trash } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import clsx from 'clsx'

export function SetTeamTicketCountComponent({
  form,
  delayIndex,
}: {
  form: any
  delayIndex: number
}) {
  const fieldArray = useFieldArray({ name: 'vu.SetTeamTicketCount', control: form.control })
  const { t } = useTranslation()

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setTimeout(() => setVisible(true), 50)
  }, [])

  return (
    <div
      className={clsx(
        'flex transition-all duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
      style={{ transitionDelay: visible ? `${delayIndex * 50}ms` : '0ms' }}
    >
      <div className="flex-1">
        <FormLabel className="text-lg">
          {t('servers.loadouts.loadout.startup.form.setTeamTickets.title')}
        </FormLabel>
        <FormDescription className="leading-9">vu.SetTeamTicketCount</FormDescription>
      </div>

      {fieldArray.fields.length === 0 && (
        <Button
          variant={'constructive'}
          className="mb-4 ml-auto mr-0"
          onClick={(e) => {
            e.preventDefault()
            fieldArray.append({ teamId: 'team1', ticketCount: 100 })
            fieldArray.append({ teamId: 'team2', ticketCount: 100 })
          }}
        >
          <Plus /> {t('servers.loadouts.loadout.startup.form.setTeamTickets.button.setTickets')}
        </Button>
      )}
      <div className="flex flex-col gap-4">
        {fieldArray.fields.map((x, index) => {
          return (
            <div className="ml-auto mr-0 flex gap-4" key={`teamTicketCount-${index}`}>
              {index === fieldArray.fields.length - 1 && (
                <Button
                  variant={'constructive'}
                  onClick={(e) => {
                    e.preventDefault()
                    fieldArray.append({ teamId: `team${index + 2}`, ticketCount: 100 })
                  }}
                >
                  {t(
                    'servers.loadouts.loadout.startup.form.setTeamTickets.button.setOtherTeamTickets',
                  )}
                </Button>
              )}
              <FormField
                control={form.control}
                name={`vu.SetTeamTicketCount.${index}.teamId`}
                key={`${x.id}-ticketCount-teamId`}
                render={({ field }) => (
                  <FormItem className="w-32">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t(
                              'servers.loadouts.loadout.startup.form.setTeamTickets.placeholder',
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'team1'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team1')}
                        </SelectItem>
                        <SelectItem value={'team2'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team2')}
                        </SelectItem>
                        <SelectItem value={'team3'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team3')}
                        </SelectItem>
                        <SelectItem value={'team4'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team4')}
                        </SelectItem>
                        <SelectItem value={'team5'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team5')}
                        </SelectItem>
                        <SelectItem value={'team6'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team6')}
                        </SelectItem>
                        <SelectItem value={'team7'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team7')}
                        </SelectItem>
                        <SelectItem value={'team8'}>
                          {t('servers.loadouts.loadout.startup.form.setTeamTickets.team8')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`vu.SetTeamTicketCount.${index}.ticketCount`}
                key={`${x.id}-ticketCount-ticketCount`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormControl>
                      <Input
                        type={'number'}
                        className="max-w-24"
                        placeholder="200"
                        {...field}
                        onChange={(e) => {
                          console.log(e.target.value)
                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div
                className="flex hover:cursor-pointer hover:text-red-500"
                onClick={() => {
                  fieldArray.remove(index)
                }}
              >
                <Trash className="m-auto" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
