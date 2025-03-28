import { useTranslation } from 'react-i18next'
import { supportedLanguages } from '@/i18n'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const formSchema = z.object({
  language: z.string(),
})

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { language: supportedLanguages[0] },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose your language</FormLabel>
              <Select
                onValueChange={(e) => {
                  // TODO: make this part of user preferences
                  i18n.changeLanguage(e)
                  field.onChange(e)
                }}
                defaultValue={field.value}
              >
                <FormControl className="w-32">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your Language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supportedLanguages.map((x, index) => {
                    return (
                      <SelectItem value={x} key={`language-selector-${index}-${x}`}>
                        {x}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
