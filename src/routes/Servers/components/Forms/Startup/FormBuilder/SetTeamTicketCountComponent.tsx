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

export function SetTeamTicketCountComponent({ form }: { form: any }) {
  const fieldArray = useFieldArray({ name: 'vu.SetTeamTicketCount', control: form.control })

  return (
    <div className="flex">
      <div className="flex-1">
        <FormLabel className="text-lg">Set tickets per team</FormLabel>
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
          <Plus /> Set Tickets
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
                  Set other team's tickets
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
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={'team1'}>Team1</SelectItem>
                        <SelectItem value={'team2'}>Team2</SelectItem>
                        <SelectItem value={'team3'}>Team3</SelectItem>
                        <SelectItem value={'team4'}>Team4</SelectItem>
                        <SelectItem value={'team5'}>Team5</SelectItem>
                        <SelectItem value={'team6'}>Team6</SelectItem>
                        <SelectItem value={'team7'}>Team7</SelectItem>
                        <SelectItem value={'team8'}>Team8</SelectItem>
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
