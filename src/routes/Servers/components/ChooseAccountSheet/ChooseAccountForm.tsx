import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { UserCredential } from '@/config/config'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
  account0: z.boolean(),
  account1: z.boolean(),
  account2: z.boolean(),
  account3: z.boolean(),
})

export default function ChooseAccountForm({
  users,
  setSheetOpen,
  updateUsers,
}: {
  users: UserCredential[]
  setSheetOpen: (state: boolean) => void
  updateUsers: (info: number[]) => void
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      account0: true,
      account1: true,
      account2: false,
      account3: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const payload = []
    if (values.account0) {
      payload.push(0)
    }
    if (values.account1) {
      payload.push(1)
    }
    if (values.account2) {
      payload.push(2)
    }
    if (values.account3) {
      payload.push(3)
    }

    updateUsers(payload)
    setSheetOpen(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {users.map((x, index) => (
          <FormField
            control={form.control}
            name={`account${index}` as 'account0' | 'account1' | 'account2' | 'account3'}
            key={`serverStartupAccounts-${x.username}`}
            render={({ field }) => (
              <FormItem className="m-auto flex w-96 justify-between">
                <FormLabel className="text-2xl">{x.username}</FormLabel>
                <FormControl className="h-10 w-1/6">
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" className="m-auto w-96 p-8 text-2xl">
          Play
        </Button>
      </form>
    </Form>
  )
}
